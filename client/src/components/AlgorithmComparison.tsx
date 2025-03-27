import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ComparisonResults } from "@/pages/Home";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

interface AlgorithmComparisonProps {
  comparisonResults: ComparisonResults | null;
  requestQueue: string;
}

export default function AlgorithmComparison({
  comparisonResults,
  requestQueue
}: AlgorithmComparisonProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const hasData = comparisonResults !== null;
  
  // Parse the request queue for recommendations
  const queueLength = requestQueue
    .split(",")
    .map(x => x.trim())
    .filter(x => x.length > 0).length;
  
  useEffect(() => {
    // Cleanup previous chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    
    if (!comparisonResults || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    
    const algorithms = ['fcfs', 'sstf', 'scan', 'cscan'];
    const algorithmLabels = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'];
    
    const data = algorithms.map(algo => 
      comparisonResults[algo as keyof ComparisonResults]?.average_seek_time || 0
    );
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: algorithmLabels,
        datasets: [{
          label: 'Average Seek Time (cylinders)',
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',  // primary
            'rgba(16, 185, 129, 0.7)',  // secondary
            'rgba(139, 92, 246, 0.7)',  // accent
            'rgba(245, 158, 11, 0.7)',  // warning
          ],
          borderColor: [
            'rgb(59, 130, 246)',  // primary
            'rgb(16, 185, 129)',  // secondary
            'rgb(139, 92, 246)',  // accent
            'rgb(245, 158, 11)',  // warning
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Seek Time'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.formattedValue} cylinders`;
              }
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [comparisonResults]);
  
  // Find the best algorithm based on the comparison results
  const getBestAlgorithm = () => {
    if (!comparisonResults) return null;
    
    const algorithms = ['fcfs', 'sstf', 'scan', 'cscan'] as const;
    let best = { algo: 'fcfs' as const, value: Number.MAX_VALUE };
    
    for (const algo of algorithms) {
      const avgSeekTime = comparisonResults[algo]?.average_seek_time || 0;
      if (avgSeekTime > 0 && avgSeekTime < best.value) {
        best = { algo, value: avgSeekTime };
      }
    }
    
    return best;
  };
  
  const bestAlgo = getBestAlgorithm();
  
  // Generate recommendations based on the comparison results
  const getRecommendation = () => {
    if (!bestAlgo) return null;
    
    const recommendations = {
      fcfs: "FCFS ensures fairness but has poor performance. Consider this only when request fairness is critical.",
      sstf: "SSTF provides the best performance but may cause starvation. Use for short burst operations where request fairness isn't critical.",
      scan: "SCAN offers good performance with better fairness than SSTF. Recommended for general-purpose disk scheduling.",
      cscan: "C-SCAN provides consistent wait times and good performance. Best for heavy disk usage with many scattered requests."
    };
    
    return recommendations[bestAlgo.algo];
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="material-icons text-primary mr-2 dark:text-blue-400">compare_arrows</span>
          Algorithm Comparison
        </h2>
        
        <div id="comparisonContainer" className="mb-6 h-64">
          {!hasData ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400 text-center dark:text-gray-500">
                <p>Run simulations to generate comparison data</p>
              </div>
            </div>
          ) : null}
          <canvas 
            id="comparisonChart" 
            ref={chartRef}
            className={!hasData ? 'hidden' : ''}
          ></canvas>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1 dark:text-gray-400">FCFS</div>
            <div id="fcfs-avg-time" className="font-mono font-medium dark:text-gray-300">
              {hasData ? comparisonResults.fcfs.average_seek_time.toFixed(2) : "-"}
            </div>
          </div>
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1 dark:text-gray-400">SSTF</div>
            <div id="sstf-avg-time" className="font-mono font-medium dark:text-gray-300">
              {hasData ? comparisonResults.sstf.average_seek_time.toFixed(2) : "-"}
            </div>
          </div>
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1 dark:text-gray-400">SCAN</div>
            <div id="scan-avg-time" className="font-mono font-medium dark:text-gray-300">
              {hasData ? comparisonResults.scan.average_seek_time.toFixed(2) : "-"}
            </div>
          </div>
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1 dark:text-gray-400">C-SCAN</div>
            <div id="cscan-avg-time" className="font-mono font-medium dark:text-gray-300">
              {hasData ? comparisonResults.cscan.average_seek_time.toFixed(2) : "-"}
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Recommendations</h3>
          <div id="recommendations" className="text-sm text-gray-600 dark:text-gray-400">
            {!hasData ? (
              <p>Based on your input data, we'll provide algorithm recommendations after running the simulations.</p>
            ) : (
              <>
                <p>Based on your input data with {queueLength} requests:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>
                    {bestAlgo?.algo.toUpperCase()} provides the lowest average seek time ({bestAlgo?.value.toFixed(2)})
                  </li>
                  <li>
                    {comparisonResults.fcfs.average_seek_time > comparisonResults.sstf.average_seek_time * 1.5 
                      ? "FCFS has significantly worse performance but ensures request fairness" 
                      : "FCFS performance is comparable to other algorithms for this workload"}
                  </li>
                  <li>
                    {comparisonResults.scan.average_seek_time < comparisonResults.cscan.average_seek_time 
                      ? "SCAN outperforms C-SCAN for this specific workload" 
                      : "C-SCAN provides more uniform response times than SCAN"}
                  </li>
                </ul>
                <p className="mt-2 text-primary font-medium dark:text-blue-400">
                  Recommendation: {getRecommendation()}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
