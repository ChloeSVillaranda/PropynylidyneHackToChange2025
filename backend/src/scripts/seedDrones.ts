import dotenv from "dotenv";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { DRONES_TABLE, documentClient } from "../config/dynamoClient.js";
import { Drone } from "../models/drone.js";
import { logger } from "../utils/logger.js";

dotenv.config();

const demoDrones: Drone[] = [
  {
    entityType: "DRONE",
    droneId: "drone-001",
    status: "Available",
    currentLocation: { latitude: 34.0522, longitude: -118.2437 },
    patrolSchedule: {
      windowStart: new Date(Date.now() - 3600_000).toISOString(),
      windowEnd: new Date(Date.now() + 3600_000).toISOString()
    },
    lastImageTimestamp: new Date().toISOString(),
    lastMaintenance: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(),
    model: "DJI-M300",
    metadata: { batteryLevel: 87, firmware: "v1.2.0" }
  },
  {
    entityType: "DRONE",
    droneId: "drone-002",
    status: "Maintenance",
    currentLocation: { latitude: 36.1699, longitude: -115.1398 },
    patrolSchedule: undefined,
    lastImageTimestamp: undefined,
    lastMaintenance: new Date(Date.now() - 45 * 24 * 3600_000).toISOString(),
    model: "Skydio-X2",
    metadata: { batteryLevel: 45, firmware: "v1.1.5" }
  }
];

const seed = async () => {
  logger.info(`Seeding ${demoDrones.length} drones into table ${DRONES_TABLE}`);

  for (const drone of demoDrones) {
    const command = new PutCommand({
      TableName: DRONES_TABLE,
      Item: drone
    });

    await documentClient.send(command);
    logger.info(`Upserted drone ${drone.droneId}`);
  }

  logger.info("Seeding complete.");
};

seed().catch((error) => {
  logger.error("Failed to seed drones", error);
  process.exitCode = 1;
});

