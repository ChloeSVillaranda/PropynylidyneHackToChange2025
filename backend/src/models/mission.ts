import { BaseEntity, DroneMetadata, GeoPoint } from "./drone.js";

export type MissionType = "Patrol" | "Emergency" | "Recon" | "Delivery" | string;

export type Mission = BaseEntity & {
  entityType: "MISSION";
  missionId?: string;
  droneId: string; // This is the actual drone ID (not the key)
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: GeoPoint[];
  metadata?: DroneMetadata;
};

