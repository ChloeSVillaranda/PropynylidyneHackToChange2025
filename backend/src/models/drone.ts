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

export type Drone = {
  entityType?: string;
  droneId: string;
  status: DroneStatus;
  currentLocation?: GeoPoint;
  patrolSchedule?: PatrolSchedule;
  lastImageTimestamp?: string;
  model?: string;
  lastMaintenance?: string;
  metadata?: Record<string, string | number | boolean>;
};

