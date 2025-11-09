import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { DRONES_TABLE, documentClient } from "../config/dynamoClient.js";
import { Drone, DroneStatus } from "../models/drone.js";

export const listDrones = async (): Promise<Drone[]> => {
  console.log('[listDrones] Starting scan...');
  
  const command = new ScanCommand({
    TableName: DRONES_TABLE,
    ConsistentRead: false
  });

  const result = await documentClient.send(command);
  
  console.log('[listDrones] Raw DynamoDB response count:', result.Items?.length || 0);
  console.log('[listDrones] Raw items:', JSON.stringify(result.Items, null, 2));

  const allItems = (result.Items as any[]) ?? [];
  console.log('[listDrones] Total items:', allItems.length);

  // Show what each item looks like
  allItems.forEach((item, idx) => {
    console.log(`[listDrones] Item ${idx}:`, {
      droneId: item.droneId,
      model: item.model,
      missionId: item.missionId,
      hasModel: !!item.model,
      hasMissionId: !!item.missionId
    });
  });

  // Filter drones: has model field AND does NOT have missionId
  const filtered = allItems.filter(item => {
    const hasModel = !!item.model;
    const hasMissionId = !!item.missionId;
    const isMatch = hasModel && !hasMissionId;
    console.log(`[listDrones] Item ${item.droneId}: hasModel=${hasModel}, hasMissionId=${hasMissionId}, isMatch=${isMatch}`);
    return isMatch;
  });
  
  console.log('[listDrones] Filtered drones count:', filtered.length);
  console.log('[listDrones] Filtered drones:', JSON.stringify(filtered, null, 2));

  return filtered;
};

export const getDroneById = async (droneId: string): Promise<Drone | null> => {
  console.log('[getDroneById] Fetching drone:', droneId);
  
  const command = new GetCommand({
    TableName: DRONES_TABLE,
    Key: {
      droneId  // Only partition key, no sort key
    }
  });

  try {
    const result = await documentClient.send(command);
    console.log('[getDroneById] Result:', result.Item);
    return (result.Item as Drone) ?? null;
  } catch (error) {
    console.error('[getDroneById] Error:', error);
    throw error;
  }
};

export const createDrone = async (drone: Drone): Promise<Drone> => {
  const item = {
    ...drone,
    droneId: drone.droneId
  };

  const command = new PutCommand({
    TableName: DRONES_TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(droneId)"
  });

  await documentClient.send(command);
  return drone;
};

export const updateDrone = async (droneId: string, updates: Partial<Omit<Drone, "droneId" | "entityType">>): Promise<Drone | null> => {
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
      droneId
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
      droneId
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
      droneId
    },
    ConditionExpression: "attribute_exists(droneId)"
  });

  await documentClient.send(command);
};

