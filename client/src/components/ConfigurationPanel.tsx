import { Card, CardContent } from "@/components/ui/card";
import AlgorithmInfo from "@/components/AlgorithmInfo";
import { Algorithm } from "@/pages/Home";

interface ConfigurationPanelProps {
  diskSize: number;
  setDiskSize: (size: number) => void;
  initialPosition: number;
  setInitialPosition: (position: number) => void;
  requestQueue: string;
  setRequestQueue: (queue: string) => void;
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algorithm: Algorithm) => void;
  onRunSimulation: () => void;
  isLoading: boolean;
}

export default function ConfigurationPanel({
  diskSize,
  setDiskSize,
  initialPosition,
  setInitialPosition,
  requestQueue,
  setRequestQueue,
  selectedAlgorithm,
  setSelectedAlgorithm,
  onRunSimulation,
  isLoading
}: ConfigurationPanelProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunSimulation();
  };
  
  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgorithm(e.target.value as Algorithm);
  };
  
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="material-icons text-primary mr-2 dark:text-blue-400">settings</span>
            Configuration
          </h2>
          
          <form id="configForm" className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="diskSize" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Disk Size (cylinders)
              </label>
              <input
                type="number"
                id="diskSize"
                name="diskSize"
                value={diskSize}
                min={10}
                max={1000}
                onChange={(e) => setDiskSize(parseInt(e.target.value, 10) || 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="initialPosition" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Initial Head Position
              </label>
              <input
                type="number"
                id="initialPosition"
                name="initialPosition"
                value={initialPosition}
                min={0}
                max={diskSize - 1}
                onChange={(e) => setInitialPosition(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="requestQueue" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Request Queue
                <span className="text-xs text-gray-500 dark:text-gray-400">(comma-separated)</span>
              </label>
              <input
                type="text"
                id="requestQueue"
                name="requestQueue"
                value={requestQueue}
                onChange={(e) => setRequestQueue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="algorithm" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Scheduling Algorithm
              </label>
              <div className="relative">
                <select
                  id="algorithm"
                  name="algorithm"
                  value={selectedAlgorithm}
                  onChange={handleAlgorithmChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary rounded-md appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="fcfs">FCFS (First-Come-First-Serve)</option>
                  <option value="sstf">SSTF (Shortest Seek Time First)</option>
                  <option value="scan">SCAN (Elevator Algorithm)</option>
                  <option value="cscan">C-SCAN (Circular SCAN)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <span className="material-icons text-gray-400">expand_more</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                id="runSimulation"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-icons animate-spin mr-1">refresh</span>
                ) : (
                  <span className="material-icons mr-1">play_arrow</span>
                )}
                {isLoading ? "Processing..." : "Run Simulation"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <AlgorithmInfo selectedAlgorithm={selectedAlgorithm} />
    </>
  );
}
