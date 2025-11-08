export interface Mission {
  droneId: string;
  entityType: 'MISSION';
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export type MissionType = 'Patrol' | 'Emergency' | 'Delivery' | 'Survey' | 'Inspection';

export type MissionStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'in-progress';

export interface CreateMissionRequest {
  droneId: string;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
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