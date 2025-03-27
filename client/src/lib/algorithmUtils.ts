// This file provides reusable functions for working with disk scheduling algorithms on the client

/**
 * Validate disk scheduling parameters
 */
export function validateDiskParameters(
  diskSize: number,
  initialPosition: number,
  requestQueue: number[]
): { isValid: boolean; errorMessage?: string } {
  if (diskSize < 10 || diskSize > 1000) {
    return { isValid: false, errorMessage: "Disk size must be between 10 and 1000 cylinders" };
  }
  
  if (initialPosition < 0 || initialPosition >= diskSize) {
    return { isValid: false, errorMessage: "Initial head position must be within disk size range" };
  }
  
  if (requestQueue.length === 0) {
    return { isValid: false, errorMessage: "Request queue cannot be empty" };
  }
  
  if (requestQueue.some(pos => pos < 0 || pos >= diskSize)) {
    return { isValid: false, errorMessage: "All requests must be within disk size range" };
  }
  
  return { isValid: true };
}

/**
 * Format a seek time number with proper units
 */
export function formatSeekTime(seekTime: number): string {
  return `${seekTime.toFixed(2)} cylinders`;
}

/**
 * Get a human-readable label for an algorithm
 */
export function getAlgorithmLabel(algorithm: string): string {
  const labels: Record<string, string> = {
    fcfs: "FCFS (First-Come-First-Serve)",
    sstf: "SSTF (Shortest Seek Time First)",
    scan: "SCAN (Elevator Algorithm)",
    cscan: "C-SCAN (Circular SCAN)",
  };
  
  return labels[algorithm] || algorithm.toUpperCase();
}

/**
 * Get a description of the algorithm's characteristics
 */
export function getAlgorithmCharacteristics(algorithm: string): {
  strengths: string[];
  weaknesses: string[];
} {
  switch (algorithm) {
    case "fcfs":
      return {
        strengths: ["Simple implementation", "Fair (no starvation)", "Predictable response times"],
        weaknesses: ["Poor performance with random access patterns", "High average seek times", "Inefficient for most workloads"]
      };
    case "sstf":
      return {
        strengths: ["Good average performance", "Adapts to workload patterns", "Minimizes head movement"],
        weaknesses: ["Can cause starvation", "Unpredictable response times", "Not optimal for continuous operation"]
      };
    case "scan":
      return {
        strengths: ["Prevents starvation", "Good overall performance", "Fair for most requests"],
        weaknesses: ["Longer wait times for just-missed requests", "Not optimal for sequential access", "Can be suboptimal for specific workload patterns"]
      };
    case "cscan":
      return {
        strengths: ["Uniform wait times", "Better response distribution than SCAN", "Good for heavy usage"],
        weaknesses: ["Slightly higher average seek times than SCAN", "Not ideal for clustered requests", "Higher overhead for direction changes"]
      };
    default:
      return {
        strengths: [],
        weaknesses: []
      };
  }
}
