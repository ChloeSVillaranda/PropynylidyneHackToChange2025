import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { CAMERA_IMAGES_TABLE, documentClient } from "../config/dynamoClient.js";
import { StoredCameraImage } from "../models/cameraImage.js";

export const saveCameraImageRecord = async (record: StoredCameraImage): Promise<void> => {
  if (!CAMERA_IMAGES_TABLE) {
    throw new Error("CAMERA_IMAGES_TABLE environment variable is not set");
  }

  const command = new PutCommand({
    TableName: CAMERA_IMAGES_TABLE,
    Item: {
      cameraId: record.cameraId.toString(),
      viewId: record.viewId.toString(),
      capturedAt: record.capturedAt,
      s3Key: record.s3Key,
      location: record.location,
      source: record.source,
      sourceId: record.sourceId,
      roadway: record.roadway,
      direction: record.direction,
      latitude: record.latitude,
      longitude: record.longitude,
      imageUrl: record.imageUrl
    }
  });

  await documentClient.send(command);
};

export const listCameraImageRecords = async (): Promise<StoredCameraImage[]> => {
  const command = new ScanCommand({
    TableName: CAMERA_IMAGES_TABLE
  });

  const result = await documentClient.send(command);
  return ((result.Items as StoredCameraImage[]) ?? []).map((item) => ({
    ...item,
    cameraId: typeof item.cameraId === "string" ? Number(item.cameraId) : item.cameraId,
    viewId: typeof item.viewId === "string" ? Number(item.viewId) : item.viewId
  }));
};


