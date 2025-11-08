import { BaseEntity, DroneMetadata, GeoPoint } from "./drone.js";

export type MissionType = "Patrol" | "Emergency" | "Recon" | "Delivery" | string;

export type Mission = BaseEntity & {
  entityType: "MISSION";
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: GeoPoint[];
  assignedDroneId?: string;
  metadata?: DroneMetadata;
  missionId?: string;
};

