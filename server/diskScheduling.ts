import { Algorithm, SimulationResultType } from "@shared/schema";
import numpy from "numpy";

/**
 * Simulate FCFS (First-Come-First-Serve) disk scheduling algorithm
 */
function fcfs(initialPosition: number, requestQueue: number[]): number[] {
  // FCFS simply processes requests in the order they arrive
  return requestQueue;
}

/**
 * Simulate SSTF (Shortest Seek Time First) disk scheduling algorithm
 */
function sstf(initialPosition: number, requestQueue: number[]): number[] {
  const result: number[] = [];
  const unprocessed = [...requestQueue];
  let currentPosition = initialPosition;
  
  while (unprocessed.length > 0) {
    // Find the closest request to the current position
    let minDistance = Infinity;
    let minIndex = -1;
    
    for (let i = 0; i < unprocessed.length; i++) {
      const distance = Math.abs(currentPosition - unprocessed[i]);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }
    
    // Move to the closest request
    currentPosition = unprocessed[minIndex];
    result.push(currentPosition);
    
    // Remove the processed request
    unprocessed.splice(minIndex, 1);
  }
  
  return result;
}

/**
 * Simulate SCAN (Elevator) disk scheduling algorithm
 */
function scan(diskSize: number, initialPosition: number, requestQueue: number[]): number[] {
  const result: number[] = [];
  let currentPosition = initialPosition;
  
  // Clone and sort the request queue
  const sortedRequests = [...requestQueue].sort((a, b) => a - b);
  
  // Find requests greater than the initial position
  const greaterRequests = sortedRequests.filter(req => req >= currentPosition);
  // Find requests less than the initial position
  const lessRequests = sortedRequests.filter(req => req < currentPosition).sort((a, b) => b - a);
  
  // First move toward the end of the disk
  for (const request of greaterRequests) {
    result.push(request);
  }
  
  // If there are any requests before the initial position
  if (lessRequests.length > 0) {
    // If the head reached the edge and no request is at the edge, add the edge
    if (greaterRequests.length > 0 && greaterRequests[greaterRequests.length - 1] < diskSize - 1) {
      result.push(diskSize - 1);
    }
    
    // Then change direction and process the remaining requests
    for (const request of lessRequests) {
      result.push(request);
    }
  }
  
  return result;
}

/**
 * Simulate C-SCAN (Circular SCAN) disk scheduling algorithm
 */
function cscan(diskSize: number, initialPosition: number, requestQueue: number[]): number[] {
  const result: number[] = [];
  let currentPosition = initialPosition;
  
  // Clone and sort the request queue
  const sortedRequests = [...requestQueue].sort((a, b) => a - b);
  
  // Find requests greater than the initial position
  const greaterRequests = sortedRequests.filter(req => req >= currentPosition);
  // Find requests less than the initial position
  const lessRequests = sortedRequests.filter(req => req < currentPosition);
  
  // First move toward the end of the disk
  for (const request of greaterRequests) {
    result.push(request);
  }
  
  // If there are any requests before the initial position
  if (lessRequests.length > 0) {
    // If the head didn't reach the edge and there are requests on the other side, add the edge
    if (greaterRequests.length === 0 || greaterRequests[greaterRequests.length - 1] < diskSize - 1) {
      result.push(diskSize - 1);
    }
    
    // Jump to the beginning
    result.push(0);
    
    // Process the remaining requests from the beginning
    for (const request of lessRequests) {
      result.push(request);
    }
  }
  
  return result;
}

/**
 * Calculate metrics for a disk scheduling algorithm
 */
function calculateMetrics(
  initialPosition: number,
  seekSequence: number[]
): { total_seek_time: number; average_seek_time: number; max_seek_distance: number } {
  let totalSeekTime = 0;
  let maxSeekDistance = 0;
  
  // Calculate the distance from initial position to first request
  let currentPosition = initialPosition;
  
  for (const position of seekSequence) {
    const distance = Math.abs(position - currentPosition);
    totalSeekTime += distance;
    maxSeekDistance = Math.max(maxSeekDistance, distance);
    currentPosition = position;
  }
  
  return {
    total_seek_time: totalSeekTime,
    average_seek_time: totalSeekTime / seekSequence.length,
    max_seek_distance: maxSeekDistance
  };
}

/**
 * Simulate disk scheduling algorithm based on the specified algorithm
 */
export function simulateDiskScheduling(
  diskSize: number,
  initialPosition: number,
  requestQueue: number[],
  algorithm: Algorithm
): SimulationResultType {
  // Generate seek sequence based on algorithm
  let seekSequence: number[];
  
  switch (algorithm) {
    case "fcfs":
      seekSequence = fcfs(initialPosition, requestQueue);
      break;
    case "sstf":
      seekSequence = sstf(initialPosition, requestQueue);
      break;
    case "scan":
      seekSequence = scan(diskSize, initialPosition, requestQueue);
      break;
    case "cscan":
      seekSequence = cscan(diskSize, initialPosition, requestQueue);
      break;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
  
  // Calculate performance metrics
  const metrics = calculateMetrics(initialPosition, seekSequence);
  
  return {
    seek_sequence: seekSequence,
    ...metrics
  };
}

/**
 * Compare all disk scheduling algorithms
 */
export function compareAllAlgorithms(
  diskSize: number,
  initialPosition: number,
  requestQueue: number[]
) {
  const algorithms: Algorithm[] = ["fcfs", "sstf", "scan", "cscan"];
  const results: Record<string, SimulationResultType> = {};
  
  for (const algorithm of algorithms) {
    results[algorithm] = simulateDiskScheduling(
      diskSize,
      initialPosition,
      requestQueue,
      algorithm
    );
  }
  
  return results;
}
