"use client";

import { useState, FormEvent } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Menu, Settings, X } from "lucide-react";
import Sidebar, { AppTab } from "@/components/Sidebar";
import MathEnginePanel from "@/components/mathEngine/MathEnginePanel";
import InputForm from "@/components/InputForm";
import ResultsPanel, { SimulationResults } from "@/components/ResultsPanel";
import ThemeToggle from "@/components/ThemeToggle";
import SimulatorForm from "@/components/simulator/SimulatorForm";
import CdfTable from "@/components/simulator/CdfTable";
import TraceTable from "@/components/simulator/TraceTable";
import GanttChart from "@/components/simulator/GanttChart";
import SimulationSummary from "@/components/simulator/SimulationSummary";
import { runMM1Simulation, SimulateResponse } from "@/lib/simulatorApi";

type TimeUnit = "seconds" | "minutes" | "hours";

const minutesPerUnit: Record<TimeUnit, number> = {
  seconds: 1 / 60,
  minutes: 1,
  hours: 60,
};

function convertDurationToMinutes(value: number, unit: TimeUnit): number {
  return value * minutesPerUnit[unit];
}

function convertRateToPerMinute(value: number, unit: TimeUnit): number {
  return value / minutesPerUnit[unit];
}

function convertMinutesToUnit(value: number, unit: TimeUnit): number {
  return value / minutesPerUnit[unit];
}

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

  if (selectedModel === "M/M/s") {
    return servers >= 1 ? "M/M/s" : "";
  }

  return selectedModel;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [manualServerMode, setManualServerMode] = useState<"single" | "multi">("single");
  const [selectedModel, setSelectedModel] = useState("M/M/1");
  const [arrivalDistribution, setArrivalDistribution] = useState("Poisson");
  const [serviceDistribution, setServiceDistribution] = useState("Exponential");
  const [arrivalInputType, setArrivalInputType] = useState<
    "rate" | "meanInterArrival"
  >("rate");
  const [arrivalTimeUnit, setArrivalTimeUnit] = useState<TimeUnit>("minutes");
  const [arrivalValue, setArrivalValue] = useState("");
  const [serviceInputType, setServiceInputType] = useState<"rate" | "mean">("mean");
  const [serviceRateValue, setServiceRateValue] = useState("");
  const [serviceRateUnit, setServiceRateUnit] = useState<TimeUnit>("minutes");
  const [serviceTimeUnit, setServiceTimeUnit] = useState<TimeUnit>("minutes");
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
  // G/G/1 arrival spread state
  const [arrivalInputMode, setArrivalInputMode] = useState<"meanSpread" | "minMax">("meanSpread");
  const [arrivalSpreadType, setArrivalSpreadType] = useState<"variance" | "stdDev">("variance");
  const [arrivalSpreadValue, setArrivalSpreadValue] = useState("");
  const [arrivalMinTime, setArrivalMinTime] = useState("");
  const [arrivalMaxTime, setArrivalMaxTime] = useState("");
  // G/G/1 service spread state (replaces ca/cs direct entry)
  const [ggServiceInputMode, setGgServiceInputMode] = useState<"meanSpread" | "minMax">("meanSpread");
  const [ggServiceSpreadType, setGgServiceSpreadType] = useState<"variance" | "stdDev">("variance");
  const [ggServiceSpreadValue, setGgServiceSpreadValue] = useState("");
  const [ggServiceMinTime, setGgServiceMinTime] = useState("");
  const [ggServiceMaxTime, setGgServiceMaxTime] = useState("");
  const [resultTimeUnit, setResultTimeUnit] = useState<TimeUnit>("minutes");
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Simulator tab state
  const [simResults, setSimResults] = useState<SimulateResponse | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simLambda, setSimLambda] = useState(2.65);

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

  const handleManualServerModeChange = (value: "single" | "multi") => {
    setManualServerMode(value);

    if (value === "single") {
      setServers(1);
      if (selectedModel === "M/M/s") {
        setSelectedModel("M/M/1");
      } else if (selectedModel === "M/G/s") {
        setSelectedModel("M/G/1");
      } else if (selectedModel === "G/G/s") {
        setSelectedModel("G/G/1");
      }
      return;
    }

    if (servers < 2) {
      setServers(2);
    }

    if (selectedModel === "M/M/1") {
      setSelectedModel("M/M/s");
    } else if (selectedModel === "M/G/1") {
      setSelectedModel("M/G/s");
    } else if (selectedModel === "G/G/1") {
      setSelectedModel("G/G/s");
    }
  };

  const effectiveModel =
    mode === "manual"
      ? resolveManualModel(selectedModel, servers)
      : detectModel(arrivalDistribution, serviceDistribution, servers);

  const handleSimulate = async (payload: {
    lambda: number;
    mu: number;
    numCustomers: number;
    seed?: number;
  }) => {
    setSimLoading(true);
    setSimLambda(payload.lambda);
    try {
      const data = await runMM1Simulation(payload);
      setSimResults(data);
      toast.success("Simulation completed!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Simulation failed";
      toast.error(message);
    } finally {
      setSimLoading(false);
    }
  };

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
    const parsedServiceRate =
      serviceInputType === "rate" ? parseFloat(serviceRateValue) : undefined;
    const parsedServiceTime =
      serviceInputType === "mean" && serviceInputMode === "meanSpread"
        ? parseFloat(serviceTime)
        : undefined;
    const parsedServiceMin =
      serviceInputType === "mean" && serviceInputMode === "minMax"
        ? parseFloat(serviceMinTime)
        : undefined;
    const parsedServiceMax =
      serviceInputType === "mean" && serviceInputMode === "minMax"
        ? parseFloat(serviceMaxTime)
        : undefined;

    if (parsedArrival <= 0 || servers < 1) {
      toast.error("Inputs must be positive values");
      return;
    }

    if (
      mode === "manual" &&
      servers > 1 &&
      selectedModel !== "M/M/s" &&
      selectedModel !== "M/G/s" &&
      selectedModel !== "G/G/s"
    ) {
      toast.error(
        "Unsupported model selected for multi-server mode.",
      );
      return;
    }

    if (serviceInputType === "rate") {
      if (!serviceRateValue || !parsedServiceRate || parsedServiceRate <= 0) {
        toast.error("Please provide a valid positive service rate (μ).");
        return;
      }
    } else if (serviceInputMode === "meanSpread") {
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

    if (effectiveModel.startsWith("M/G/") && serviceInputType === "mean" && serviceInputMode === "meanSpread") {
      if (!serviceSpreadValue || parseFloat(serviceSpreadValue) < 0) {
        toast.error(
          "Please provide a valid non-negative service variance or standard deviation for M/G models.",
        );
        return;
      }
    }

    if (effectiveModel.startsWith("G/G/")) {
      const arrIsUniform = mode === "auto" && arrivalDistribution === "Uniform";
      const svcIsUniform = mode === "auto" && serviceDistribution === "Uniform";
      const effArrMode = arrIsUniform ? "minMax" : arrivalInputMode;
      const effSvcMode = svcIsUniform ? "minMax" : ggServiceInputMode;
      if (effArrMode === "minMax") {
        if (!arrivalMinTime || !arrivalMaxTime || parseFloat(arrivalMinTime) <= 0 || parseFloat(arrivalMaxTime) <= 0) {
          toast.error("Please provide valid min and max inter-arrival times.");
          return;
        }
      } else {
        if (!arrivalSpreadValue || parseFloat(arrivalSpreadValue) < 0) {
          toast.error("Please provide a valid non-negative arrival spread (variance or std dev) for G/G models.");
          return;
        }
      }
      if (effSvcMode === "minMax") {
        if (!ggServiceMinTime || !ggServiceMaxTime || parseFloat(ggServiceMinTime) <= 0 || parseFloat(ggServiceMaxTime) <= 0) {
          toast.error("Please provide valid min and max service times.");
          return;
        }
      } else {
        if (!ggServiceSpreadValue || parseFloat(ggServiceSpreadValue) < 0) {
          toast.error("Please provide a valid non-negative service spread (variance or std dev) for G/G models.");
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5196";

      const isMgUniform = effectiveModel.startsWith("M/G/") && mode === "auto" && serviceDistribution === "Uniform";
      // When rate (μ) is entered directly, convert to service time in minutes: 1 / (rate per minute)
      const normalizedServiceTime =
        serviceInputType === "rate" && parsedServiceRate
          ? 1 / convertRateToPerMinute(parsedServiceRate, serviceRateUnit)
          : serviceInputType === "mean" && !isMgUniform && serviceInputMode === "meanSpread" && parsedServiceTime
            ? convertDurationToMinutes(parsedServiceTime, serviceTimeUnit)
            : undefined;
      const normalizedServiceMin =
        isMgUniform && serviceMinTime
          ? convertDurationToMinutes(parseFloat(serviceMinTime), serviceTimeUnit)
          : serviceInputType === "mean" && serviceInputMode === "minMax" && parsedServiceMin
            ? convertDurationToMinutes(parsedServiceMin, serviceTimeUnit)
            : undefined;
      const normalizedServiceMax =
        isMgUniform && serviceMaxTime
          ? convertDurationToMinutes(parseFloat(serviceMaxTime), serviceTimeUnit)
          : serviceInputType === "mean" && serviceInputMode === "minMax" && parsedServiceMax
            ? convertDurationToMinutes(parsedServiceMax, serviceTimeUnit)
            : undefined;
      const spreadValue =
        effectiveModel.startsWith("M/G/") &&
          !isMgUniform &&
          serviceInputType === "mean" &&
          serviceInputMode === "meanSpread" &&
          serviceSpreadValue
          ? parseFloat(serviceSpreadValue)
          : undefined;
      const normalizedVariance =
        spreadValue !== undefined && serviceSpreadType === "variance"
          ? spreadValue * Math.pow(minutesPerUnit[serviceTimeUnit], 2)
          : undefined;
      const normalizedStdDev =
        spreadValue !== undefined && serviceSpreadType === "stdDev"
          ? spreadValue * minutesPerUnit[serviceTimeUnit]
          : undefined;

      // Compute Ca² and Cs² for G/G/1 from spread inputs
      let computedCa: number | undefined;
      let computedCs: number | undefined;
      if (effectiveModel.startsWith("G/G/")) {
        const arrIsUniform = mode === "auto" && arrivalDistribution === "Uniform";
        const svcIsUniform = mode === "auto" && serviceDistribution === "Uniform";
        const effArrMode = arrIsUniform ? "minMax" : arrivalInputMode;
        const effSvcMode = svcIsUniform ? "minMax" : ggServiceInputMode;
        // Arrival Ca²
        if (effArrMode === "minMax") {
          const aMin = convertDurationToMinutes(parseFloat(arrivalMinTime), arrivalTimeUnit);
          const aMax = convertDurationToMinutes(parseFloat(arrivalMaxTime), arrivalTimeUnit);
          const aMean = (aMin + aMax) / 2.0;
          const aVar = Math.pow(aMax - aMin, 2) / 12.0;
          computedCa = aVar / Math.pow(aMean, 2);
        } else {
          const arrSpreadVal = parseFloat(arrivalSpreadValue);
          const aMean = arrivalInputType === "rate"
            ? 1 / convertRateToPerMinute(parseFloat(arrivalValue), arrivalTimeUnit)
            : convertDurationToMinutes(parseFloat(arrivalValue), arrivalTimeUnit);
          const aVar = arrivalSpreadType === "variance"
            ? arrSpreadVal * Math.pow(minutesPerUnit[arrivalTimeUnit], 2)
            : Math.pow(arrSpreadVal * minutesPerUnit[arrivalTimeUnit], 2);
          computedCa = aVar / Math.pow(aMean, 2);
        }
        // Service Cs²
        if (effSvcMode === "minMax") {
          const sMin = convertDurationToMinutes(parseFloat(ggServiceMinTime), serviceTimeUnit);
          const sMax = convertDurationToMinutes(parseFloat(ggServiceMaxTime), serviceTimeUnit);
          const sMean = (sMin + sMax) / 2.0;
          const sVar = Math.pow(sMax - sMin, 2) / 12.0;
          computedCs = sVar / Math.pow(sMean, 2);
        } else {
          const svcSpreadVal = parseFloat(ggServiceSpreadValue);
          const sMean = serviceInputType === "rate"
            ? 1 / convertRateToPerMinute(parseFloat(serviceRateValue), serviceRateUnit)
            : convertDurationToMinutes(parseFloat(serviceTime), serviceTimeUnit);
          const sVar = ggServiceSpreadType === "variance"
            ? svcSpreadVal * Math.pow(minutesPerUnit[serviceTimeUnit], 2)
            : Math.pow(svcSpreadVal * minutesPerUnit[serviceTimeUnit], 2);
          computedCs = sVar / Math.pow(sMean, 2);
        }
      }

      const payload: Record<string, unknown> = {
        autoDetectModel: mode === "auto",
        model:
          mode === "manual"
            ? selectedModel === "M/M/1" || selectedModel === "M/M/s"
              ? "M/M/s"
              : selectedModel === "M/G/1" || selectedModel === "M/G/s"
                ? servers > 1
                  ? "M/G/s"
                  : "M/G/1"
                : selectedModel === "G/G/1" || selectedModel === "G/G/s"
                  ? servers > 1
                    ? "G/G/s"
                    : "G/G/1"
                  : undefined
            : undefined,
        arrivalDistribution: mode === "auto" ? arrivalDistribution : undefined,
        serviceDistribution: mode === "auto" ? serviceDistribution : undefined,
        serviceTime:
          (!isMgUniform && serviceInputMode === "meanSpread") ? normalizedServiceTime : undefined,
        serviceMinTime:
          (isMgUniform || serviceInputMode === "minMax") ? normalizedServiceMin : undefined,
        serviceMaxTime:
          (isMgUniform || serviceInputMode === "minMax") ? normalizedServiceMax : undefined,
        servers,
        variance:
          effectiveModel.startsWith("M/G/") &&
            serviceInputMode === "meanSpread" &&
            serviceSpreadType === "variance"
            ? normalizedVariance
            : undefined,
        serviceStdDev:
          effectiveModel.startsWith("M/G/") &&
            serviceInputMode === "meanSpread" &&
            serviceSpreadType === "stdDev"
            ? normalizedStdDev
            : undefined,
        ca: effectiveModel.startsWith("G/G/") ? computedCa : undefined,
        cs: effectiveModel.startsWith("G/G/") ? computedCs : undefined,
      };

      if (arrivalInputType === "rate") {
        payload.arrivalRate = convertRateToPerMinute(parsedArrival, arrivalTimeUnit);
      } else {
        payload.meanInterArrivalTime = convertDurationToMinutes(
          parsedArrival,
          arrivalTimeUnit,
        );
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
        Wq: convertMinutesToUnit(data.wq, resultTimeUnit),
        L: data.l,
        W: convertMinutesToUnit(data.w, resultTimeUnit),
        P0: data.p0,
        timeUnit: resultTimeUnit,
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
                    : activeTab === "simulator"
                      ? "Simulator"
                      : "Math Engine"}
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
              <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-brand-900 via-brand-950 to-slate-900 shadow-2xl border border-white/10 p-8 sm:p-14 text-center text-white">
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
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-r from-brand-100 via-white to-brand-100">
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
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest text-center">
                    Team Members
                  </h2>
                  <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
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
                      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-brand-500/10 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
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
          ) : activeTab === "mathengine" ? (
            <div className="max-w-[1400px] mx-auto -m-4 sm:-m-6 lg:-m-8">
              <MathEnginePanel />
            </div>
          ) : activeTab === "models" ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <InputForm
                mode={mode}
                onModeChange={handleModeChange}
                manualServerMode={manualServerMode}
                onManualServerModeChange={handleManualServerModeChange}
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
                arrivalTimeUnit={arrivalTimeUnit}
                onArrivalTimeUnitChange={setArrivalTimeUnit}
                arrivalValue={arrivalValue}
                onArrivalValueChange={setArrivalValue}
                serviceInputType={serviceInputType}
                onServiceInputTypeChange={setServiceInputType}
                serviceRateValue={serviceRateValue}
                onServiceRateValueChange={setServiceRateValue}
                serviceRateUnit={serviceRateUnit}
                onServiceRateUnitChange={setServiceRateUnit}
                serviceTimeUnit={serviceTimeUnit}
                onServiceTimeUnitChange={setServiceTimeUnit}
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
                arrivalInputMode={arrivalInputMode}
                onArrivalInputModeChange={setArrivalInputMode}
                arrivalSpreadType={arrivalSpreadType}
                onArrivalSpreadTypeChange={setArrivalSpreadType}
                arrivalSpreadValue={arrivalSpreadValue}
                onArrivalSpreadValueChange={setArrivalSpreadValue}
                arrivalMinTime={arrivalMinTime}
                onArrivalMinTimeChange={setArrivalMinTime}
                arrivalMaxTime={arrivalMaxTime}
                onArrivalMaxTimeChange={setArrivalMaxTime}
                ggServiceInputMode={ggServiceInputMode}
                onGgServiceInputModeChange={setGgServiceInputMode}
                ggServiceSpreadType={ggServiceSpreadType}
                onGgServiceSpreadTypeChange={setGgServiceSpreadType}
                ggServiceSpreadValue={ggServiceSpreadValue}
                onGgServiceSpreadValueChange={setGgServiceSpreadValue}
                ggServiceMinTime={ggServiceMinTime}
                onGgServiceMinTimeChange={setGgServiceMinTime}
                ggServiceMaxTime={ggServiceMaxTime}
                onGgServiceMaxTimeChange={setGgServiceMaxTime}
                resultTimeUnit={resultTimeUnit}
                onResultTimeUnitChange={setResultTimeUnit}
                effectiveModel={effectiveModel}
                onSubmit={runSimulation}
                isLoading={isLoading}
              />

              {results && <ResultsPanel results={results} />}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
              <SimulatorForm onSubmit={handleSimulate} isLoading={simLoading} />

              {simResults && (
                <>
                  <SimulationSummary results={simResults} />
                  <GanttChart segments={simResults.ganttSegments} />
                  <TraceTable customers={simResults.customers} />
                  <CdfTable rows={simResults.cdfTable} lambda={simLambda} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
