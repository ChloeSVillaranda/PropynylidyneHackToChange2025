import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION ?? "us-east-1";

const dynamoClient = new DynamoDBClient({
  region,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
      }
    : undefined
});

export const documentClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true
  }
});

export const DRONES_TABLE = process.env.DRONES_TABLE ?? "DroneFleet";
export const DRONE_IMAGES_TABLE = process.env.DRONE_IMAGES_TABLE ?? "DroneImages";

