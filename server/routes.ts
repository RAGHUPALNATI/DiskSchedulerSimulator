import express, { type Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { simulateDiskScheduling, compareAllAlgorithms } from "./diskScheduling";
import { z } from "zod";
import { simulationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router
  const apiRouter = express.Router();
  
  // Simulate a single disk scheduling algorithm
  apiRouter.post("/simulate", async (req, res) => {
    try {
      // Validate request body
      const result = simulationSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request parameters", errors: result.error.errors });
      }
      
      const { disk_size, initial_position, request_queue, algorithm } = result.data;
      
      // Run the simulation
      const simulationResult = simulateDiskScheduling(
        disk_size,
        initial_position,
        request_queue,
        algorithm
      );
      
      // Save the simulation to history if needed
      await storage.saveSimulation({
        disk_size,
        initial_position,
        request_queue,
        algorithm,
        results: simulationResult
      });
      
      res.json(simulationResult);
    } catch (error) {
      console.error("Error in /simulate:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Compare all disk scheduling algorithms
  apiRouter.post("/compare", async (req, res) => {
    try {
      // Validate request body
      const comparisonSchema = simulationSchema.omit({ algorithm: true });
      const result = comparisonSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request parameters", errors: result.error.errors });
      }
      
      const { disk_size, initial_position, request_queue } = result.data;
      
      // Compare all algorithms
      const comparisonResult = compareAllAlgorithms(
        disk_size,
        initial_position,
        request_queue
      );
      
      res.json(comparisonResult);
    } catch (error) {
      console.error("Error in /compare:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get simulation history
  apiRouter.get("/history", async (req, res) => {
    try {
      const history = await storage.getSimulationHistory();
      res.json(history);
    } catch (error) {
      console.error("Error in /history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  const httpServer = new (await import("http")).Server(app);
  
  return httpServer;
}
