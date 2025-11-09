import { Request, Response } from "express";
import {
  createMission,
  deleteMission,
  getMissionById,
  listMissions,
  listMissionsByDrone,
  updateMission
} from "../services/missionsService.js";

import { randomUUID } from 'crypto';

// add a local MissionType so TypeScript knows the union
type MissionType = 'Patrol' | 'Emergency' | 'Recon' | 'Delivery' | 'Survey' | 'Inspection';

const allowedMissionTypes: MissionType[] = ["Patrol", "Emergency", "Recon", "Delivery"];

const normalizeMissionType = (missionType?: unknown): MissionType | undefined => {
  if (!missionType) {
    return undefined;
  }

  const type = missionType as MissionType;

  if (allowedMissionTypes.includes(type)) {
    return type;
  }

  return type;
};

export const getMissions = async (req: Request, res: Response) => {
  const { droneId } = req.query;

  try {
    const missions = droneId
      ? await listMissionsByDrone(droneId as string)
      : await listMissions();

    res.json({ data: missions });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch missions" });
  }
};

export const getMission = async (req: Request, res: Response) => {
  const { id } = req.params;
  const mission = await getMissionById(id);

  if (!mission) {
    res.status(404).json({ message: `Mission ${id} not found` });
    return;
  }

  res.json({ data: mission });
};

export const createMissionHandler = async (req: Request, res: Response) => {
  const missionPayload = req.body;

  if (!missionPayload?.droneId) {
    res.status(400).json({ message: "droneId is required" });
    return;
  }

  const missionId = randomUUID();

  try {
    const mission = await createMission({
      entityType: "MISSION",
      droneId: missionPayload.droneId,
      missionId,
      missionType: normalizeMissionType(missionPayload.missionType),
      startTime: missionPayload.startTime,
      endTime: missionPayload.endTime,
      route: missionPayload.route,
      metadata: missionPayload.metadata
    });

    res.status(201).json({ data: mission });
  } catch (error) {
    console.error('[createMissionHandler] Error:', error);
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `Mission conflict (rare UUID collision)` });
      return;
    }

    res.status(500).json({ message: "Failed to create mission" });
  }
};

export const updateMissionHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = { ...req.body };

  delete updates.entityType;
  delete updates.missionId;
  delete updates.droneId;

  if (updates.missionType) {
    updates.missionType = normalizeMissionType(updates.missionType);
  }

  try {
    const updated = await updateMission(id, updates);
    if (!updated) {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    res.json({ data: updated });
  } catch (error) {
    if ((error as Error).message === "No fields provided to update") {
      res.status(400).json({ message: "Provide at least one field to update" });
      return;
    }
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to update mission" });
  }
};

export const removeMission = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteMission(id);
    res.status(204).send();
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    res.status(500).json({ message: "Failed to delete mission" });
  }
};

