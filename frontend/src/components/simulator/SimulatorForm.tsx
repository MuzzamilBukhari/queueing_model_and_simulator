"use client";

import { Play, Loader2, FlaskConical } from "lucide-react";
import { FormEvent, useState } from "react";

interface SimulatorFormProps {
  onSubmit: (payload: {
    lambda: number;
    mu: number;
    numCustomers: number;
    seed?: number;
    model?: string;
    servers?: number;
  }) => void;
  isLoading: boolean;
}

export default function SimulatorForm({
  onSubmit,
  isLoading,
}: SimulatorFormProps) {
  const [model, setModel] = useState("M/M/1");
  const [servers, setServers] = useState(1);
  const [arrivalInputType, setArrivalInputType] = useState<"rate" | "mean">("rate");
  const [arrivalValue, setArrivalValue] = useState("2.65");
  const [serviceInputType, setServiceInputType] = useState<"rate" | "mean">("mean");
  const [serviceValue, setServiceValue] = useState("7.45");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedArrival = parseFloat(arrivalValue);
    const parsedService = parseFloat(serviceValue);
    const parsedN = 8; // Default hardcoded since input is removed
    const parsedSeed = undefined;

    if (isNaN(parsedArrival) || parsedArrival <= 0) return;
    if (isNaN(parsedService) || parsedService <= 0) return;

    const finalLambda = arrivalInputType === "rate" ? parsedArrival : 1 / parsedArrival;
    const finalMu = serviceInputType === "mean" ? parsedService : 1 / parsedService;

    onSubmit({
      lambda: finalLambda,
      mu: finalMu,
      numCustomers: parsedN,
      seed: parsedSeed,
      model,
      servers,
    });
  };

  const isValid =
    parseFloat(arrivalValue) > 0 &&
    parseFloat(serviceValue) > 0 &&
    servers >= 1;

  const isMultiServer = model === "M/M/s" || model === "M/G/s" || model === "G/G/s";

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <FlaskConical className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
            Simulation Setup
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Configure your queueing model simulation parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Queueing Model
            </label>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                if (!e.target.value.endsWith("/s") && servers !== 1) {
                  setServers(1);
                }
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50 appearance-none"
            >
              <option value="M/M/1">M/M/1</option>
              <option value="M/M/s">M/M/s</option>
              <option value="M/G/1">M/G/1</option>
              <option value="M/G/s">M/G/s</option>
              <option value="G/G/1">G/G/1</option>
              <option value="G/G/s">G/G/s</option>
            </select>
          </div>

          {/* Servers */}
          {isMultiServer && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Number of Servers (s)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={servers}
                onChange={(e) => setServers(parseInt(e.target.value) || 1)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>
          )}

          {/* Arrival Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Inter-Arrival Time
              </label>
            </div>
            <div className="flex rounded-xl shadow-sm">
              <select
                value={arrivalInputType}
                onChange={(e) => setArrivalInputType(e.target.value as "rate" | "mean")}
                disabled={isLoading}
                className="px-4 py-3 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700
                           bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:z-10
                           transition-all duration-200 disabled:opacity-50 appearance-none font-medium text-sm"
              >
                <option value="rate">Rate (λ)</option>
                <option value="mean">Mean Time</option>
              </select>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={arrivalValue}
                onChange={(e) => setArrivalValue(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. 2.65"
                className="flex-1 min-w-0 px-4 py-3 rounded-r-xl border border-slate-300 dark:border-slate-700
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Service Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Service Time
              </label>
            </div>
            <div className="flex rounded-xl shadow-sm">
              <select
                value={serviceInputType}
                onChange={(e) => setServiceInputType(e.target.value as "rate" | "mean")}
                disabled={isLoading}
                className="px-4 py-3 rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700
                           bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:z-10
                           transition-all duration-200 disabled:opacity-50 appearance-none font-medium text-sm"
              >
                <option value="rate">Rate (μ)</option>
                <option value="mean">Mean Time</option>
              </select>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={serviceValue}
                onChange={(e) => setServiceValue(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. 7.45"
                className="flex-1 min-w-0 px-4 py-3 rounded-r-xl border border-slate-300 dark:border-slate-700
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent
                           transition-all duration-200 disabled:opacity-50"
              />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-full py-4 px-8 rounded-2xl font-bold text-white text-base
                     bg-gradient-to-r from-brand-500 to-brand-600
                     hover:from-brand-600 hover:to-brand-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40
                     transition-all duration-300 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Simulation…
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Simulation
            </>
          )}
        </button>
      </form>
    </div>
  );
}
