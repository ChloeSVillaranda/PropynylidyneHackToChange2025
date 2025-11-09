import { randomUUID } from "crypto";

import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { MISSIONS_TABLE, documentClient } from "../config/dynamoClient.js";
import {
  Mission,
  MissionType,
  RoutePoint,
  RouteSuggestion,
  RouteSuggestionStatus
} from "../models/mission.js";
import { Drone } from "../models/drone.js";
import { getDroneById } from "./dronesService.js";

type RouteSuggestionInput = {
  suggestionId?: string;
  summary: string;
  status?: RouteSuggestionStatus;
  suggestedRoute?: RoutePoint[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CreateMissionInput = {
  missionId?: number;
  droneId: string;
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  routeSuggestions?: RouteSuggestionInput[];
};

type UpdateMissionInput = Partial<Omit<CreateMissionInput, "missionId">>;

export class MissionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionValidationError";
  }
}

export class MissionConflictError extends MissionValidationError {
  conflictingMissionId?: number;

  constructor(message: string, conflictingMissionId?: number) {
    super(message);
    this.name = "MissionConflictError";
    this.conflictingMissionId = conflictingMissionId;
  }
}

export class DroneNotFoundError extends MissionValidationError {
  constructor(droneId: string) {
    super(`Drone ${droneId} not found`);
    this.name = "DroneNotFoundError";
  }
}

export class DroneUnavailableError extends MissionValidationError {
  constructor(droneId: string, status: Drone["status"]) {
    super(`Drone ${droneId} is currently ${status} and cannot accept missions`);
    this.name = "DroneUnavailableError";
  }
}

const ROUTE_SUGGESTION_STATUSES: RouteSuggestionStatus[] = ["pending", "in-progress", "completed"];

const parseTimestamp = (value: string | undefined, fieldName: string): Date | null => {
  if (value === undefined) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new MissionValidationError(`${fieldName} must be a valid ISO 8601 timestamp`);
  }
  return date;
};

const tryParseTimestamp = (value: string | undefined): Date | null => {
  if (value === undefined) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeRoutePoint = (point: RoutePoint, index: number, context: string): RoutePoint => {
  if (typeof point !== "object" || point === null) {
    throw new MissionValidationError(`${context}[${index}] must be an object with latitude and longitude`);
  }

  const { latitude, longitude } = point as RoutePoint;

  if (typeof latitude !== "number" || Number.isNaN(latitude)) {
    throw new MissionValidationError(`${context}[${index}].latitude must be a number`);
  }

  if (typeof longitude !== "number" || Number.isNaN(longitude)) {
    throw new MissionValidationError(`${context}[${index}].longitude must be a number`);
  }

  return {
    latitude,
    longitude
  };
};

const normalizeRoutePoints = (route: RoutePoint[] | undefined, context: string): RoutePoint[] | undefined => {
  if (route === undefined) {
    return undefined;
  }

  if (!Array.isArray(route)) {
    throw new MissionValidationError(`${context} must be an array`);
  }

  return route.map((point, index) => normalizeRoutePoint(point, index, context));
};

const normalizeRouteSuggestions = (
  input: RouteSuggestionInput[] | undefined,
  existing: RouteSuggestion[] | undefined,
  nowIso: string
): RouteSuggestion[] | undefined => {
  if (input === undefined) {
    return undefined;
  }

  if (!Array.isArray(input)) {
    throw new MissionValidationError("routeSuggestions must be an array");
  }

  const existingById = new Map((existing ?? []).map(suggestion => [suggestion.suggestionId, suggestion]));

  return input.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new MissionValidationError(`routeSuggestions[${index}] must be an object`);
    }

    if (typeof item.summary !== "string" || item.summary.trim().length === 0) {
      throw new MissionValidationError(`routeSuggestions[${index}].summary is required`);
    }

    const suggestionId = item.suggestionId ?? randomUUID();
    const normalizedStatus = item.status ?? existingById.get(suggestionId)?.status ?? "pending";

    if (!ROUTE_SUGGESTION_STATUSES.includes(normalizedStatus)) {
      throw new MissionValidationError(
        `routeSuggestions[${index}].status must be one of ${ROUTE_SUGGESTION_STATUSES.join(", ")}`
      );
    }

    const previous = existingById.get(suggestionId);

    const normalizedRoute = item.suggestedRoute !== undefined
      ? normalizeRoutePoints(item.suggestedRoute, `routeSuggestions[${index}].suggestedRoute`)
      : previous?.suggestedRoute;

    return {
      suggestionId,
      summary: item.summary.trim(),
      status: normalizedStatus,
      suggestedRoute: normalizedRoute,
      notes: item.notes ?? previous?.notes,
      createdAt: item.createdAt ?? previous?.createdAt ?? nowIso,
      updatedAt: nowIso
    };
  });
};

