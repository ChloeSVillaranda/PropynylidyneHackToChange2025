import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { DRONES_TABLE, documentClient } from "../config/dynamoClient.js";
import { Mission } from "../models/mission.js";

const MISSION_ENTITY_TYPE = "MISSION";

const missionKey = (missionId: string) => ({
  droneId: missionId,
  entityType: MISSION_ENTITY_TYPE
});

export const listMissions = async (): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: DRONES_TABLE,
    FilterExpression: "#entityType = :entityType",
    ExpressionAttributeNames: {
      "#entityType": "entityType"
    },
    ExpressionAttributeValues: {
      ":entityType": MISSION_ENTITY_TYPE
    }
  });

  const result = await documentClient.send(command);

  return (result.Items as Mission[]) ?? [];
};

export const listMissionsByDrone = async (droneId: string): Promise<Mission[]> => {
  const command = new ScanCommand({
    TableName: DRONES_TABLE,
    FilterExpression: "#entityType = :entityType AND assignedDroneId = :assignedDroneId",
    ExpressionAttributeNames: {
      "#entityType": "entityType"
    },
    ExpressionAttributeValues: {
      ":entityType": MISSION_ENTITY_TYPE,
      ":assignedDroneId": droneId
    }
  });

  const result = await documentClient.send(command);

  return (result.Items as Mission[]) ?? [];
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
  const item: Mission = {
    ...mission,
    entityType: MISSION_ENTITY_TYPE
  };

  const command = new PutCommand({
    TableName: DRONES_TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(droneId) AND attribute_not_exists(entityType)"
  });

  await documentClient.send(command);

  return item;
};

export const updateMission = async (
  missionId: string,
  updates: Partial<Omit<Mission, "droneId" | "entityType">>
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
    ConditionExpression: "attribute_exists(droneId) AND attribute_exists(entityType)",
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
    ConditionExpression: "attribute_exists(droneId) AND attribute_exists(entityType)"
  });

  await documentClient.send(command);
};

