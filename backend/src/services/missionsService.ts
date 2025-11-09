import { DRONES_TABLE, documentClient } from "../config/dynamoClient.js";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { Mission } from "../models/mission.js";

const MISSION_ENTITY_TYPE = "MISSION";

const missionKey = (missionId: string) => ({
  missionId
});

export const listMissions = async (): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: DRONES_TABLE
  });

  const result = await documentClient.send(command);

  // Filter missions in memory (items that have missionId)
  return ((result.Items as any[]) ?? []).filter(item => item.missionId);
};

export const listMissionsByDrone = async (droneId: string): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: DRONES_TABLE,
    FilterExpression: "#droneId = :droneId",
    ExpressionAttributeNames: {
      "#droneId": "droneId"
    },
    ExpressionAttributeValues: {
      ":droneId": droneId
    }
  });

  const result = await documentClient.send(command);
  // Filter missions in memory
  return ((result.Items as any[]) ?? []).filter(item => item.missionId);
};

export const getMissionById = async (missionId: string): Promise<Mission | null> => {
  const command = new GetCommand({
    TableName: DRONES_TABLE,
    Key: missionKey(missionId)
  });

  const result = await documentClient.send(command);
  return (result.Item as Mission) ?? null;
};

export const createMission = async (mission: Mission): Promise<Mission> => {
  const item = {
    ...mission,
    missionId: mission.missionId!
  };

  const command = new PutCommand({
    TableName: DRONES_TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(missionId)"
  });

  await documentClient.send(command);
  return mission;
};

export const updateMission = async (
  missionId: string,
  updates: Partial<Omit<Mission, "missionId" | "entityType" | "droneId">>
): Promise<Mission | null> => {
  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided to update");
  }

  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};
  const setExpressions: string[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = value;
    setExpressions.push(`${attributeName} = ${attributeValue}`);
  });

  const command = new UpdateCommand({
    TableName: DRONES_TABLE,
    Key: missionKey(missionId),
    ConditionExpression: "attribute_exists(missionId)",
    UpdateExpression: `SET ${setExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });

  const result = await documentClient.send(command);
  return (result.Attributes as Mission) ?? null;
};

export const deleteMission = async (missionId: string): Promise<void> => {
  const command = new DeleteCommand({
    TableName: DRONES_TABLE,
    Key: missionKey(missionId),
    ConditionExpression: "attribute_exists(missionId)"
  });

  await documentClient.send(command);
};

