"use client";

import { TrendingUp, Users, Clock, CircleDot, Activity } from 'lucide-react';

type TimeUnit = 'seconds' | 'minutes' | 'hours';

const timeUnitLabel: Record<TimeUnit, string> = {
  seconds: 'sec',
  minutes: 'min',
  hours: 'hr',
};

export interface SimulationResults {
  model: string;
  rho: number;
  Lq: number;
  Wq: number;
  L: number;
  W: number;
  P0?: number | null;
  timeUnit?: TimeUnit;
}

interface ResultsPanelProps {
  results: SimulationResults | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

  const selectedTimeUnit = results.timeUnit ?? 'minutes';

  const metrics = [
    {
      id: 'rho',
      title: 'Utilization (ρ)',
      value: `${(results.rho * 100).toFixed(2)}%`,
      description: 'Traffic intensity',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      id: 'lq',
      title: 'Mean Number in Queue (Lq)',
      value: results.Lq.toFixed(4),
      description: 'Average number of customers waiting in queue',
      icon: Users,
      color: 'orange',
    },
    {
      id: 'wq',
      title: 'Mean Wait in Queue (Wq)',
      value: `${results.Wq.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      description: 'Average time a customer spends waiting in queue',
      icon: Clock,
      color: 'blue',
    },
    {
      id: 'l',
      title: 'Mean Number in System (L)',
      value: results.L.toFixed(4),
      description: 'Average number of customers in the entire system',
      icon: Users,
      color: 'purple',
    },
    {
      id: 'w',
      title: 'Mean Wait in System (W)',
      value: `${results.W.toFixed(4)} ${timeUnitLabel[selectedTimeUnit]}`,
      description: 'Average total time a customer spends in system',
      icon: Clock,
      color: 'green',
    },
  ];

  if (typeof results.P0 === 'number') {
    metrics.push({
      id: 'p0',
      title: 'Idle Probability (P0)',
      value: `${(results.P0 * 100).toFixed(2)}%`,
      description: 'Probability that zero customers are in the system',
      icon: CircleDot,
      color: 'red',
    });
  }

  const colorClasses = {
    blue: 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-800/30 ring-1 ring-indigo-500/5 shadow-[0_0_20px_rgba(79,70,229,0.03)]',
    purple: 'bg-violet-50/50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-800/30 ring-1 ring-violet-500/5 shadow-[0_0_20px_rgba(139,92,246,0.03)]',
    green: 'bg-brand-50/50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 border-brand-200/50 dark:border-brand-800/30 ring-1 ring-brand-500/5 shadow-[0_0_20px_rgba(20,184,166,0.03)]',
    orange: 'bg-amber-50/50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/30 ring-1 ring-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.03)]',
    red: 'bg-rose-50/50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/30 ring-1 ring-rose-500/5 shadow-[0_0_20px_rgba(244,63,94,0.03)]',
  };

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60 animate-slideUp" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Simulation Results
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Calculated metrics for current parameters</p>
          </div>
        </div>
        
        <div className="px-5 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/20 text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-widest shadow-sm">
          MODEL: {results.model}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`
                group relative overflow-hidden backdrop-blur-md p-6 rounded-[2rem] border transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02]
                ${colorClasses[metric.color as keyof typeof colorClasses]}
              `}
              style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-current/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              
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
