import { PutCommand } from "@aws-sdk/lib-dynamodb";

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
      imageUrl: record.imageUrl
    }
  });

  await documentClient.send(command);
};


