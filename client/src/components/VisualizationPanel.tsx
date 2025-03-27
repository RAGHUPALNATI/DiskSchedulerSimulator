import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Algorithm, SimulationResults } from "@/pages/Home";
import * as d3 from "d3";

interface VisualizationPanelProps {
  diskSize: number;
  initialPosition: number;
  requestQueue: string;
  selectedAlgorithm: Algorithm;
  simulationResults: SimulationResults | null;
  onAnimate: () => void;
  onReset: () => void;
  onExport: () => void;
  registerAnimation: (animateFn: () => void) => void;
}

export default function VisualizationPanel({
  diskSize,
  initialPosition,
  requestQueue,
  selectedAlgorithm,
  simulationResults,
  onAnimate,
  onReset,
  onExport,
  registerAnimation
}: VisualizationPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasData = simulationResults !== null;
  
  useEffect(() => {
    if (!simulationResults || !svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, diskSize - 1])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, simulationResults.seek_sequence.length])
      .range([0, height]);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5));
    
    // Add Y axis (time steps)
    svg.append("g")
      .call(d3.axisLeft(yScale).ticks(simulationResults.seek_sequence.length)
        .tickFormat((d, i) => `t${i}`));
    
    // Add X axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("class", "text-xs text-gray-500 dark:text-gray-400")
      .text("Cylinder Position");
    
    // Add graph title
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("class", "text-sm font-medium text-gray-700 dark:text-gray-300")
      .text(`${selectedAlgorithm.toUpperCase()} Disk Head Movement`);
    
    // Draw initial position point
    svg.append("circle")
      .attr("cx", xScale(initialPosition))
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "var(--primary)")
      .attr("class", "initial-position");
    
    // Create line generator
    const line = d3.line<number>()
      .x(d => xScale(d))
      .y((_, i) => yScale(i + 1));
    
    // Prepare data for animation
    const lineData = [initialPosition, ...simulationResults.seek_sequence];
    
    // Create the full path (invisible initially)
    const path = svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "var(--primary)")
      .attr("stroke-width", 2)
      .attr("class", "seek-path")
      .attr("d", line as any)
      .style("opacity", 0);
    
    // Create points for each seek position (invisible initially)
    const points = svg.selectAll(".point")
      .data(simulationResults.seek_sequence)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d))
      .attr("cy", (_, i) => yScale(i + 1))
      .attr("r", 4)
      .attr("fill", "var(--primary)")
      .style("opacity", 0);
    
    // Add labels for each point (invisible initially)
    const labels = svg.selectAll(".label")
      .data(simulationResults.seek_sequence)
      .enter()
      .append("text")
      .attr("class", "label text-xs")
      .attr("x", d => xScale(d) + 8)
      .attr("y", (_, i) => yScale(i + 1) + 4)
      .text(d => d)
      .style("opacity", 0);
    
    // Create the animation function
    const animate = () => {
      // Reset to initial state
      path.style("opacity", 0);
      points.style("opacity", 0);
      labels.style("opacity", 0);
      
      // Animate the path
      const pathLength = path.node()?.getTotalLength() || 0;
      
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .style("opacity", 1)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          // After path animation, show points and labels
          points
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((_, i) => i * 100)
            .style("opacity", 1);
          
          labels
            .style("opacity", 0)
            .transition()
            .duration(100)
            .delay((_, i) => i * 100 + 50)
            .style("opacity", 1);
        });
    };
    
    // Register the animation function
    registerAnimation(animate);
    
    // Show static visualization by default
    path.style("opacity", 1);
    points.style("opacity", 1);
    labels.style("opacity", 1);
    
    // Responsive resize handler
    const handleResize = () => {
      if (!svgRef.current) return;
      
      const updatedWidth = svgRef.current.clientWidth - margin.left - margin.right;
      
      // Update scales
      xScale.range([0, updatedWidth]);
      
      // Update x-axis
      svg.select<SVGGElement>("g")
        .call(d3.axisBottom(xScale).ticks(5));
      
      // Update title position
      svg.select("text")
        .attr("x", updatedWidth / 2);
      
      // Update line
      svg.select(".seek-path")
        .attr("d", line as any);
      
      // Update points
      svg.selectAll(".point")
        .attr("cx", d => xScale(d as number));
      
      // Update labels
      svg.selectAll(".label")
        .attr("x", d => xScale(d as number) + 8);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [simulationResults, diskSize, initialPosition, selectedAlgorithm, registerAnimation]);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="material-icons text-primary mr-2 dark:text-blue-400">show_chart</span>
          Disk Head Movement Visualization
        </h2>
        
        <div className="mb-4">
          <div className="relative h-96 border border-gray-200 rounded-lg p-4 dark:border-gray-700" id="visualizationArea">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 text-center flex flex-col items-center dark:text-gray-500">
                  <span className="material-icons text-4xl mb-2">auto_graph</span>
                  <p>Run a simulation to see the disk head movement visualization</p>
                </div>
              </div>
            )}
            <svg 
              ref={svgRef}
              className={`w-full h-full ${!hasData ? 'hidden' : ''}`}
              id="visualizationSvg"
            ></svg>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Seek Sequence</h3>
            <div id="seekSequence" className="font-mono text-sm bg-gray-50 p-3 rounded max-h-24 overflow-y-auto dark:bg-gray-800 dark:text-gray-300">
              {hasData ? (
                <span>
                  <span className="text-primary dark:text-blue-400 font-medium">{initialPosition}</span>
                  {" → "}
                  {simulationResults?.seek_sequence.join(" → ")}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-gray-600">No data available</span>
              )}
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Performance Metrics</h3>
            <div id="performanceMetrics" className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Seek Time:</span>
                <span id="totalSeekTime" className="font-mono font-medium dark:text-gray-300">
                  {hasData ? `${simulationResults?.total_seek_time} cylinders` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Seek Time:</span>
                <span id="avgSeekTime" className="font-mono font-medium dark:text-gray-300">
                  {hasData ? `${simulationResults?.average_seek_time.toFixed(2)} cylinders` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Maximum Seek Distance:</span>
                <span id="maxSeekDistance" className="font-mono font-medium dark:text-gray-300">
                  {hasData ? `${simulationResults?.max_seek_distance} cylinders` : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <button 
            id="animateBtn" 
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            disabled={!hasData}
            onClick={onAnimate}
          >
            <span className="material-icons text-sm mr-1">play_circle</span>
            Animate
          </button>
          <button 
            id="resetBtn" 
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            disabled={!hasData}
            onClick={onReset}
          >
            <span className="material-icons text-sm mr-1">restart_alt</span>
            Reset
          </button>
          <button 
            id="exportBtn" 
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={!hasData}
            onClick={onExport}
          >
            <span className="material-icons text-sm mr-1">download</span>
            Export Results
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
