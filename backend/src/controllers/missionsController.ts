import { Request, Response } from "express";

import {
  createMission,
  deleteMission,
  getMissionById,
  listMissions,
  listMissionsByDrone,
  updateMission
} from "../services/missionsService.js";

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

// Create mission handler: more tolerant validation + logging
export const createMissionHandler = async (req: Request, res: Response) => {
  const payload = req.body;
  const ts = new Date().toISOString();
  console.log(`[${ts}] createMissionHandler - incoming payload:`, JSON.stringify(payload));

  // Basic validation: droneId required
  if (!payload?.droneId || typeof payload.droneId !== "string") {
    res.status(400).json({ message: "droneId is required and must be a string" });
    return;
  }

  // Validate route if present
  if (payload.route) {
    if (!Array.isArray(payload.route)) {
      res.status(400).json({ message: "route must be an array of waypoints" });
      return;
    }
    for (let i = 0; i < payload.route.length; i++) {
      // avoid depending on a RoutePoint type from the JS model; validate dynamically
      const pt = payload.route[i] as any | undefined;
      if (!pt || typeof pt.latitude !== "number" || typeof pt.longitude !== "number") {
        res.status(400).json({ message: `route[${i}] must have numeric latitude and longitude` });
        return;
      }
    }
  }

  // Normalize missionType if provided
  const missionType = payload.missionType && typeof payload.missionType === "string"
    ? payload.missionType
    : undefined;

  // Build mission object to persist
  const missionToSave = {
    droneId: payload.droneId,
    entityType: "MISSION",
    missionType,
    startTime: payload.startTime,
    endTime: payload.endTime,
    route: payload.route,
    // include any additional optional fields present
    ...(payload.metadata && { metadata: payload.metadata }),
  };

  try {
    const saved = await createMission(missionToSave as any);
    console.log(`[${ts}] createMissionHandler - created mission for droneId=${payload.droneId}`);
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error(`[${ts}] createMissionHandler - error:`, error);
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `Mission for ${payload.droneId} already exists` });
      return;
    }
    res.status(500).json({ message: "Failed to create mission" });
  }
};

export const updateMissionHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // protect immutable key fields
  delete updates.entityType;
  delete updates.missionId;
  delete updates.droneId;

  if (updates.missionType) {
    updates.missionType = normalizeMissionType(updates.missionType);
  }

  const ts = new Date().toISOString();
  try {
    console.log(`[${ts}] updateMissionHandler - requested id=${id}, updates=${JSON.stringify(updates)}`);

    // Try direct lookup by the provided id
    let stored = await getMissionById(id);
    let keyToUse = id;

    if (!stored) {
      console.log(`[${ts}] updateMissionHandler - direct lookup failed for id=${id}, scanning missions for a match`);
      const all = await listMissions();

      const found = all.find((m: any) =>
        m?.droneId === id || m?.missionId === id || m?.assignedDroneId === id
      );

      if (!found) {
        console.log(`[${ts}] updateMissionHandler - no mission found matching id=${id}`);
        res.status(404).json({ message: `Mission ${id} not found` });
        return;
      }

      // Determine actual stored key (prefer droneId if present)
      keyToUse = found.droneId ?? found.missionId ?? found.assignedDroneId;
      stored = found;
      console.log(`[${ts}] updateMissionHandler - matched stored mission key: ${keyToUse}`);
    } else {
      console.log(`[${ts}] updateMissionHandler - direct lookup succeeded for id=${id}`);
    }

    // Proceed to update using the discovered key
    const updated = await updateMission(keyToUse, updates);

    if (!updated) {
      console.log(`[${ts}] updateMissionHandler - update returned null for key=${keyToUse}`);
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    console.log(`[${ts}] updateMissionHandler - successfully updated mission key=${keyToUse}`);
    res.json({ data: updated });
  } catch (error) {
    // Print full error and stack for debugging
    console.error(`[${ts}] updateMissionHandler - Error:`, error);
    if ((error as any)?.stack) {
      console.error((error as any).stack);
    }

    // Preserve previous behavior for specific errors
    if ((error as Error).message === "No fields provided to update") {
      res.status(400).json({ message: "Provide at least one field to update" });
      return;
    }
    if ((error as any)?.name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    // Return error message to client (helpful for debugging)
    res.status(500).json({ message: (error as Error).message || "Failed to update mission" });
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

