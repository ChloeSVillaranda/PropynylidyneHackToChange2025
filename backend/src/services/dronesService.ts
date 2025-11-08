import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { DRONES_TABLE, documentClient } from "../config/dynamoClient.js";
import { Drone, DroneStatus } from "../models/drone.js";

const DRONE_ENTITY_TYPE = "profile";

export const listDrones = async (): Promise<Drone[]> => {
  const command = new ScanCommand({
    TableName: DRONES_TABLE,
    ConsistentRead: false
  });

  const result = await documentClient.send(command);

  return (result.Items as Drone[]) ?? [];
};

export const getDroneById = async (droneId: string): Promise<Drone | null> => {
  const command = new QueryCommand({
    TableName: DRONES_TABLE,
    KeyConditionExpression: "droneId = :droneId",
    ExpressionAttributeValues: {
      ":droneId": droneId
    },
    Limit: 1
  });

  const result = await documentClient.send(command);

  const items = result.Items as Drone[] | undefined;

  if (!items || items.length === 0) {
    return null;
  }

  return items[0];
};

export const createDrone = async (drone: Drone): Promise<Drone> => {
  const command = new PutCommand({
    TableName: DRONES_TABLE,
    Item: {
      entityType: DRONE_ENTITY_TYPE,
      ...drone
    },
    ConditionExpression: "attribute_not_exists(droneId)"
  });

  await documentClient.send(command);

  return drone;
};

export const updateDrone = async (
  droneId: string,
  updates: Partial<Omit<Drone, "droneId">>
): Promise<Drone | null> => {
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
    Key: {
      droneId,
      entityType: DRONE_ENTITY_TYPE
    },
    ConditionExpression: "attribute_exists(droneId)",
    UpdateExpression: `SET ${setExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });

  const result = await documentClient.send(command);

  return (result.Attributes as Drone) ?? null;
};

export const updateDroneStatus = async (droneId: string, status: DroneStatus): Promise<void> => {
  const command = new UpdateCommand({
    TableName: DRONES_TABLE,
    Key: {
      droneId,
      entityType: DRONE_ENTITY_TYPE
    },
    ConditionExpression: "attribute_exists(droneId)",
    UpdateExpression: "SET #status = :status",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": status
    }
  });

  await documentClient.send(command);
};

export const deleteDrone = async (droneId: string): Promise<void> => {
  const command = new DeleteCommand({
    TableName: DRONES_TABLE,
    Key: {
      droneId,
      entityType: DRONE_ENTITY_TYPE
    },
    ConditionExpression: "attribute_exists(droneId)"
  });

  await documentClient.send(command);
};