const ensureDroneIsEligible = async (
  droneIdRaw: string,
  options: { enforceAvailability?: boolean } = {}
): Promise<Drone> => {
  const { enforceAvailability = true } = options;

  if (typeof droneIdRaw !== "string" || droneIdRaw.trim().length === 0) {
    throw new MissionValidationError("droneId must be a non-empty string");
  }

  const droneId = droneIdRaw.trim();
  const drone = await getDroneById(droneId);

  if (!drone) {
    throw new DroneNotFoundError(droneId);
  }

  if (enforceAvailability && drone.status === "Maintenance") {
    throw new DroneUnavailableError(droneId, drone.status);
  }

  return drone;
};

const ensureMissionScheduleIsValid = async (params: {
  missionId?: number;
  droneId: string;
  startTime?: string;
  endTime?: string;
}) => {
  const { missionId, droneId, startTime, endTime } = params;

  const start = parseTimestamp(startTime, "startTime");
  const end = parseTimestamp(endTime, "endTime");

  // Missions without scheduling windows are considered unscheduled and skip conflict checks.
  if (!start && !end) {
    return;
  }

  if (start && end && start.getTime() > end.getTime()) {
    throw new MissionValidationError("startTime must be earlier than or equal to endTime");
  }

  if (!start && end) {
    throw new MissionValidationError("startTime is required when endTime is provided");
  }

  const plannedStart = start?.getTime() ?? Number.NEGATIVE_INFINITY;
  const plannedEnd = end?.getTime() ?? Number.POSITIVE_INFINITY;

  const existingMissions = await listMissionsByDrone(droneId);

  const conflictingMission = existingMissions.find(existing => {
    if (missionId !== undefined && existing.missionId === missionId) {
      return false;
    }

    const existingStartDate = tryParseTimestamp(existing.startTime);
    const existingEndDate = tryParseTimestamp(existing.endTime);

    if (!existingStartDate && !existingEndDate) {
      // Existing mission is unscheduled; skip conflict detection.
      return false;
    }

    const existingStart = existingStartDate?.getTime() ?? Number.NEGATIVE_INFINITY;
    const existingEnd = existingEndDate?.getTime() ?? Number.POSITIVE_INFINITY;

    const rangesOverlap =
      plannedStart <= existingEnd &&
      existingStart <= plannedEnd;

    return rangesOverlap;
  });

  if (conflictingMission) {
    throw new MissionConflictError(
      `Mission conflicts with existing mission ${conflictingMission.missionId} for drone ${droneId}`,
      conflictingMission.missionId
    );
  }
};

const buildKey = (missionId: number, droneId: string) => ({
  missionId,
  droneId
});

export const listMissions = async (): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: MISSIONS_TABLE
  });

  const result = await documentClient.send(command);

  // Filter missions in memory (items that have missionId)
  return ((result.Items as any[]) ?? []).filter(item => item.missionId);
};

export const listMissionsByDrone = async (droneId: string): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: MISSIONS_TABLE,
    FilterExpression: "droneId = :droneId",
    ExpressionAttributeValues: {
      ":droneId": droneId
    }
  });

  const result = await documentClient.send(command);
  // Filter missions in memory
  return ((result.Items as any[]) ?? []).filter(item => item.missionId);
};

export const getMissionById = async (missionId: number): Promise<Mission | null> => {
  const command = new QueryCommand({
    TableName: MISSIONS_TABLE,
    KeyConditionExpression: "missionId = :missionId",
    ExpressionAttributeValues: {
      ":missionId": missionId
    },
    Limit: 1
  });

  const result = await documentClient.send(command);
  const [item] = (result.Items as Mission[]) ?? [];
  return item ?? null;
};

