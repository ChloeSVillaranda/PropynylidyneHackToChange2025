import {
  DeleteCommand,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

import { DRONE_IMAGES_TABLE, documentClient } from "../config/dynamoClient.js";
import { DroneImage } from "../models/droneImage.js";

export const addDroneImage = async (image: DroneImage): Promise<void> => {
  const command = new PutCommand({
    TableName: DRONE_IMAGES_TABLE,
    Item: {
      droneId: image.droneId,
      timestamp: image.timestamp,
      ...image
    }
  });

  await documentClient.send(command);
};

export const listDroneImages = async (
  droneId: string,
  {
    startAfter,
    limit = 20
  }: { startAfter?: string; limit?: number } = {}
): Promise<DroneImage[]> => {
  const command = new QueryCommand({
    TableName: DRONE_IMAGES_TABLE,
    KeyConditionExpression: "droneId = :droneId",
    ExpressionAttributeValues: {
      ":droneId": droneId
    },
    ExclusiveStartKey: startAfter
      ? {
          droneId,
          timestamp: startAfter
        }
      : undefined,
    Limit: limit,
    ScanIndexForward: false
  });

  const result = await documentClient.send(command);

  return (result.Items as DroneImage[]) ?? [];
};

export const deleteDroneImage = async (droneId: string, timestamp: string): Promise<void> => {
  const command = new DeleteCommand({
    TableName: DRONE_IMAGES_TABLE,
    Key: {
      droneId,
      timestamp
    }
  });

  await documentClient.send(command);
};

