export type EntityType = "DRONE" | "MISSION";

export type DroneStatus = "Available" | "Busy" | "Maintenance";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type PatrolSchedule = {
  windowStart: string;
  windowEnd: string;
  cadence?: string;
};

export type DroneMetadata = Record<string, string | number | boolean | null | undefined>;

export type BaseEntity = {
  entityType: EntityType;
  droneId: string;
};

export type Drone = BaseEntity & {
  entityType: "DRONE";
  model: string;
  status: DroneStatus;
  currentLocation?: GeoPoint;
  patrolSchedule?: PatrolSchedule;
  lastImageTimestamp?: string;
  lastMaintenance?: string;
  metadata?: DroneMetadata;
};


