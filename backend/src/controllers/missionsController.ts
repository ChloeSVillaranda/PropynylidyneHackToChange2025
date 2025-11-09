import { Request, Response } from "express";
import {
  DroneNotFoundError,
  DroneUnavailableError,
  MissionConflictError,
  MissionValidationError,
  createMission,
  deleteMission,
  getMissionById,
  listMissions,
  listMissionsByDrone,
  updateMission
} from "../services/missionsService.js";

const allowedMissionTypes = ["Patrol", "Emergency", "Data Collection"] as const;

const isValidMissionType = (value: unknown): value is (typeof allowedMissionTypes)[number] => {
  return typeof value === "string" && allowedMissionTypes.includes(value as any);
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
  const missionId = Number(id);

  if (Number.isNaN(missionId)) {
    res.status(400).json({ message: "missionId must be a number" });
    return;
  }

  const mission = await getMissionById(missionId);

  if (!mission) {
    res.status(404).json({ message: `Mission ${id} not found` });
    return;
  }

  res.json({ data: mission });
};


export const createMissionHandler = async (req: Request, res: Response) => {
  const payload = req.body;
  const ts = new Date().toISOString();
  console.log(`[${ts}] createMissionHandler - incoming payload:`, JSON.stringify(payload));

  // Basic validation: droneId required
  if (!payload?.droneId || typeof payload.droneId !== "string") {
    res.status(400).json({ message: "droneId is required and must be a string" });
    return;
  }

  if (payload.missionType && !isValidMissionType(payload.missionType)) {
    res.status(400).json({ message: `missionType must be one of: ${allowedMissionTypes.join(", ")}` });
    return;
  }

  let missionId: number | undefined;
  if (payload.missionId !== undefined) {
    const parsedId = Number(payload.missionId);
    if (Number.isNaN(parsedId)) {
      res.status(400).json({ message: "missionId must be numeric when provided" });
      return;
    }
    missionId = parsedId;
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

  if (payload.routeSuggestions !== undefined) {
    if (!Array.isArray(payload.routeSuggestions)) {
      res.status(400).json({ message: "routeSuggestions must be an array" });
      return;
    }
  }

  // Build mission object to persist
  const missionToSave = {
    missionId,
    droneId: payload.droneId,
    missionType: payload.missionType,
    startTime: payload.startTime,
    endTime: payload.endTime,
    route: payload.route,
    routeSuggestions: payload.routeSuggestions
  };

  try {
    const saved = await createMission(missionToSave);
    console.log(`[${ts}] createMissionHandler - created mission for droneId=${payload.droneId}`);
    res.status(201).json({ data: saved });
  } catch (error) {
    console.error('[createMissionHandler] Error:', error);

    if (error instanceof MissionConflictError) {
      res.status(409).json({ message: error.message, conflictingMissionId: error.conflictingMissionId });
      return;
    }

    if (error instanceof DroneNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof DroneUnavailableError) {
      res.status(409).json({ message: error.message });
      return;
    }

    if (error instanceof MissionValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `Mission conflict (rare UUID collision)` });
      return;
    }

    res.status(500).json({ message: "Failed to create mission" });
  }
};

export const updateMissionHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const missionId = Number(id);

  if (Number.isNaN(missionId)) {
    res.status(400).json({ message: "missionId must be a number" });
    return;
  }

  const updates = { ...req.body };

  // protect immutable key fields
  delete updates.missionId;

  if (Object.prototype.hasOwnProperty.call(updates, "missionType") && updates.missionType !== undefined) {
    if (!isValidMissionType(updates.missionType)) {
      res.status(400).json({ message: `missionType must be one of: ${allowedMissionTypes.join(", ")}` });
      return;
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, "droneId") && updates.droneId !== undefined) {
    if (typeof updates.droneId !== "string" || updates.droneId.trim().length === 0) {
      res.status(400).json({ message: "droneId must be a non-empty string when provided" });
      return;
    }
  }

  if (updates.route) {
    if (!Array.isArray(updates.route)) {
      res.status(400).json({ message: "route must be an array of waypoints" });
      return;
    }
    for (let i = 0; i < updates.route.length; i++) {
      const pt = updates.route[i] as any | undefined;
      if (!pt || typeof pt.latitude !== "number" || typeof pt.longitude !== "number") {
        res.status(400).json({ message: `route[${i}] must have numeric latitude and longitude` });
        return;
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, "routeSuggestions") && updates.routeSuggestions !== undefined) {
    if (!Array.isArray(updates.routeSuggestions)) {
      res.status(400).json({ message: "routeSuggestions must be an array" });
      return;
    }
  }

  const ts = new Date().toISOString();
  try {
    console.log(`[${ts}] updateMissionHandler - requested id=${missionId}, updates=${JSON.stringify(updates)}`);

    const updated = await updateMission(missionId, updates);

    if (!updated) {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    console.log(`[${ts}] updateMissionHandler - successfully updated mission id=${missionId}`);
    res.json({ data: updated });
  } catch (error) {
    if ((error as Error).message === "No fields provided to update") {
      res.status(400).json({ message: "Provide at least one field to update" });
      return;
    }

    if (error instanceof MissionConflictError) {
      res.status(409).json({ message: error.message, conflictingMissionId: error.conflictingMissionId });
      return;
    }

    if (error instanceof MissionValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof DroneNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof DroneUnavailableError) {
      res.status(409).json({ message: error.message });
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
  const missionId = Number(id);

  if (Number.isNaN(missionId)) {
    res.status(400).json({ message: "missionId must be a number" });
    return;
  }

  try {
    await deleteMission(missionId);
    res.status(204).send();
  } catch (error) {
    console.error(`[removeMission] Failed to delete mission ${missionId}:`, error);
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `Mission ${id} not found` });
      return;
    }

    res.status(500).json({ message: "Failed to delete mission" });
  }
};

