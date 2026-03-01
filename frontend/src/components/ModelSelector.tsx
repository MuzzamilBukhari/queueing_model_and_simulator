"use client";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  numberOfServers: number;
  onServersChange: (servers: number) => void;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  numberOfServers,
  onServersChange,
}: ModelSelectorProps) {
  const models = ['M/M/1', 'M/G/1', 'G/G/1', 'M/M/s'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Model Selection
      </h2>

      {/* Model Dropdown */}
      <div className="space-y-4">
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
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 cursor-pointer
                     hover:border-gray-400 dark:hover:border-gray-600"
          >
            <option value="">Choose a model...</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Input for M/M/s */}
        {selectedModel === 'M/M/s' && (
          <div className="animate-fadeIn">
            <label
              htmlFor="servers-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Number of servers (s)
            </label>
            <input
              id="servers-input"
              type="number"
              min="1"
              value={numberOfServers}
              onChange={(e) => onServersChange(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200
                       hover:border-gray-400 dark:hover:border-gray-600"
              placeholder="Enter number of servers"
            />
          </div>
        )}
      </div>
    </div>
  );
}
