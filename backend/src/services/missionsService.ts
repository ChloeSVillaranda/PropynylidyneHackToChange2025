import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { MISSIONS_TABLE, documentClient } from "../config/dynamoClient.js";
import { Mission, MissionType, RoutePoint } from "../models/mission.js";

type CreateMissionInput = {
  missionId?: number;
  droneId: string;
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
};

type UpdateMissionInput = Partial<Omit<CreateMissionInput, "missionId">>;

const buildKey = (missionId: number) => ({
  missionId
});

export const listMissions = async (): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: MISSIONS_TABLE
  });

  const result = await documentClient.send(command);

  return (result.Items as Mission[]) ?? [];
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

  return (result.Items as Mission[]) ?? [];
};

export const getMissionById = async (missionId: number): Promise<Mission | null> => {
  const command = new GetCommand({
    TableName: MISSIONS_TABLE,
    Key: buildKey(missionId)
  });

  const result = await documentClient.send(command);

  return (result.Item as Mission) ?? null;
};

export const createMission = async (input: CreateMissionInput): Promise<Mission> => {
  const mission: Mission = {
    missionId: input.missionId ?? Date.now(),
    droneId: input.droneId,
    missionType: input.missionType,
    startTime: input.startTime,
    endTime: input.endTime,
    route: input.route
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
  const sanitizedUpdates: Record<string, unknown> = { ...updates };
  delete sanitizedUpdates.missionId;

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new Error("No fields provided to update");
  }

  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};
  const setExpressions: string[] = [];

  Object.entries(sanitizedUpdates).forEach(([key, value]) => {
    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = value;
    setExpressions.push(`${attributeName} = ${attributeValue}`);
  });

  const command = new UpdateCommand({
    TableName: MISSIONS_TABLE,
    Key: buildKey(missionId),
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
  const command = new DeleteCommand({
    TableName: MISSIONS_TABLE,
    Key: buildKey(missionId),
    ConditionExpression: "attribute_exists(missionId)"
  });

  await documentClient.send(command);
};

