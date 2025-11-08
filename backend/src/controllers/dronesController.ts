const allowedStatuses: DroneStatus[] = ["Available", "Busy", "Maintenance"];

const ensureValidStatus = (value: unknown): DroneStatus => {
  if (!value) {
    throw new Error("status is required");
  }

  const status = value as DroneStatus;
  if (!allowedStatuses.includes(status)) {
    throw new Error(`status must be one of ${allowedStatuses.join(", ")}`);
  }

  return status;
};
import { Request, Response } from "express";

import {
  createDrone,
  deleteDrone,
  getDroneById,
  listDrones,
  updateDrone,
  updateDroneStatus
} from "../services/dronesService.js";
import { listMissionsByDrone } from "../services/missionsService.js";
import { DroneStatus } from "../models/drone.js";

export const getDrones = async (_req: Request, res: Response) => {
  try {
    const drones = await listDrones();
    res.json({ data: drones });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch drones" });
  }
};

export const getDrone = async (req: Request, res: Response) => {
  const { id } = req.params;
  const drone = await getDroneById(id);

  if (!drone) {
    res.status(404).json({ message: `Drone ${id} not found` });
    return;
  }

  res.json({ data: drone });
};

export const createDroneHandler = async (req: Request, res: Response) => {
  const dronePayload = req.body;

  if (!dronePayload?.droneId) {
    res.status(400).json({ message: "droneId is required" });
    return;
  }

  try {
    const { droneId, model, status: statusInput, ...rest } = dronePayload;

    if (!model) {
      res.status(400).json({ message: "model is required" });
      return;
    }

    const status = statusInput ? ensureValidStatus(statusInput) : "Available";
    const saved = await createDrone({
      entityType: "DRONE",
      droneId,
      model,
      status,
      currentLocation: rest.currentLocation,
      patrolSchedule: rest.patrolSchedule,
      lastImageTimestamp: rest.lastImageTimestamp,
      lastMaintenance: rest.lastMaintenance,
      metadata: rest.metadata
    });
    res.status(201).json({ data: saved });
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `Drone ${dronePayload.droneId} already exists` });
      return;
    }

    res.status(500).json({ message: "Failed to create drone" });
  }
};

export const updateDroneHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { droneId } = req.params;
    const updates = req.body;

    console.log(`[updateDrone] Attempting to update drone: ${droneId}`);
    console.log(`[updateDrone] Update data:`, JSON.stringify(updates));

    // Check if drone exists first
    const existingDrone = await getDroneById(droneId);
    if (!existingDrone) {
      console.log(`[updateDrone] Drone not found: ${droneId}`);
      res.status(404).json({ error: "Drone not found" });
      return;
    }

    console.log(`[updateDrone] Found existing drone:`, JSON.stringify(existingDrone));

    const updatedDrone = await updateDrone(droneId, updates);
    
    console.log(`[updateDrone] Successfully updated drone:`, JSON.stringify(updatedDrone));
    
    res.json({ data: updatedDrone });
  } catch (error) {
    console.error("[updateDrone] Error:", error);
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ error: "Drone not found" });
    } else {
      res.status(500).json({ error: "Failed to update drone" });
    }
  }
};

export const setDroneStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const normalizedStatus = ensureValidStatus(status);
    await updateDroneStatus(id, normalizedStatus);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("status must be one of")) {
      res.status(400).json({ message: error.message });
      return;
    }
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Drone ${id} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to update drone status" });
  }
};

export const removeDrone = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await deleteDrone(id);
    res.status(204).send();
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Drone ${id} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to delete drone" });
  }
};

export const getDroneLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const drone = await getDroneById(id);

  if (!drone) {
    res.status(404).json({ message: `Drone ${id} not found` });
    return;
  }

  res.json({
    data: {
      droneId: drone.droneId,
      currentLocation: drone.currentLocation,
      status: drone.status,
      updatedAt: drone.lastImageTimestamp
    }
  });
};

export const getDroneDetail = async (req: Request, res: Response) => {
  const { id } = req.params;

  const drone = await getDroneById(id);

  if (!drone) {
    res.status(404).json({ message: `Drone ${id} not found` });
    return;
  }

  const missions = await listMissionsByDrone(id);

  res.json({
    data: {
      drone,
      missions
    }
  });
};

