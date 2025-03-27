import { Card, CardContent } from "@/components/ui/card";
import { Algorithm } from "@/pages/Home";

interface AlgorithmInfoProps {
  selectedAlgorithm: Algorithm;
}

export default function AlgorithmInfo({ selectedAlgorithm }: AlgorithmInfoProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="material-icons text-primary mr-2 dark:text-blue-400">info</span>
          Algorithm Information
        </h2>
        
        <div id="algorithmInfo" className="text-sm space-y-2">
          {/* FCFS Info */}
          <div id="fcfs-info" className={`algorithm-description ${selectedAlgorithm === 'fcfs' ? '' : 'hidden'}`}>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">FCFS (First-Come-First-Serve)</h3>
            <p className="text-gray-600 mt-1 dark:text-gray-400">
              Processes requests in the order they arrive. Simple but can lead to long seek times if requests are far apart.
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
              <li>Fair scheduling (no starvation)</li>
              <li>Simple implementation</li>
              <li>Often inefficient for disk access patterns</li>
            </ul>
          </div>
          
          {/* SSTF Info */}
          <div id="sstf-info" className={`algorithm-description ${selectedAlgorithm === 'sstf' ? '' : 'hidden'}`}>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">SSTF (Shortest Seek Time First)</h3>
            <p className="text-gray-600 mt-1 dark:text-gray-400">
              Selects the request closest to the current head position. Improves performance but can cause starvation.
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
              <li>Better average seek time than FCFS</li>
              <li>Risk of indefinite postponement</li>
              <li>Not optimal for continuous operation</li>
            </ul>
          </div>
          
          {/* SCAN Info */}
          <div id="scan-info" className={`algorithm-description ${selectedAlgorithm === 'scan' ? '' : 'hidden'}`}>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">SCAN (Elevator Algorithm)</h3>
            <p className="text-gray-600 mt-1 dark:text-gray-400">
              Moves the head in one direction, serving requests until reaching the end, then reverses direction.
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
              <li>Eliminates extreme seek times</li>
              <li>Prevents indefinite postponement</li>
              <li>Can cause longer waits for locations just passed</li>
            </ul>
          </div>
          
          {/* C-SCAN Info */}
          <div id="cscan-info" className={`algorithm-description ${selectedAlgorithm === 'cscan' ? '' : 'hidden'}`}>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">C-SCAN (Circular SCAN)</h3>
            <p className="text-gray-600 mt-1 dark:text-gray-400">
              Similar to SCAN, but treats the disk as a circular list. After reaching the end, it jumps to the beginning.
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-400">
              <li>More uniform wait times than SCAN</li>
              <li>Provides better response time distribution</li>
              <li>Optimal for heavy disk usage environments</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
