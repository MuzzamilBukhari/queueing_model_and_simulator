"use client";

import { TrendingUp, Users, Clock, CircleDot } from 'lucide-react';

export interface SimulationResults {
  model: string;
  rho: number;
  Lq: number;
  Wq: number;
  L: number;
  W: number;
  P0?: number | null;
}

interface ResultsPanelProps {
  results: SimulationResults | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

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
      value: results.Wq.toFixed(4),
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
      value: results.W.toFixed(4),
      description: 'Average total time a customer spends in system',
      icon: Clock,
      color: 'green',
    },
  ];

  if (typeof results.P0 === 'number') {
    metrics.push({
      id: 'p0',
      title: 'P0 (Idle Probability)',
      value: `${(results.P0 * 100).toFixed(2)}%`,
      description: 'Probability that zero customers are in the system',
      icon: CircleDot,
      color: 'red',
    });
  }

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 animate-fadeIn">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {results.model} Queue Simulation Results
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`
                p-4 sm:p-6 rounded-lg border-2 transition-all duration-300
                hover:shadow-md hover:scale-[1.02]
                ${colorClasses[metric.color as keyof typeof colorClasses]}
              `}
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {metric.title}
                </h3>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 shrink-0" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                {metric.value}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
