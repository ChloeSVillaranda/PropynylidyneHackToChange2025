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
  droneId: string;
};

export type Drone = BaseEntity & {
  model: string;
  status: DroneStatus;
  description?: string;
  currentLocation?: GeoPoint;
  patrolSchedule?: PatrolSchedule;
  lastImageTimestamp?: string;
  lastMaintenance?: string;
  metadata?: DroneMetadata;
};


