import { users, type User, type InsertUser, Simulation, SimulationResultType } from "@shared/schema";
import { Algorithm } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveSimulation(simulation: Simulation): Promise<void>;
  getSimulationHistory(): Promise<Simulation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private simulations: Simulation[];
  currentId: number;

  constructor() {
    this.users = new Map();
    this.simulations = [];
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async saveSimulation(simulation: Simulation): Promise<void> {
    // Add timestamp to the simulation
    const simulationWithTimestamp = {
      ...simulation,
      timestamp: new Date().toISOString()
    };
    
    // Add to storage (limit to last 100 simulations)
    this.simulations.push(simulationWithTimestamp);
    if (this.simulations.length > 100) {
      this.simulations.shift();
    }
  }
  
  async getSimulationHistory(): Promise<Simulation[]> {
    // Return simulations in reverse chronological order
    return [...this.simulations].reverse();
  }
}

export const storage = new MemStorage();
