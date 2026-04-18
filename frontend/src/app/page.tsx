"use client";

import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Menu, Settings, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import InputForm from "@/components/InputForm";
import ResultsPanel, { SimulationResults } from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";

function detectModel(
  arrivalDistribution: string,
  serviceDistribution: string,
  servers: number,
): string {
  if (!arrivalDistribution || !serviceDistribution || servers < 1) {
    return "";
  }

  const arrival =
    arrivalDistribution === "Poisson" || arrivalDistribution === "Exponential"
      ? "M"
      : "G";
  const service = serviceDistribution === "Exponential" ? "M" : "G";

  if (servers > 1) {
    return arrival === "M" && service === "M" ? "M/M/s" : "";
  }

  return `${arrival}/${service}/1`;
}

function resolveManualModel(selectedModel: string, servers: number): string {
  if (!selectedModel) {
    return "";
  }

  if (selectedModel === "MMs") {
    return servers === 1 ? "M/M/1" : "M/M/s";
  }

  if (selectedModel === "MGs") {
    return servers === 1 ? "M/G/1" : "";
  }

  if (selectedModel === "GGs") {
    return servers === 1 ? "G/G/1" : "";
  }

  return "";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "models" | "simulator">(
    "home",
  );
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [selectedModel, setSelectedModel] = useState("MMs");
  const [arrivalDistribution, setArrivalDistribution] = useState("Poisson");
  const [serviceDistribution, setServiceDistribution] = useState("Exponential");
  const [arrivalInputType, setArrivalInputType] = useState<
    "rate" | "meanInterArrival"
  >("rate");
  const [arrivalValue, setArrivalValue] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [serviceInputMode, setServiceInputMode] = useState<
    "meanSpread" | "minMax"
  >("meanSpread");
  const [serviceSpreadType, setServiceSpreadType] = useState<
    "variance" | "stdDev"
  >("variance");
  const [serviceSpreadValue, setServiceSpreadValue] = useState("");
  const [serviceMinTime, setServiceMinTime] = useState("");
  const [serviceMaxTime, setServiceMaxTime] = useState("");
  const [servers, setServers] = useState(1);
  const [ca, setCa] = useState("");
  const [cs, setCs] = useState("");
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleModeChange = (nextMode: "manual" | "auto") => {
    setMode(nextMode);

    if (nextMode !== "auto") {
      return;
    }

    if (arrivalDistribution === "Poisson") {
      setArrivalInputType("rate");
      return;
    }

    if (arrivalDistribution === "Exponential") {
      setArrivalInputType("meanInterArrival");
    }
  };

  const handleArrivalDistributionChange = (value: string) => {
    setArrivalDistribution(value);

    if (mode !== "auto") {
      return;
    }

    if (value === "Poisson") {
      setArrivalInputType("rate");
      return;
    }

    if (value === "Exponential") {
      setArrivalInputType("meanInterArrival");
    }
  };

  const effectiveModel =
    mode === "manual"
      ? resolveManualModel(selectedModel, servers)
      : detectModel(arrivalDistribution, serviceDistribution, servers);

  const runSimulation = async (e: FormEvent) => {
    e.preventDefault();

    if (!effectiveModel) {
      toast.error("Current selection does not map to a supported model.");
      return;
    }

    if (!arrivalValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    const parsedArrival = parseFloat(arrivalValue);
    const parsedServiceTime =
      serviceInputMode === "meanSpread" ? parseFloat(serviceTime) : undefined;
    const parsedServiceMin =
      serviceInputMode === "minMax" ? parseFloat(serviceMinTime) : undefined;
    const parsedServiceMax =
      serviceInputMode === "minMax" ? parseFloat(serviceMaxTime) : undefined;

    if (parsedArrival <= 0 || servers < 1) {
      toast.error("Inputs must be positive values");
      return;
    }

    if (mode === "manual" && selectedModel !== "MMs" && servers > 1) {
      toast.error(
        "MGs and GGs currently support only 1 server in this simulator.",
      );
      return;
    }

    if (serviceInputMode === "meanSpread") {
      if (!serviceTime || !parsedServiceTime || parsedServiceTime <= 0) {
        toast.error("Please provide a valid mean service time.");
        return;
      }
    } else {
      if (
        !serviceMinTime ||
        !serviceMaxTime ||
        !parsedServiceMin ||
        !parsedServiceMax ||
        parsedServiceMin <= 0 ||
        parsedServiceMax <= 0
      ) {
        toast.error("Please provide valid positive min and max service times.");
        return;
      }

      if (parsedServiceMax < parsedServiceMin) {
        toast.error(
          "Maximum service time must be greater than or equal to minimum service time.",
        );
        return;
      }
    }

    if (effectiveModel === "M/G/1" && serviceInputMode === "meanSpread") {
      if (!serviceSpreadValue || parseFloat(serviceSpreadValue) < 0) {
        toast.error(
          "Please provide a valid non-negative service variance or standard deviation for M/G/1.",
        );
        return;
      }
    }

    if (
      effectiveModel === "G/G/1" &&
      (!ca || !cs || parseFloat(ca) < 0 || parseFloat(cs) < 0)
    ) {
      toast.error(
        "Please provide valid non-negative Ca and Cs values for G/G/1.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5196";

      const payload: Record<string, unknown> = {
        autoDetectModel: mode === "auto",
        model:
          mode === "manual"
            ? selectedModel === "MMs"
              ? "M/M/s"
              : selectedModel === "MGs"
                ? "M/G/1"
                : selectedModel === "GGs"
                  ? "G/G/1"
                  : undefined
            : undefined,
        arrivalDistribution: mode === "auto" ? arrivalDistribution : undefined,
        serviceDistribution: mode === "auto" ? serviceDistribution : undefined,
        serviceTime:
          serviceInputMode === "meanSpread" ? parsedServiceTime : undefined,
        serviceMinTime:
          serviceInputMode === "minMax" ? parsedServiceMin : undefined,
        serviceMaxTime:
          serviceInputMode === "minMax" ? parsedServiceMax : undefined,
        servers,
        variance:
          effectiveModel === "M/G/1" &&
          serviceInputMode === "meanSpread" &&
          serviceSpreadType === "variance"
            ? parseFloat(serviceSpreadValue)
            : undefined,
        serviceStdDev:
          effectiveModel === "M/G/1" &&
          serviceInputMode === "meanSpread" &&
          serviceSpreadType === "stdDev"
            ? parseFloat(serviceSpreadValue)
            : undefined,
        ca: effectiveModel === "G/G/1" ? parseFloat(ca) : undefined,
        cs: effectiveModel === "G/G/1" ? parseFloat(cs) : undefined,
      };

      if (arrivalInputType === "rate") {
        payload.arrivalRate = parsedArrival;
      } else {
        payload.meanInterArrivalTime = parsedArrival;
      }

      const response = await fetch(`${apiUrl}/api/simulation/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Simulation failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const apiResults: SimulationResults = {
        model: data.model,
        rho: data.rho,
        Lq: data.lq,
        Wq: data.wq,
        L: data.l,
        W: data.w,
        P0: data.p0,
      };

      setResults(apiResults);
      setIsLoading(false);
      toast.success("Simulation completed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "Failed to connect to API. Make sure the backend is running.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {activeTab === "home"
                  ? "Overview"
                  : activeTab === "models"
                    ? "Queueing Models"
                    : "Simulator"}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === "home" ? (
            <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-12">
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-950 to-slate-900 shadow-2xl border border-white/10 p-8 sm:p-14 text-center text-white">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-brand-500 rounded-full blur-[120px] opacity-30 animate-pulse-slow pointer-events-none"></div>
                <div
                  className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-cyan-500 rounded-full blur-[120px] opacity-20 animate-pulse-slow pointer-events-none"
                  style={{ animationDelay: "1.5s" }}
                ></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white p-3 rounded-3xl shadow-[0_0_40px_rgba(20,184,166,0.3)] mb-8 animate-float">
                    <img
                      src="/logo.png"
                      alt="OptiQueue Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-100 via-white to-brand-100">
                    OptiQueue
                  </h1>
                  <p className="text-lg sm:text-2xl text-brand-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
                    Advanced Queueing Simulation & Analysis Platform
                  </p>
                  <div className="mt-10 px-8 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm sm:text-base font-medium shadow-xl">
                    Course Instructor:{" "}
                    <span className="font-bold text-brand-300 ml-2">
                      Dr. Shaihsta Raees
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div
                className="animate-slideUp"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-6 mb-10">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-center">
                    Team Members
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[
                    { name: "Muhammad Muzzamil Bukhari", seat: "B22110106054" },
                    { name: "Muhammad Nabeel Naveed", seat: "B22110106055" },
                    { name: "Sohaib Ahsan", seat: "B22110106074" },
                    { name: "Hasan Anas", seat: "B22110106077" },
                    { name: "Ayesha Muhammad Enayat", seat: "B22110106020" },
                    { name: "Omama Batool", seat: "B22110106065" },
                    { name: "Iqra Hasnain", seat: "B22110106031" },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {member.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            Seat
                          </span>
                          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                            {member.seat}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === "models" ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <InputForm
                mode={mode}
                onModeChange={handleModeChange}
                selectedModel={selectedModel}
                onSelectedModelChange={setSelectedModel}
                arrivalDistribution={arrivalDistribution}
                serviceDistribution={serviceDistribution}
                onArrivalDistributionChange={handleArrivalDistributionChange}
                onServiceDistributionChange={setServiceDistribution}
                servers={servers}
                onServersChange={setServers}
                arrivalInputType={arrivalInputType}
                onArrivalInputTypeChange={setArrivalInputType}
                arrivalValue={arrivalValue}
                onArrivalValueChange={setArrivalValue}
                serviceTime={serviceTime}
                onServiceTimeChange={setServiceTime}
                serviceInputMode={serviceInputMode}
                onServiceInputModeChange={setServiceInputMode}
                serviceSpreadType={serviceSpreadType}
                onServiceSpreadTypeChange={setServiceSpreadType}
                serviceSpreadValue={serviceSpreadValue}
                onServiceSpreadValueChange={setServiceSpreadValue}
                serviceMinTime={serviceMinTime}
                onServiceMinTimeChange={setServiceMinTime}
                serviceMaxTime={serviceMaxTime}
                onServiceMaxTimeChange={setServiceMaxTime}
                ca={ca}
                cs={cs}
                onCaChange={setCa}
                onCsChange={setCs}
                effectiveModel={effectiveModel}
                onSubmit={runSimulation}
                isLoading={isLoading}
              />

              {results && <ResultsPanel results={results} />}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center animate-slideUp">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-500 mb-6 group hover:scale-110 transition-transform cursor-pointer">
                  <Settings className="w-10 h-10 animate-spin-slow group-hover:animate-spin" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  Simulator Module
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                  Advanced simulation environment under development. Check back
                  soon for interactive features.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
