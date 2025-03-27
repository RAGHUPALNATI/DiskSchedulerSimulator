import { Algorithm } from "@/pages/Home";

/**
 * Simulates FCFS (First-Come-First-Serve) disk scheduling algorithm
 */
export function simulateFCFS(
  initialPosition: number,
  requestQueue: number[]
): number[] {
  // In FCFS, the head simply visits each request in the order they appear in the queue
  return [initialPosition, ...requestQueue];
}

/**
 * Simulates SSTF (Shortest Seek Time First) disk scheduling algorithm
 */
export function simulateSSTF(
  initialPosition: number,
  requestQueue: number[]
): number[] {
  const result: number[] = [initialPosition];
  const remainingRequests = [...requestQueue];
  
  let currentPosition = initialPosition;
  
  while (remainingRequests.length > 0) {
    // Find the request with the shortest seek time (closest to current position)
    let shortestDistance = Infinity;
    let shortestIndex = -1;
    
    for (let i = 0; i < remainingRequests.length; i++) {
      const distance = Math.abs(currentPosition - remainingRequests[i]);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        shortestIndex = i;
      }
    }
    
    // Move to the closest request and add it to the result
    currentPosition = remainingRequests[shortestIndex];
    result.push(currentPosition);
    
    // Remove the visited request
    remainingRequests.splice(shortestIndex, 1);
  }
  
  return result;
}

/**
 * Simulates SCAN (Elevator) disk scheduling algorithm
 */
export function simulateSCAN(
  diskSize: number,
  initialPosition: number,
  requestQueue: number[]
): number[] {
  const result: number[] = [initialPosition];
  const requests = [...requestQueue];
  
  // Sort requests in ascending order
  requests.sort((a, b) => a - b);
  
  // Separate requests into greater than and less than initial position
  const greaterRequests = requests.filter(req => req > initialPosition);
  const lessRequests = requests.filter(req => req < initialPosition);
  
  // Head moves toward higher cylinder numbers first
  greaterRequests.forEach(req => result.push(req));
  
  // If we reach the end of the disk, add it
  if (greaterRequests.length > 0) {
    result.push(diskSize - 1);
  }
  
  // Then reverse direction and serve the lesser requests in descending order
  lessRequests.sort((a, b) => b - a).forEach(req => result.push(req));
  
  // If we reach the beginning of the disk, add it
  if (lessRequests.length > 0) {
    result.push(0);
  }
  
  return result;
}

/**
 * Simulates C-SCAN (Circular SCAN) disk scheduling algorithm
 */
export function simulateCSCAN(
  diskSize: number,
  initialPosition: number,
  requestQueue: number[]
): number[] {
  const result: number[] = [initialPosition];
  const requests = [...requestQueue];
  
  // Sort requests in ascending order
  requests.sort((a, b) => a - b);
  
  // Separate requests into greater than and less than initial position
  const greaterRequests = requests.filter(req => req > initialPosition);
  const lessRequests = requests.filter(req => req < initialPosition);
  
  // Head moves toward higher cylinder numbers first
  greaterRequests.forEach(req => result.push(req));
  
  // If we have requests on the other side or reach the end, jump back to start
  if (greaterRequests.length > 0 || lessRequests.length > 0) {
    // Add end of disk
    result.push(diskSize - 1);
    // Jump to beginning
    result.push(0);
  }
  
  // Then serve the lesser requests from beginning to where we started
  lessRequests.forEach(req => result.push(req));
  
  return result;
}

/**
 * Calculate performance metrics for a seek sequence
 */
export function calculateMetrics(seekSequence: number[]) {
  let totalSeekTime = 0;
  let maxSeekDistance = 0;
  
  for (let i = 1; i < seekSequence.length; i++) {
    const distance = Math.abs(seekSequence[i] - seekSequence[i - 1]);
    totalSeekTime += distance;
    maxSeekDistance = Math.max(maxSeekDistance, distance);
  }
  
  const averageSeekTime = totalSeekTime / (seekSequence.length - 1);
  
  return {
    totalSeekTime,
    averageSeekTime,
    maxSeekDistance
  };
}

/**
 * Run a simulation for a specific algorithm
 */
export function runAlgorithmSimulation(
  algorithm: Algorithm,
  diskSize: number,
  initialPosition: number,
  requestQueue: number[]
) {
  let seekSequence: number[];
  
  switch (algorithm) {
    case "fcfs":
      seekSequence = simulateFCFS(initialPosition, requestQueue);
      break;
    case "sstf":
      seekSequence = simulateSSTF(initialPosition, requestQueue);
      break;
    case "scan":
      seekSequence = simulateSCAN(diskSize, initialPosition, requestQueue);
      break;
    case "cscan":
      seekSequence = simulateCSCAN(diskSize, initialPosition, requestQueue);
      break;
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
  
  const { totalSeekTime, averageSeekTime, maxSeekDistance } = calculateMetrics(seekSequence);
  
  return {
    seekSequence: seekSequence.slice(1), // Remove initial position
    totalSeekTime,
    averageSeekTime,
    maxSeekDistance
  };
}
