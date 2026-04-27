"use client";

import {
  Clock,
  Timer,
  Hourglass,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";
import { SimulateResponse } from "@/lib/simulatorApi";

interface SimulationSummaryProps {
  results: SimulateResponse;
}

export default function SimulationSummary({ results }: SimulationSummaryProps) {
  const metrics = [
    {
      title: "Avg Interarrival Time",
      value: `${results.avgInterarrivalTime.toFixed(4)} min`,
      description: "Average time between consecutive arrivals",
      icon: RefreshCw,
      color: "blue",
    },
    {
      title: "Avg Service Time",
      value: `${results.avgServiceTime.toFixed(4)} min`,
      description: "Average time server spends on each customer",
      icon: Timer,
      color: "violet",
    },
    {
      title: "Avg Wait Time",
      value: `${results.avgWaitTime.toFixed(4)} min`,
      description: "Average time a customer waits in queue",
      icon: Hourglass,
      color: "rose",
    },
    {
      title: "Avg Response Time",
      value: `${results.avgResponseTime.toFixed(4)} min`,
      description: "Average time from arrival until service begins",
      icon: Clock,
      color: "amber",
    },
    {
      title: "Avg Turnaround Time",
      value: `${results.avgTurnaroundTime.toFixed(4)} min`,
      description: "Average total time in system (wait + service)",
      icon: Activity,
      color: "green",
    },
    {
      title: "Server Utilization (ρ)",
      value: `${(results.serverUtilization * 100).toFixed(2)}%`,
      description: "Fraction of time the server was busy",
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/30",
    violet:
      "bg-violet-50/50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30",
    rose: "bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30",
    amber:
      "bg-amber-50/50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30",
    green:
      "bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 border-brand-200/50 dark:border-brand-800/30",
    purple:
      "bg-violet-50/50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30",
  };

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Performance Measures
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            M/M/1 Simulation Results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden backdrop-blur-md p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] ${colorClasses[metric.color]}`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-current/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150" />

              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">
                  {metric.title}
                </h3>
                <Icon className="w-5 h-5 opacity-80 shrink-0 transform group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
                {metric.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
