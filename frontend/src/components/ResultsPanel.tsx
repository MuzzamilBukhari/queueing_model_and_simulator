"use client";

import { TrendingUp, Users, Clock, Activity, Coffee } from 'lucide-react';

export interface SimulationResults {
  lambda: number;     // Arrival rate (λ)
  mu: number;         // Service rate (μ)
  rho: number;        // Utilization (ρ)
  Lq: number;         // Mean number in queue
  Wq: number;         // Mean wait in queue
  L: number;          // Mean number in system
  W: number;          // Mean wait in system
  idleProbability: number; // Probability server is idle
}

interface ResultsPanelProps {
  results: SimulationResults | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) return null;

  const metrics = [
    {
      id: 'lambda',
      title: 'Arrival Rate (λ)',
      value: results.lambda.toFixed(4),
      description: 'Average number of arrivals per time unit',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      id: 'mu',
      title: 'Service Rate (μ)',
      value: results.mu.toFixed(4),
      description: 'Average number of services per time unit',
      icon: Activity,
      color: 'green',
    },
    {
      id: 'rho',
      title: 'Utilization (ρ)',
      value: `${(results.rho * 100).toFixed(2)}%`,
      description: 'Percentage of time the server is busy',
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
    {
      id: 'idle',
      title: 'Idle Probability',
      value: `${(results.idleProbability * 100).toFixed(2)}%`,
      description: 'Probability that the server is idle',
      icon: Coffee,
      color: 'red',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        M/M/1 Queue Simulation Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className={`
                p-6 rounded-lg border-2 transition-all duration-300
                hover:shadow-md hover:scale-[1.02]
                ${colorClasses[metric.color as keyof typeof colorClasses]}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {metric.title}
                </h3>
                <Icon className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-3xl font-bold mb-2">
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
