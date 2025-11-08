import { Request, Response } from "express";

import {
  createDrone,
  deleteDrone,
  getDroneById,
  listDrones,
  updateDrone,
  updateDroneStatus
} from "../services/dronesService.js";

export const getDrones = async (_req: Request, res: Response) => {
  try {
    const drones = await listDrones();
    res.json(drones);
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

  res.json(drone);
};

export const createDroneHandler = async (req: Request, res: Response) => {
  const dronePayload = req.body;

  if (!dronePayload?.droneId) {
    res.status(400).json({ message: "droneId is required" });
    return;
  }

  try {
    const saved = await createDrone({
      entityType: "profile",
      ...dronePayload
    });
    res.status(201).json(saved);
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `Drone ${dronePayload.droneId} already exists` });
      return;
    }

    res.status(500).json({ message: "Failed to create drone" });
  }
};

export const updateDroneHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates.droneId;
  delete updates.entityType;

  try {
    const updated = await updateDrone(id, updates);
    if (!updated) {
      res.status(404).json({ message: `Drone ${id} not found` });
      return;
    }

    res.json(updated);
  } catch (error) {
    if ((error as Error).message === "No fields provided to update") {
      res.status(400).json({ message: "Provide at least one field to update" });
      return;
    }
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Drone ${id} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to update drone" });
  }
};

export const setDroneStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ message: "status is required" });
    return;
  }

  try {
    await updateDroneStatus(id, status);
    res.status(204).send();
  } catch (error) {
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
    droneId: drone.droneId,
    currentLocation: drone.currentLocation,
    status: drone.status,
    updatedAt: drone.lastImageTimestamp
  });
};

