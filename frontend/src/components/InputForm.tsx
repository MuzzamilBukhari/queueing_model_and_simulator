"use client";

import { Play, Loader2, Settings } from 'lucide-react';
import { FormEvent } from 'react';

type TimeUnit = 'seconds' | 'minutes' | 'hours';

interface InputFormProps {
  mode: 'manual' | 'auto';
  onModeChange: (mode: 'manual' | 'auto') => void;
  manualServerMode: 'single' | 'multi';
  onManualServerModeChange: (value: 'single' | 'multi') => void;
  selectedModel: string;
  onSelectedModelChange: (model: string) => void;
  arrivalProcessType: "arrival" | "interArrival";
  onArrivalProcessTypeChange: (value: "arrival" | "interArrival") => void;
  arrivalDistribution: string;
  serviceDistribution: string;
  onArrivalDistributionChange: (value: string) => void;
  onServiceDistributionChange: (value: string) => void;
  servers: number;
  onServersChange: (value: number) => void;
  arrivalInputType: 'rate' | 'meanInterArrival';
  onArrivalInputTypeChange: (value: 'rate' | 'meanInterArrival') => void;
  arrivalTimeUnit: TimeUnit;
  onArrivalTimeUnitChange: (value: TimeUnit) => void;
  arrivalValue: string;
  onArrivalValueChange: (value: string) => void;
  serviceInputType: 'rate' | 'mean';
  onServiceInputTypeChange: (value: 'rate' | 'mean') => void;
  serviceRateValue: string;
  onServiceRateValueChange: (value: string) => void;
  serviceRateUnit: TimeUnit;
  onServiceRateUnitChange: (value: TimeUnit) => void;
  serviceTimeUnit: TimeUnit;
  onServiceTimeUnitChange: (value: TimeUnit) => void;
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
  arrivalInputMode: 'meanSpread' | 'minMax';
  onArrivalInputModeChange: (value: 'meanSpread' | 'minMax') => void;
  arrivalSpreadType: 'variance' | 'stdDev';
  onArrivalSpreadTypeChange: (value: 'variance' | 'stdDev') => void;
  arrivalSpreadValue: string;
  onArrivalSpreadValueChange: (value: string) => void;
  arrivalMinTime: string;
  onArrivalMinTimeChange: (value: string) => void;
  arrivalMaxTime: string;
  onArrivalMaxTimeChange: (value: string) => void;
  ggServiceInputMode: 'meanSpread' | 'minMax';
  onGgServiceInputModeChange: (value: 'meanSpread' | 'minMax') => void;
  ggServiceSpreadType: 'variance' | 'stdDev';
  onGgServiceSpreadTypeChange: (value: 'variance' | 'stdDev') => void;
  ggServiceSpreadValue: string;
  onGgServiceSpreadValueChange: (value: string) => void;
  ggServiceMinTime: string;
  onGgServiceMinTimeChange: (value: string) => void;
  ggServiceMaxTime: string;
  onGgServiceMaxTimeChange: (value: string) => void;
  resultTimeUnit: TimeUnit;
  onResultTimeUnitChange: (value: TimeUnit) => void;
  effectiveModel: string;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export default function InputForm({
  mode,
  onModeChange,
  manualServerMode,
  onManualServerModeChange,
  selectedModel,
  onSelectedModelChange,
  arrivalProcessType,
  onArrivalProcessTypeChange,
  arrivalDistribution,
  serviceDistribution,
  onArrivalDistributionChange,
  onServiceDistributionChange,
  servers,
  onServersChange,
  arrivalInputType,
  onArrivalInputTypeChange,
  arrivalTimeUnit,
  onArrivalTimeUnitChange,
  arrivalValue,
  onArrivalValueChange,
  serviceInputType,
  onServiceInputTypeChange,
  serviceRateValue,
  onServiceRateValueChange,
  serviceRateUnit,
  onServiceRateUnitChange,
  serviceTimeUnit,
  onServiceTimeUnitChange,
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
  arrivalInputMode,
  onArrivalInputModeChange,
  arrivalSpreadType,
  onArrivalSpreadTypeChange,
  arrivalSpreadValue,
  onArrivalSpreadValueChange,
  arrivalMinTime,
  onArrivalMinTimeChange,
  arrivalMaxTime,
  onArrivalMaxTimeChange,
  ggServiceInputMode,
  onGgServiceInputModeChange,
  ggServiceSpreadType,
  onGgServiceSpreadTypeChange,
  ggServiceSpreadValue,
  onGgServiceSpreadValueChange,
  ggServiceMinTime,
  onGgServiceMinTimeChange,
  ggServiceMaxTime,
  onGgServiceMaxTimeChange,
  resultTimeUnit,
  onResultTimeUnitChange,
  effectiveModel,
  onSubmit,
  isLoading,
}: InputFormProps) {
  const isMgModel = effectiveModel.startsWith('M/G/');
  const isGgModel = effectiveModel.startsWith('G/G/');
  const arrIsUniform = mode === 'auto' && arrivalDistribution === 'Uniform';
  const svcIsUniform = mode === 'auto' && serviceDistribution === 'Uniform';
  
  // Use the manual toggle state for all modes
  const effMgSvcMode = serviceInputMode;
  const effArrMode = arrivalInputMode;
  const effGgSvcMode = ggServiceInputMode;

  const mgSpreadValid = isMgModel
    ? (effMgSvcMode === 'minMax'
        ? Boolean(serviceMinTime && serviceMaxTime && parseFloat(serviceMinTime) > 0 && parseFloat(serviceMaxTime) > 0)
        : Boolean(serviceSpreadValue && parseFloat(serviceSpreadValue) >= 0))
    : true;

  const serviceValid = (isMgModel && effMgSvcMode === 'minMax') || (isGgModel && effGgSvcMode === 'minMax')
    ? true // Min/Max handled strictly by mgSpreadValid/ggServiceValid respectively
    : serviceInputType === 'rate'
      ? Boolean(serviceRateValue && parseFloat(serviceRateValue) > 0 && mgSpreadValid)
      : Boolean(serviceTime && parseFloat(serviceTime) > 0 && mgSpreadValid);

  const ggArrivalValid = isGgModel
    ? (effArrMode === 'minMax'
        ? Boolean(arrivalMinTime && arrivalMaxTime && parseFloat(arrivalMinTime) > 0 && parseFloat(arrivalMaxTime) > 0)
        : Boolean(arrivalSpreadValue && parseFloat(arrivalSpreadValue) >= 0))
    : true;

  const ggServiceValid = isGgModel
    ? (effGgSvcMode === 'minMax'
        ? Boolean(ggServiceMinTime && ggServiceMaxTime && parseFloat(ggServiceMinTime) > 0 && parseFloat(ggServiceMaxTime) > 0)
        : Boolean(ggServiceSpreadValue && parseFloat(ggServiceSpreadValue) >= 0))
    : true;

  const baseValid =
    (isGgModel && effArrMode === 'minMax'
      ? ggArrivalValid
      : Boolean(arrivalValue && parseFloat(arrivalValue) > 0 && ggArrivalValid)) &&
    serviceValid &&
    servers >= 1;

  const modeValid =
    mode === 'manual'
      ? Boolean(selectedModel)
      : Boolean(arrivalDistribution) && Boolean(serviceDistribution);

  const modelSupported = Boolean(effectiveModel);

  const isValid = Boolean(baseValid && modeValid && modelSupported && ggArrivalValid && ggServiceValid);
  const modelOptions =
    manualServerMode === 'single'
      ? ['M/M/1', 'M/G/1', 'G/G/1']
      : ['M/M/s', 'M/G/s', 'G/G/s'];

  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] p-6 sm:p-10 border border-white/60 dark:border-slate-800/60 animate-slideUp">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-linear-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
            Simulation Parameters
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Configure and tune your queuing model</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Mode & General Model Selection wrapped in a card */}
        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-4xl border border-slate-200/50 dark:border-slate-700/50 space-y-6">
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
              <div className="mb-4">
                <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Server Type
                </p>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onManualServerModeChange('single')}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      manualServerMode === 'single'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Single Server
                  </button>
                  <button
                    type="button"
                    onClick={() => onManualServerModeChange('multi')}
                    disabled={isLoading}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      manualServerMode === 'multi'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    Multi Server
                  </button>
                </div>
              </div>

              <label
                htmlFor="model-select"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              >
                Select Queue Model
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
                <option value="" disabled>Choose a model family...</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-semibold text-brand-600/80 dark:text-brand-400/80 bg-brand-50 dark:bg-brand-500/10 inline-block px-3 py-1 rounded-md">
                Multi-server supports M/M/s, M/G/s, and G/G/s.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Arrival Process Type
                  </label>
                  <select
                    value={arrivalProcessType}
                    onChange={(e) => onArrivalProcessTypeChange(e.target.value as "arrival" | "interArrival")}
                    className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                           bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                           transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <option value="arrival">Arrival Distribution</option>
                    <option value="interArrival">Inter-Arrival Distribution</option>
                  </select>
                </div>
                {arrivalProcessType === "interArrival" ? (
                  <div className="animate-slideUp">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Distribution
                    </label>
                    <select
                      value={arrivalDistribution}
                      onChange={(e) => onArrivalDistributionChange(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 
                             bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                             transition-all shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <option value="" disabled>Choose...</option>
                      <option value="Exponential">Exponential (M)</option>
                      <option value="Uniform">Uniform (G)</option>
                      <option value="Normal">Normal (G)</option>
                      <option value="Gamma">Gamma (G)</option>
                    </select>
                  </div>
                ) : (
                  <div className="animate-slideUp">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 opacity-60">
                      Distribution
                    </label>
                    <div className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 font-semibold cursor-not-allowed">
                      Poisson (M)
                    </div>
                  </div>
                )}
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
                  <option value="" disabled>Choose...</option>
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
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-4xl border border-slate-200/50 dark:border-slate-700/50">
            <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Inter-Arrival Input</p>
            <div className="flex flex-col gap-4">

              {/* Spread / MinMax toggle for G/G */}
              {isGgModel && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl">
                  <button type="button" onClick={() => onArrivalInputModeChange('meanSpread')} disabled={isLoading}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${ arrivalInputMode === 'meanSpread' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50' } disabled:opacity-40`}>
                    Spread (Mean/Rate & Var)
                  </button>
                  <button type="button" onClick={() => onArrivalInputModeChange('minMax')} disabled={isLoading}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${ arrivalInputMode === 'minMax' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50' } disabled:opacity-40`}>
                    Min / Max
                  </button>
                </div>
              )}

              {(isGgModel && effArrMode === 'minMax') ? (
                <div className="animate-slideUp flex flex-col gap-4">
                  <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800/30 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      When using Min/Max, mean and variance are calculated automatically (assuming a uniform spread).
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Inter-arrival Min / Max</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" min="0.01" 
                        value={arrivalMinTime} 
                        onChange={(e) => onArrivalMinTimeChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-base font-semibold"
                        placeholder="Min (e.g. 0.5)" disabled={isLoading} required />
                      <input type="number" step="0.01" min="0.01" 
                        value={arrivalMaxTime} 
                        onChange={(e) => onArrivalMaxTimeChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-base font-semibold"
                        placeholder="Max (e.g. 2.0)" disabled={isLoading} required />
                    </div>
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time Unit
                    </span>
                    <select
                      value={arrivalTimeUnit}
                      onChange={(e) => onArrivalTimeUnitChange(e.target.value as TimeUnit)}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer outline-none"
                      disabled={isLoading}
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="animate-slideUp flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => onArrivalInputTypeChange('rate')}
                      disabled={isLoading}
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
                      disabled={isLoading}
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
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {arrivalInputType === 'rate' ? 'Rate Unit' : 'Time Unit'}
                      </span>
                      <select
                        value={arrivalTimeUnit}
                        onChange={(e) => onArrivalTimeUnitChange(e.target.value as TimeUnit)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer outline-none"
                        disabled={isLoading}
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
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

                  {/* Spread — for G/G models */}
                  {isGgModel && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Spread Type</span>
                        <select value={arrivalSpreadType} onChange={(e) => onArrivalSpreadTypeChange(e.target.value as 'variance' | 'stdDev')}
                          className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none">
                          <option value="variance">Variance</option>
                          <option value="stdDev">Standard Dev</option>
                        </select>
                      </div>
                      <input type="number" step="0.01" min="0" value={arrivalSpreadValue} onChange={(e) => onArrivalSpreadValueChange(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-lg font-semibold"
                        placeholder={arrivalSpreadType === 'variance' ? 'Variance (e.g. 1.44)' : 'Std Dev (e.g. 1.2)'}
                        disabled={isLoading} required />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Service Input */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-4xl border border-slate-200/50 dark:border-slate-700/50">
            <p className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Service Input</p>
            <div className="flex flex-col gap-4">

              {/* Spread / MinMax toggle for M/G and G/G */}
              {(isMgModel || isGgModel) && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-xl">
                  <button type="button" onClick={() => {
                      if (isMgModel) onServiceInputModeChange('meanSpread');
                      if (isGgModel) onGgServiceInputModeChange('meanSpread');
                    }} disabled={isLoading}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${ (isMgModel ? serviceInputMode : ggServiceInputMode) === 'meanSpread' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50' } disabled:opacity-40`}>
                    Spread (Mean/Rate & Var)
                  </button>
                  <button type="button" onClick={() => {
                      if (isMgModel) onServiceInputModeChange('minMax');
                      if (isGgModel) onGgServiceInputModeChange('minMax');
                    }} disabled={isLoading}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${ (isMgModel ? serviceInputMode : ggServiceInputMode) === 'minMax' ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50' } disabled:opacity-40`}>
                    Min / Max
                  </button>
                </div>
              )}

              {((isMgModel && effMgSvcMode === 'minMax') || (isGgModel && effGgSvcMode === 'minMax')) ? (
                <div className="animate-slideUp flex flex-col gap-4">
                  <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800/30 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      When using Min/Max, mean and variance are calculated automatically (assuming a uniform spread).
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Service Min / Max</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" min="0.01" 
                        value={isMgModel ? serviceMinTime : ggServiceMinTime} 
                        onChange={(e) => isMgModel ? onServiceMinTimeChange(e.target.value) : onGgServiceMinTimeChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-base font-semibold"
                        placeholder="Min (e.g. 0.5)" disabled={isLoading} required />
                      <input type="number" step="0.01" min="0.01" 
                        value={isMgModel ? serviceMaxTime : ggServiceMaxTime} 
                        onChange={(e) => isMgModel ? onServiceMaxTimeChange(e.target.value) : onGgServiceMaxTimeChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-base font-semibold"
                        placeholder="Max (e.g. 2.0)" disabled={isLoading} required />
                    </div>
                  </div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time Unit
                    </span>
                    <select
                      value={serviceTimeUnit}
                      onChange={(e) => onServiceTimeUnitChange(e.target.value as TimeUnit)}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer outline-none"
                      disabled={isLoading}
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="animate-slideUp flex flex-col gap-4">
                  {/* Rate (μ) | Mean Time */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => onServiceInputTypeChange('rate')}
                      disabled={isLoading}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        serviceInputType === 'rate'
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      Rate (μ)
                    </button>
                    <button
                      type="button"
                      onClick={() => onServiceInputTypeChange('mean')}
                      disabled={isLoading}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        serviceInputType === 'mean'
                          ? 'bg-brand-500 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      Mean Time
                    </button>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {serviceInputType === 'rate' ? 'Rate Unit' : 'Service Time Unit'}
                      </span>
                      <select
                        value={serviceInputType === 'rate' ? serviceRateUnit : serviceTimeUnit}
                        onChange={(e) =>
                          serviceInputType === 'rate'
                            ? onServiceRateUnitChange(e.target.value as TimeUnit)
                            : onServiceTimeUnitChange(e.target.value as TimeUnit)
                        }
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer outline-none"
                        disabled={isLoading}
                      >
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={serviceInputType === 'rate' ? serviceRateValue : serviceTime}
                      onChange={(e) =>
                        serviceInputType === 'rate'
                          ? onServiceRateValueChange(e.target.value)
                          : onServiceTimeChange(e.target.value)
                      }
                      className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700
                               bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none
                               transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-lg font-semibold"
                      placeholder={serviceInputType === 'rate' ? 'Rate (e.g. 0.5)' : 'Mean time (e.g., 1.5)'}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {/* Spread — for M/G models */}
                  {isMgModel && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Spread Type</span>
                        <select value={serviceSpreadType} onChange={(e) => onServiceSpreadTypeChange(e.target.value as 'variance' | 'stdDev')}
                          className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none">
                          <option value="variance">Variance</option>
                          <option value="stdDev">Standard Dev</option>
                        </select>
                      </div>
                      <input type="number" step="0.01" min="0" value={serviceSpreadValue} onChange={(e) => onServiceSpreadValueChange(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-lg font-semibold"
                        placeholder={serviceSpreadType === 'variance' ? 'Variance (e.g., 0.8)' : 'Std Dev (e.g., 0.9)'}
                        disabled={isLoading} required />
                    </div>
                  )}

                  {/* Spread — for G/G models */}
                  {isGgModel && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Spread Type</span>
                        <select value={ggServiceSpreadType} onChange={(e) => onGgServiceSpreadTypeChange(e.target.value as 'variance' | 'stdDev')}
                          className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/50 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none">
                          <option value="variance">Variance</option>
                          <option value="stdDev">Standard Dev</option>
                        </select>
                      </div>
                      <input type="number" step="0.01" min="0" value={ggServiceSpreadValue} onChange={(e) => onGgServiceSpreadValueChange(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-lg font-semibold"
                        placeholder={ggServiceSpreadType === 'variance' ? 'Variance (e.g., 0.81)' : 'Std Dev (e.g., 0.9)'}
                        disabled={isLoading} required />
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Server Settings (only for multi-server) */}
        {(mode === 'auto' || servers > 1) && (
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-4xl border border-slate-200/50 dark:border-slate-700/50">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
              Servers Configuration
            </label>
            <input
              type="number"
              min="1"
              value={servers}
              onChange={(e) => onServersChange(parseInt(e.target.value, 10) || 1)}
              className="w-full px-5 py-4 rounded-xl border border-white dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm text-2xl font-extrabold text-center font-mono tracking-widest"
              disabled={isLoading}
              required
            />
          </div>
        )}

        {/* Action Button & Metadata */}
        <div className="pt-6 flex flex-col items-center">
          <div className="mb-5 w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Results Time Unit
            </span>
            <select
              value={resultTimeUnit}
              onChange={(e) => onResultTimeUnitChange(e.target.value as TimeUnit)}
              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer outline-none"
              disabled={isLoading}
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>

          {effectiveModel && (
            <div className="mb-6 px-6 py-2 rounded-full border border-brand-200 dark:border-brand-900/30 bg-brand-50 dark:bg-brand-900/10 backdrop-blur-sm text-sm font-bold text-brand-600 dark:text-brand-400 tracking-widest shadow-sm">
              TARGET: {effectiveModel}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full max-w-md flex items-center justify-center gap-3 px-8 py-5 
                     bg-linear-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700
                     text-white font-bold text-lg rounded-2xl shadow-xl shadow-brand-500/30
                     transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:shadow-none
                     focus:ring-4 focus:ring-brand-500/50 outline-none overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-30 -translate-x-[150%] group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out"></div>
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
