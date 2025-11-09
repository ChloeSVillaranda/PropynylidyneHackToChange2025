export interface Mission {
  missionId: number;
  droneId: string;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export type MissionType = 'Patrol' | 'Emergency' | 'Data Collection';

export type MissionStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'in-progress';

export interface CreateMissionRequest {
  droneId: string;
  missionId?: string;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
  metadata?: Record<string, unknown>;
}

export interface UpdateMissionRequest {
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
}

export interface MissionResponse {
  success: boolean;
  data: Mission;
  message?: string;
}

export interface MissionsListResponse {
  success: boolean;
  data: Mission[];
  message?: string;
}