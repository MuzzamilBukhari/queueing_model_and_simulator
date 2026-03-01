"use client";

import { useState, FormEvent } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import ModelSelector from '@/components/ModelSelector';
import InputForm from '@/components/InputForm';
import ResultsPanel, { SimulationResults } from '@/components/ResultsPanel';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'models' | 'simulator'>('models');
  const [selectedModel, setSelectedModel] = useState('');
  const [numberOfServers, setNumberOfServers] = useState(2);
  const [meanInterarrivalTime, setMeanInterarrivalTime] = useState('');
  const [meanServiceTime, setMeanServiceTime] = useState('');
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedModel || !meanInterarrivalTime || !meanServiceTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const interarrivalTime = parseFloat(meanInterarrivalTime);
    const serviceTime = parseFloat(meanServiceTime);

    if (interarrivalTime <= 0 || serviceTime <= 0) {
      toast.error('Times must be positive numbers');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5196';
      const response = await fetch(`${apiUrl}/api/simulation/mm1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meanInterarrivalTime: interarrivalTime,
          meanServiceTime: serviceTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Simulation failed');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Map API response to results format
      const apiResults: SimulationResults = {
        lambda: data.lambda,
        mu: data.mu,
        rho: data.rho,
        Lq: data.lq,
        Wq: data.wq,
        L: data.l,
        W: data.w,
        idleProbability: data.idleProbability,
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 ml-62.5 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'models' ? 'Queueing Models' : 'Simulator'}
            </h1>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === 'models' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Model Selection */}
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                numberOfServers={numberOfServers}
                onServersChange={setNumberOfServers}
              />

              {/* Input Form */}
              {selectedModel && (
                <InputForm
                  meanInterarrivalTime={meanInterarrivalTime}
                  meanServiceTime={meanServiceTime}
                  onMeanInterarrivalTimeChange={setMeanInterarrivalTime}
                  onMeanServiceTimeChange={setMeanServiceTime}
                  onSubmit={runSimulation}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                />
              )}

              {/* Results Panel */}
              {results && <ResultsPanel results={results} />}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 border border-gray-200 dark:border-gray-800 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <span className="text-3xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Simulator Module
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
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
