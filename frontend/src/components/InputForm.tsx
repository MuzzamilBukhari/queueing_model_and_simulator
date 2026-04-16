"use client";

import { Play, Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

interface InputFormProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  selectedModel: string;
  onSelectedModelChange: (model: string) => void;
  arrivalDistribution: string;
  serviceDistribution: string;
  onArrivalDistributionChange: (value: string) => void;
  onServiceDistributionChange: (value: string) => void;
  servers: number;
  onServersChange: (value: number) => void;
  arrivalInputType: 'rate' | 'meanInterArrival';
  onArrivalInputTypeChange: (value: 'rate' | 'meanInterArrival') => void;
  arrivalValue: string;
  onArrivalValueChange: (value: string) => void;
  serviceTime: string;
  onServiceTimeChange: (value: string) => void;
  variance: string;
  onVarianceChange: (value: string) => void;
  ca: string;
  cs: string;
  onCaChange: (value: string) => void;
  onCsChange: (value: string) => void;
  effectiveModel: string;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export default function InputForm({
  mode,
  onModeChange,
  selectedModel,
  onSelectedModelChange,
  arrivalDistribution,
  serviceDistribution,
  onArrivalDistributionChange,
  onServiceDistributionChange,
  servers,
  onServersChange,
  arrivalInputType,
  onArrivalInputTypeChange,
  arrivalValue,
  onArrivalValueChange,
  serviceTime,
  onServiceTimeChange,
  variance,
  onVarianceChange,
  ca,
  cs,
  onCaChange,
  onCsChange,
  effectiveModel,
  onSubmit,
  isLoading,
}: InputFormProps) {
  const baseValid =
    arrivalValue &&
    serviceTime &&
    parseFloat(arrivalValue) > 0 &&
    parseFloat(serviceTime) > 0 &&
    servers >= 1;

  const modeValid =
    mode === 'manual'
      ? Boolean(selectedModel)
      : Boolean(arrivalDistribution) && Boolean(serviceDistribution);

  const mg1Valid = effectiveModel !== 'M/G/1' || (variance && parseFloat(variance) >= 0);
  const gg1Valid =
    effectiveModel !== 'G/G/1' ||
    (ca && cs && parseFloat(ca) >= 0 && parseFloat(cs) >= 0);

  const isValid = Boolean(baseValid && modeValid && mg1Valid && gg1Valid);

  const modelOptions = ['M/M/1', 'M/G/1', 'G/G/1', 'M/M/s'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Input Parameters
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onModeChange('manual')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => onModeChange('auto')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'auto'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              Auto Detect
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          <div>
            <label
              htmlFor="model-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Queueing Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => onSelectedModelChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 cursor-pointer"
            >
              <option value="">Choose a model...</option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="arrival-distribution"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Arrival Distribution
              </label>
              <select
                id="arrival-distribution"
                value={arrivalDistribution}
                onChange={(e) => onArrivalDistributionChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Choose...</option>
                <option value="Poisson">Poisson (M)</option>
                <option value="General">General (G)</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="service-distribution"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Service Distribution
              </label>
              <select
                id="service-distribution"
                value={serviceDistribution}
                onChange={(e) => onServiceDistributionChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Choose...</option>
                <option value="Exponential">Exponential (M)</option>
                <option value="General">General (G)</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arrival Input</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => onArrivalInputTypeChange('rate')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                arrivalInputType === 'rate'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              Arrival Rate (lambda)
            </button>
            <button
              type="button"
              onClick={() => onArrivalInputTypeChange('meanInterArrival')}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                arrivalInputType === 'meanInterArrival'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
              }`}
            >
              Mean Inter-arrival Time
            </button>
          </div>

          <input
            id="arrival-value"
            type="number"
            step="0.01"
            min="0.01"
            value={arrivalValue}
            onChange={(e) => onArrivalValueChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200
                     hover:border-gray-400 dark:hover:border-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={arrivalInputType === 'rate' ? 'e.g., 0.8' : 'e.g., 1.25'}
            disabled={isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {arrivalInputType === 'rate'
              ? 'Arrival rate lambda'
              : 'Mean inter-arrival time; backend converts lambda = 1 / mean inter-arrival time'}
          </p>
        </div>

        <div>
          <label
            htmlFor="service-time"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Mean Service Time
          </label>
          <input
            id="service-time"
            type="number"
            step="0.01"
            min="0.01"
            value={serviceTime}
            onChange={(e) => onServiceTimeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200
                     hover:border-gray-400 dark:hover:border-gray-600
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., 1.5"
            disabled={isLoading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Average time to serve one customer (1/μ)
          </p>
        </div>

        <div>
          <label
            htmlFor="servers-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Number of Servers
          </label>
          <input
            id="servers-input"
            type="number"
            min="1"
            value={servers}
            onChange={(e) => onServersChange(parseInt(e.target.value, 10) || 1)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
        </div>

        {effectiveModel === 'M/G/1' && (
          <div>
            <label
              htmlFor="variance"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Service Time Variance (sigma^2)
            </label>
            <input
              id="variance"
              type="number"
              min="0"
              step="0.01"
              value={variance}
              onChange={(e) => onVarianceChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., 0.8"
              disabled={isLoading}
              required
            />
          </div>
        )}

        {effectiveModel === 'G/G/1' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ca"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Ca (arrival CV)
              </label>
              <input
                id="ca"
                type="number"
                min="0"
                step="0.01"
                value={ca}
                onChange={(e) => onCaChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., 1.2"
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label
                htmlFor="cs"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Cs (service CV)
              </label>
              <input
                id="cs"
                type="number"
                min="0"
                step="0.01"
                value={cs}
                onChange={(e) => onCsChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., 0.9"
                disabled={isLoading}
                required
              />
            </div>
          </div>
        )}

        {effectiveModel && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Effective model: {effectiveModel}
          </p>
        )}

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
      </form>
    </div>
  );
}
