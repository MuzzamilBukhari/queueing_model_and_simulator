"use client";

import { useState, FormEvent } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import InputForm from '@/components/InputForm';
import ResultsPanel, { SimulationResults } from '@/components/ResultsPanel';
import ThemeToggle from '@/components/ThemeToggle';

function detectModel(
  arrivalDistribution: string,
  serviceDistribution: string,
  servers: number,
): string {
  if (!arrivalDistribution || !serviceDistribution || servers < 1) {
    return '';
  }

  const arrival = arrivalDistribution === 'Poisson' ? 'M' : 'G';
  const service = serviceDistribution === 'Exponential' ? 'M' : 'G';

  if (servers > 1) {
    return arrival === 'M' && service === 'M' ? 'M/M/s' : '';
  }

  return `${arrival}/${service}/1`;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'models' | 'simulator'>('models');
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [selectedModel, setSelectedModel] = useState('M/M/1');
  const [arrivalDistribution, setArrivalDistribution] = useState('Poisson');
  const [serviceDistribution, setServiceDistribution] = useState('Exponential');
  const [arrivalInputType, setArrivalInputType] = useState<'rate' | 'meanInterArrival'>('meanInterArrival');
  const [arrivalValue, setArrivalValue] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [servers, setServers] = useState(1);
  const [variance, setVariance] = useState('');
  const [ca, setCa] = useState('');
  const [cs, setCs] = useState('');
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const effectiveModel =
    mode === 'manual'
      ? selectedModel
      : detectModel(arrivalDistribution, serviceDistribution, servers);

  const runSimulation = async (e: FormEvent) => {
    e.preventDefault();

    if (!effectiveModel) {
      toast.error('Current selection does not map to a supported model.');
      return;
    }

    if (!arrivalValue || !serviceTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const parsedArrival = parseFloat(arrivalValue);
    const parsedServiceTime = parseFloat(serviceTime);

    if (parsedArrival <= 0 || parsedServiceTime <= 0 || servers < 1) {
      toast.error('Inputs must be positive values');
      return;
    }

    if (effectiveModel === 'M/G/1' && (!variance || parseFloat(variance) < 0)) {
      toast.error('Please provide a valid non-negative service variance for M/G/1.');
      return;
    }

    if (
      effectiveModel === 'G/G/1' &&
      (!ca || !cs || parseFloat(ca) < 0 || parseFloat(cs) < 0)
    ) {
      toast.error('Please provide valid non-negative Ca and Cs values for G/G/1.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5196';

      const payload: Record<string, unknown> = {
        autoDetectModel: mode === 'auto',
        model: mode === 'manual' ? selectedModel : undefined,
        arrivalDistribution: mode === 'auto' ? arrivalDistribution : undefined,
        serviceDistribution: mode === 'auto' ? serviceDistribution : undefined,
        serviceTime: parsedServiceTime,
        servers,
        variance: effectiveModel === 'M/G/1' ? parseFloat(variance) : undefined,
        ca: effectiveModel === 'G/G/1' ? parseFloat(ca) : undefined,
        cs: effectiveModel === 'G/G/1' ? parseFloat(cs) : undefined,
      };

      if (arrivalInputType === 'rate') {
        payload.arrivalRate = parsedArrival;
      } else {
        payload.meanInterArrivalTime = parsedArrival;
      }

      const response = await fetch(`${apiUrl}/api/simulation/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Simulation failed');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const apiResults: SimulationResults = {
        model: data.model,
        rho: data.rho,
        Lq: data.lq,
        Wq: data.wq,
        L: data.l,
        W: data.w,
        P0: data.p0,
      };

      setResults(apiResults);
      setIsLoading(false);
      toast.success('Simulation completed successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to connect to API. Make sure the backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'models' ? 'Queueing Models' : 'Simulator'}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'models' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <InputForm
                mode={mode}
                onModeChange={setMode}
                selectedModel={selectedModel}
                onSelectedModelChange={setSelectedModel}
                arrivalDistribution={arrivalDistribution}
                serviceDistribution={serviceDistribution}
                onArrivalDistributionChange={setArrivalDistribution}
                onServiceDistributionChange={setServiceDistribution}
                servers={servers}
                onServersChange={setServers}
                arrivalInputType={arrivalInputType}
                onArrivalInputTypeChange={setArrivalInputType}
                arrivalValue={arrivalValue}
                onArrivalValueChange={setArrivalValue}
                serviceTime={serviceTime}
                onServiceTimeChange={setServiceTime}
                variance={variance}
                onVarianceChange={setVariance}
                ca={ca}
                cs={cs}
                onCaChange={setCa}
                onCsChange={setCs}
                effectiveModel={effectiveModel}
                onSubmit={runSimulation}
                isLoading={isLoading}
              />

              {results && <ResultsPanel results={results} />}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 sm:p-12 border border-gray-200 dark:border-gray-800 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <span className="text-3xl">🚧</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Simulator Module
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Simulator module under development.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
