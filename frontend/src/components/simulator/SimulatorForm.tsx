"use client";

import { Play, Loader2, FlaskConical } from "lucide-react";
import { FormEvent, useState } from "react";

interface SimulatorFormProps {
  onSubmit: (payload: {
    lambda: number;
    mu: number;
    numCustomers: number;
    seed?: number;
  }) => void;
  isLoading: boolean;
}

export default function SimulatorForm({
  onSubmit,
  isLoading,
}: SimulatorFormProps) {
  const [lambda, setLambda] = useState("2.65");
  const [mu, setMu] = useState("7.45");
  const [numCustomers, setNumCustomers] = useState("8");
  const [seed, setSeed] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedLambda = parseFloat(lambda);
    const parsedMu = parseFloat(mu);
    const parsedN = parseInt(numCustomers);
    const parsedSeed = seed.trim() !== "" ? parseInt(seed) : undefined;

    if (isNaN(parsedLambda) || parsedLambda <= 0) return;
    if (isNaN(parsedMu) || parsedMu <= 0) return;
    if (isNaN(parsedN) || parsedN < 1 || parsedN > 100) return;

    onSubmit({
      lambda: parsedLambda,
      mu: parsedMu,
      numCustomers: parsedN,
      seed: parsedSeed,
    });
  };

  const isValid =
    parseFloat(lambda) > 0 &&
    parseFloat(mu) > 0 &&
    parseInt(numCustomers) >= 1 &&
    parseInt(numCustomers) <= 100;

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60">
      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <FlaskConical className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
            M/M/1 Simulator
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Poisson arrivals · Exponential service · Single server FCFS
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Lambda */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Arrival Rate λ (customers / min)
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={lambda}
              onChange={(e) => setLambda(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. 2.65"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Mu */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Mean Service Time μ (minutes)
            </label>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={mu}
              onChange={(e) => setMu(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. 7.45"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Used as: &minus;μ × ln(U)
            </p>
          </div>

          {/* N */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Number of Customers N
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={numCustomers}
              onChange={(e) => setNumCustomers(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. 8"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Max 100 customers
            </p>
          </div>

          {/* Seed */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Seed (optional)
            </label>
            <input
              type="number"
              step="1"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              disabled={isLoading}
              placeholder="Leave blank for random"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Fix seed to reproduce same results
            </p>
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
