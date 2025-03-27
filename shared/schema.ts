import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Simulation schemas
export const algorithmEnum = z.enum(["fcfs", "sstf", "scan", "cscan"]);
export type Algorithm = z.infer<typeof algorithmEnum>;

export const simulationResultSchema = z.object({
  seek_sequence: z.array(z.number()),
  total_seek_time: z.number(),
  average_seek_time: z.number(),
  max_seek_distance: z.number(),
});

export type SimulationResultType = z.infer<typeof simulationResultSchema>;

export const simulationSchema = z.object({
  disk_size: z.number().int().min(10).max(1000),
  initial_position: z.number().int().min(0),
  request_queue: z.array(z.number().int().min(0)),
  algorithm: algorithmEnum,
});

export type SimulationInputType = z.infer<typeof simulationSchema>;

export interface Simulation extends SimulationInputType {
  results: SimulationResultType;
  timestamp?: string;
}

// Table schema for simulations if we were using a database
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  disk_size: integer("disk_size").notNull(),
  initial_position: integer("initial_position").notNull(),
  request_queue: jsonb("request_queue").notNull().$type<number[]>(),
  algorithm: text("algorithm").notNull(),
  results: jsonb("results").notNull().$type<SimulationResultType>(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertSimulationSchema = createInsertSchema(simulations)
  .omit({ id: true, created_at: true });

export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
