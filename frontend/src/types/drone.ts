export interface Drone {
  droneId: string;
  model: string;
  status: DroneStatus;
  description?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastMaintenance?: string;
  lastImageTimestamp?: string;
  metadata?: {
    firmware?: string;
    batteryLevel?: number;
  };
}

export type DroneStatus = 'Available' | 'Busy' | 'Maintenance';

export interface CreateDroneRequest {
  droneId: string;
  model: string;
  status?: DroneStatus;
  description?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  metadata?: {
    firmware?: string;
    batteryLevel?: number;
  };
}

export interface UpdateDroneRequest {
  model?: string;
  status?: DroneStatus;
  description?: string; // Added to update request
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastMaintenance?: string;
  lastImageTimestamp?: string;
  metadata?: {
    firmware?: string;
    batteryLevel?: number;
  };
}

export interface DroneResponse {
  success: boolean;
  data: Drone;
  message?: string;
}

export interface DronesListResponse {
  success: boolean;
  data: Drone[];
  message?: string;
}
