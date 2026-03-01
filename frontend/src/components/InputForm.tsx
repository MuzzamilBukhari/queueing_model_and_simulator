"use client";

import { Play, Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

interface InputFormProps {
  meanInterarrivalTime: string;
  meanServiceTime: string;
  onMeanInterarrivalTimeChange: (value: string) => void;
  onMeanServiceTimeChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  selectedModel: string;
}

export default function InputForm({
  meanInterarrivalTime,
  meanServiceTime,
  onMeanInterarrivalTimeChange,
  onMeanServiceTimeChange,
  onSubmit,
  isLoading,
  selectedModel,
}: InputFormProps) {
  const isValid = selectedModel && meanInterarrivalTime && meanServiceTime && parseFloat(meanInterarrivalTime) > 0 && parseFloat(meanServiceTime) > 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Input Parameters
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Mean Interarrival Time Input */}
        <div>
          <label
            htmlFor="mean-interarrival-time"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Mean Interarrival Time
          </label>
          <input
            id="mean-interarrival-time"
            type="number"
            step="0.01"
            min="0.01"
            value={meanInterarrivalTime}
            onChange={(e) => onMeanInterarrivalTimeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200
                     hover:border-gray-400 dark:hover:border-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., 2.0"
            disabled={!selectedModel || isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Average time between customer arrivals (1/λ)
          </p>
        </div>

        {/* Mean Service Time Input */}
        <div>
          <label
            htmlFor="mean-service-time"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Mean Service Time
          </label>
          <input
            id="mean-service-time"
            type="number"
            step="0.01"
            min="0.01"
            value={meanServiceTime}
            onChange={(e) => onMeanServiceTimeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200
                     hover:border-gray-400 dark:hover:border-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., 1.5"
            disabled={!selectedModel || isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Average time to serve one customer (1/μ)
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 
                   bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                   dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800
                   text-white font-medium rounded-lg shadow-md
                   transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running Simulation...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Run Simulation</span>
            </>
          )}
        </button>

        {!selectedModel && (
          <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
            Please select a queueing model first
          </p>
        )}
      </form>
    </div>
  );
}
