import dotenv from "dotenv";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import { DRONES_TABLE, MISSIONS_TABLE, documentClient } from "../config/dynamoClient.js";
import { DRONES_TABLE, USERS_TABLE, documentClient } from "../config/dynamoClient.js";
import { Drone } from "../models/drone.js";
import { Mission } from "../models/mission.js";
import { createUser } from "../services/usersService.js";
import { User } from "../models/user.js";
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

const demoMissions: Mission[] = [
  {
    missionId: 1,
    droneId: "drone-001",
    missionType: "Patrol",
    startTime: new Date(Date.now() + 3600_000).toISOString(),
    endTime: new Date(Date.now() + 3 * 3600_000).toISOString(),
    route: [
      { latitude: 34.05, longitude: -118.24 },
      { latitude: 34.07, longitude: -118.26 }
    ]
  }
];

const demoUsers: User[] = [
  {
    email: "admin@example.com",
    fullName: "Command Center Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
    accessLevel: ["missions:write", "drones:manage"],
    metadata: {
      phone: "+1-555-0100"
    }
  },
  {
    email: "pilot@example.com",
    fullName: "Drone Pilot",
    role: "user",
    createdAt: new Date().toISOString(),
    accessLevel: ["missions:read"],
    metadata: {
      certification: "FAA Part 107"
    }
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

  logger.info(`Seeding ${demoMissions.length} missions into table ${MISSIONS_TABLE}`);

  for (const mission of demoMissions) {
    const command = new PutCommand({
      TableName: MISSIONS_TABLE,
      Item: mission
    });

    await documentClient.send(command);
    logger.info(`Upserted mission ${mission.missionId}`);
  }

  logger.info("Mission seeding complete.");

  logger.info(`Seeding ${demoUsers.length} users into table ${USERS_TABLE}`);

  for (const user of demoUsers) {
    try {
      await createUser({
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        accessLevel: user.accessLevel,
        metadata: user.metadata
      });
      logger.info(`Upserted user ${user.email}`);
    } catch (error) {
      if ((error as Error).name === "ConditionalCheckFailedException") {
        logger.debug("User already exists", { email: user.email });
      } else {
        logger.error("Failed to seed user", { email: user.email, error });
      }
    }
  }

  logger.info("User seeding complete.");
};

seed().catch((error) => {
  logger.error("Failed to seed drones", error);
  process.exitCode = 1;
});

