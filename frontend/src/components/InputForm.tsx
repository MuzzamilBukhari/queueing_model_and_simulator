"use client";

import { Play, Loader2, Settings } from 'lucide-react';
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
  serviceInputMode: 'meanSpread' | 'minMax';
  onServiceInputModeChange: (value: 'meanSpread' | 'minMax') => void;
  serviceSpreadType: 'variance' | 'stdDev';
  onServiceSpreadTypeChange: (value: 'variance' | 'stdDev') => void;
  serviceSpreadValue: string;
  onServiceSpreadValueChange: (value: string) => void;
  serviceMinTime: string;
  onServiceMinTimeChange: (value: string) => void;
  serviceMaxTime: string;
  onServiceMaxTimeChange: (value: string) => void;
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
  serviceInputMode,
  onServiceInputModeChange,
  serviceSpreadType,
  onServiceSpreadTypeChange,
  serviceSpreadValue,
  onServiceSpreadValueChange,
  serviceMinTime,
  onServiceMinTimeChange,
  serviceMaxTime,
  onServiceMaxTimeChange,
  ca,
  cs,
  onCaChange,
  onCsChange,
  effectiveModel,
  onSubmit,
  isLoading,
}: InputFormProps) {
  const isMgModel = effectiveModel === 'M/G/1';
  const isGgModel = effectiveModel === 'G/G/1';
  const forceArrivalInputType =
    mode === 'auto' && arrivalDistribution === 'Poisson'
      ? 'rate'
      : mode === 'auto' && arrivalDistribution === 'Exponential'
        ? 'meanInterArrival'
        : null;

  const serviceMeanSpreadValid =
    serviceTime &&
    parseFloat(serviceTime) > 0 &&
    (!isMgModel || (serviceSpreadValue && parseFloat(serviceSpreadValue) >= 0));

  const serviceMinMaxValid =
    serviceMinTime &&
    serviceMaxTime &&
    parseFloat(serviceMinTime) > 0 &&
    parseFloat(serviceMaxTime) > 0 &&
    parseFloat(serviceMaxTime) >= parseFloat(serviceMinTime);

  const serviceValid = serviceInputMode === 'meanSpread' ? serviceMeanSpreadValid : serviceMinMaxValid;

  const baseValid =
    arrivalValue &&
    parseFloat(arrivalValue) > 0 &&
    serviceValid &&
    servers >= 1;

  const modeValid =
    mode === 'manual'
      ? Boolean(selectedModel)
      : Boolean(arrivalDistribution) && Boolean(serviceDistribution);

  const modelSupported = Boolean(effectiveModel);
  const mg1Valid = !isMgModel || (serviceInputMode === 'minMax' || (serviceSpreadValue && parseFloat(serviceSpreadValue) >= 0));
  const gg1Valid =
    !isGgModel ||
    (ca && cs && parseFloat(ca) >= 0 && parseFloat(cs) >= 0);

  const isValid = Boolean(baseValid && modeValid && modelSupported && mg1Valid && gg1Valid);

  const modelOptions = ['MMs', 'MGs', 'GGs'];

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60 animate-slideUp">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
            Simulation Parameters
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configure and tune your queuing model</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Mode & General Model Selection wrapped in a card */}
        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 space-y-6">
          <div>
            <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Detection Mode</p>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
              <button
                type="button"
                onClick={() => onModeChange('manual')}
                className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  mode === 'manual'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md transform scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                Manual Selection
              </button>
              <button
                type="button"
                onClick={() => onModeChange('auto')}
                className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  mode === 'auto'
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md transform scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
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
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Select Base Model Family
              </label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={(e) => onSelectedModelChange(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                         bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                         transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
              >
                <option value="">Choose a model family...</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-semibold text-brand-600/80 dark:text-brand-400/80 bg-brand-50 dark:bg-brand-500/10 inline-block px-3 py-1 rounded-md">
                Use MMs with servers = 1 for M/M/1.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Arrival Distribution
                </label>
                <select
                  value={arrivalDistribution}
                  onChange={(e) => onArrivalDistributionChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                         bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                         transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">Choose...</option>
                  <option value="Poisson">Poisson (M)</option>
                  <option value="Exponential">Exponential (M)</option>
                  <option value="Uniform">Uniform (G)</option>
                  <option value="Normal">Normal (G)</option>
                  <option value="Gamma">Gamma (G)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Service Distribution
                </label>
                <select
                  value={serviceDistribution}
                  onChange={(e) => onServiceDistributionChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                         bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                         transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <option value="">Choose...</option>
                  <option value="Exponential">Exponential (M)</option>
                  <option value="Uniform">Uniform (G)</option>
                  <option value="Normal">Normal (G)</option>
                  <option value="Gamma">Gamma (G)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Arrival Input */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
            <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Arrival Input</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => onArrivalInputTypeChange('rate')}
                  disabled={isLoading || forceArrivalInputType === 'meanInterArrival'}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    arrivalInputType === 'rate'
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Rate (λ)
                </button>
                <button
                  type="button"
                  onClick={() => onArrivalInputTypeChange('meanInterArrival')}
                  disabled={isLoading || forceArrivalInputType === 'rate'}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    arrivalInputType === 'meanInterArrival'
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Mean Time
                </button>
              </div>

              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={arrivalValue}
                  onChange={(e) => onArrivalValueChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                           bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                           transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                  placeholder={arrivalInputType === 'rate' ? 'Rate (e.g. 0.8)' : 'Time (e.g. 1.25)'}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Time Input */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
            <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Service Input</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => onServiceInputModeChange('meanSpread')}
                  disabled={isLoading}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    serviceInputMode === 'meanSpread'
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Mean + Spread
                </button>
                <button
                  type="button"
                  onClick={() => onServiceInputModeChange('minMax')}
                  disabled={isLoading}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    serviceInputMode === 'minMax'
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Min + Max
                </button>
              </div>

              {serviceInputMode === 'meanSpread' ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={serviceTime}
                    onChange={(e) => onServiceTimeChange(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                             bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                             transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                    placeholder="Mean time (e.g., 1.5)"
                    disabled={isLoading}
                    required
                  />

                  {isMgModel && (
                    <div className="animate-slideUp pt-2">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Spread Type</span>
                         <select
                           value={serviceSpreadType}
                           onChange={(e) => onServiceSpreadTypeChange(e.target.value as 'variance'|'stdDev')}
                           className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none"
                         >
                           <option value="variance">Variance</option>
                           <option value="stdDev">Standard Dev</option>
                         </select>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={serviceSpreadValue}
                        onChange={(e) => onServiceSpreadValueChange(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                                 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                                 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                                 transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                        placeholder={serviceSpreadType === 'variance' ? 'Variance (e.g., 0.8)' : 'Std Dev (e.g., 0.9)'}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={serviceMinTime}
                    onChange={(e) => onServiceMinTimeChange(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                             bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                             transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                    placeholder="Min (1.0)"
                    disabled={isLoading}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={serviceMaxTime}
                    onChange={(e) => onServiceMaxTimeChange(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                             bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                             transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                    placeholder="Max (2.0)"
                    disabled={isLoading}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Server & CV Settings */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-[1] bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              Servers Configuration
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="1"
                value={servers}
                onChange={(e) => onServersChange(parseInt(e.target.value, 10) || 1)}
                className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                         bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                         transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-2xl font-extrabold text-center font-mono tracking-widest"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {effectiveModel === 'G/G/1' && (
            <div className="flex-[2] grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                  arrival CV (Ca)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ca}
                  onChange={(e) => onCaChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                           bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                           transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                  placeholder="e.g., 1.2"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
                  service CV (Cs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cs}
                  onChange={(e) => onCsChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                           bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                           transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                  placeholder="e.g., 0.9"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button & Metadata */}
        <div className="pt-6 flex flex-col items-center">
          {effectiveModel && (
            <div className="mb-6 px-6 py-2 rounded-full border border-brand-200 dark:border-brand-900/30 bg-brand-50 dark:bg-brand-900/10 backdrop-blur-sm text-sm font-bold text-brand-600 dark:text-brand-400 tracking-widest shadow-sm">
              TARGET: {effectiveModel}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full max-w-md flex items-center justify-center gap-3 px-8 py-5 
                     bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700
                     text-white font-bold text-lg rounded-2xl shadow-xl shadow-brand-500/30
                     transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:scale-100 disabled:shadow-none
                     focus:ring-4 focus:ring-brand-500/50 outline-none overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-[30deg] -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out"></div>
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>Generate Results</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