export const createMission = async (input: CreateMissionInput): Promise<Mission> => {
  const nowIso = new Date().toISOString();

  const drone = await ensureDroneIsEligible(input.droneId);

  await ensureMissionScheduleIsValid({
    missionId: input.missionId,
    droneId: drone.droneId,
    startTime: input.startTime,
    endTime: input.endTime
  });

  const normalizedRoute = normalizeRoutePoints(input.route, "route");
  const normalizedSuggestions = normalizeRouteSuggestions(input.routeSuggestions, undefined, nowIso);

  const mission: Mission = {
    missionId: input.missionId ?? Date.now(),
    droneId: drone.droneId,
    missionType: input.missionType,
    startTime: input.startTime,
    endTime: input.endTime,
    route: normalizedRoute,
    routeSuggestions: normalizedSuggestions
  };

  const command = new PutCommand({
    TableName: MISSIONS_TABLE,
    Item: mission,
    ConditionExpression: "attribute_not_exists(missionId)"
  });

  await documentClient.send(command);

  return mission;
};

export const updateMission = async (
  missionId: number,
  updates: UpdateMissionInput
): Promise<Mission | null> => {
  const existingMission = await getMissionById(missionId);

  if (!existingMission) {
    return null;
  }

  const nowIso = new Date().toISOString();

  const targetDroneId = updates.droneId ?? existingMission.droneId;
  const shouldEnforceAvailability =
    updates.droneId !== undefined || updates.startTime !== undefined || updates.endTime !== undefined;

  const drone = await ensureDroneIsEligible(targetDroneId, { enforceAvailability: shouldEnforceAvailability });

  const nextStartTime = updates.startTime ?? existingMission.startTime;
  const nextEndTime = updates.endTime ?? existingMission.endTime;

  await ensureMissionScheduleIsValid({
    missionId,
    droneId: drone.droneId,
    startTime: nextStartTime,
    endTime: nextEndTime
  });

  const normalizedRoute =
    updates.route !== undefined
      ? normalizeRoutePoints(updates.route, "route")
      : existingMission.route;

  const normalizedRouteSuggestions = normalizeRouteSuggestions(
    updates.routeSuggestions,
    existingMission.routeSuggestions,
    nowIso
  );

  if (updates.droneId !== undefined && updates.droneId !== existingMission.droneId) {
    throw new MissionValidationError("droneId cannot be changed for an existing mission");
  }

  const mutation: Record<string, unknown> = {};

  if (updates.droneId !== undefined && drone.droneId !== existingMission.droneId) {
    mutation.droneId = drone.droneId;
  } else if (updates.droneId !== undefined) {
    mutation.droneId = drone.droneId;
  }

  if (updates.missionType !== undefined) {
    mutation.missionType = updates.missionType;
  }

  if (updates.startTime !== undefined) {
    mutation.startTime = nextStartTime;
  }

  if (updates.endTime !== undefined) {
    mutation.endTime = nextEndTime;
  }

  if (updates.route !== undefined) {
    mutation.route = normalizedRoute ?? [];
  }

  if (updates.routeSuggestions !== undefined) {
    mutation.routeSuggestions = normalizedRouteSuggestions ?? [];
  }

  if (Object.keys(mutation).length === 0) {
    throw new Error("No fields provided to update");
  }

  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};
  const setExpressions: string[] = [];

  Object.entries(mutation).forEach(([key, value]) => {
    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = value;
    setExpressions.push(`${attributeName} = ${attributeValue}`);
  });

  const command = new UpdateCommand({
    TableName: MISSIONS_TABLE,
    Key: buildKey(existingMission.missionId, existingMission.droneId),
    ConditionExpression: "attribute_exists(missionId)",
    UpdateExpression: `SET ${setExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });

  const result = await documentClient.send(command);
  return (result.Attributes as Mission) ?? null;
};

export const deleteMission = async (missionId: number): Promise<void> => {
  const mission = await getMissionById(missionId);

  if (!mission) {
    const error = new Error(`Mission ${missionId} not found`);
    error.name = "ConditionalCheckFailedException";
    throw error;
  }

  const command = new DeleteCommand({
    TableName: MISSIONS_TABLE,
    Key: buildKey(mission.missionId, mission.droneId),
    ConditionExpression: "attribute_exists(missionId) AND attribute_exists(droneId)"
  });

  await documentClient.send(command);
};

