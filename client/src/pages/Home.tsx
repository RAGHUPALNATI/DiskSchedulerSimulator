import { useState, useRef } from "react";
import Header from "@/components/Header";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import VisualizationPanel from "@/components/VisualizationPanel";
import AlgorithmComparison from "@/components/AlgorithmComparison";
import Footer from "@/components/Footer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type Algorithm = "fcfs" | "sstf" | "scan" | "cscan";
export type SimulationResults = {
  seek_sequence: number[];
  total_seek_time: number;
  average_seek_time: number;
  max_seek_distance: number;
};

export type ComparisonResults = {
  [key in Algorithm]: {
    average_seek_time: number;
    total_seek_time: number;
    seek_sequence: number[];
  };
};

export default function Home() {
  const { toast } = useToast();
  const [diskSize, setDiskSize] = useState(200);
  const [initialPosition, setInitialPosition] = useState(50);
  const [requestQueue, setRequestQueue] = useState("95, 180, 34, 119, 11, 123, 62, 64");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("fcfs");
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);
  
  // References to control visualization functionality
  const animationRef = useRef<(() => void) | null>(null);
  
  // Run a single algorithm simulation
  const runSimulation = useMutation({
    mutationFn: async () => {
      const parsedQueue = requestQueue
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x >= 0 && x < diskSize);
      
      if (parsedQueue.length === 0) {
        throw new Error("Please enter a valid request queue");
      }
      
      if (initialPosition < 0 || initialPosition >= diskSize) {
        throw new Error("Initial head position must be within disk size range");
      }
      
      const res = await apiRequest("POST", "/api/simulate", {
        disk_size: diskSize,
        initial_position: initialPosition,
        request_queue: parsedQueue,
        algorithm: selectedAlgorithm,
      });
      
      return res.json();
    },
    onSuccess: (data: SimulationResults) => {
      setSimulationResults(data);
      toast({
        title: "Simulation Complete",
        description: `Algorithm ${selectedAlgorithm.toUpperCase()} simulation completed successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Simulation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Run comparison of all algorithms
  const runComparison = useMutation({
    mutationFn: async () => {
      const parsedQueue = requestQueue
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x >= 0 && x < diskSize);
      
      if (parsedQueue.length === 0) {
        throw new Error("Please enter a valid request queue");
      }
      
      if (initialPosition < 0 || initialPosition >= diskSize) {
        throw new Error("Initial head position must be within disk size range");
      }
      
      const res = await apiRequest("POST", "/api/compare", {
        disk_size: diskSize,
        initial_position: initialPosition,
        request_queue: parsedQueue,
      });
      
      return res.json();
    },
    onSuccess: (data: ComparisonResults) => {
      setComparisonResults(data);
      toast({
        title: "Comparison Complete",
        description: "All algorithms have been compared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Comparison Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRunSimulation = async () => {
    await runSimulation.mutateAsync();
    // After running a simulation, also update comparison data
    runComparison.mutate();
  };
  
  const handleResetVisualization = () => {
    setSimulationResults(null);
    if (animationRef.current) {
      animationRef.current = null;
    }
  };
  
  const registerAnimationFunction = (animateFn: () => void) => {
    animationRef.current = animateFn;
  };
  
  const handleAnimateVisualization = () => {
    if (animationRef.current) {
      animationRef.current();
    }
  };
  
  const handleExportResults = () => {
    if (!simulationResults) return;
    
    const algorithm = selectedAlgorithm.toUpperCase();
    const dataStr = JSON.stringify({
      algorithm,
      diskSize,
      initialPosition,
      requestQueue: requestQueue.split(",").map(x => parseInt(x.trim(), 10)),
      results: simulationResults
    }, null, 2);
    
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `disk-scheduling-${algorithm}-results.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };
  
  return (
    <div className="antialiased bg-gray-50 text-gray-800 font-sans min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-4 space-y-6">
            <ConfigurationPanel
              diskSize={diskSize}
              setDiskSize={setDiskSize}
              initialPosition={initialPosition}
              setInitialPosition={setInitialPosition}
              requestQueue={requestQueue}
              setRequestQueue={setRequestQueue}
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              onRunSimulation={handleRunSimulation}
              isLoading={runSimulation.isPending}
            />
          </div>
          
          {/* Simulation Panel */}
          <div className="lg:col-span-8 space-y-6">
            <VisualizationPanel
              diskSize={diskSize}
              initialPosition={initialPosition}
              requestQueue={requestQueue}
              selectedAlgorithm={selectedAlgorithm}
              simulationResults={simulationResults}
              onAnimate={handleAnimateVisualization}
              onReset={handleResetVisualization}
              onExport={handleExportResults}
              registerAnimation={registerAnimationFunction}
            />
            
            <AlgorithmComparison
              comparisonResults={comparisonResults}
              requestQueue={requestQueue}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
