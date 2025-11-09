export interface Mission {
  missionId: number;
  droneId: string;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
  routeSuggestions?: RouteSuggestion[];
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export type MissionType = 'Patrol' | 'Emergency' | 'Data Collection';

export type MissionStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'in-progress';

export type RouteSuggestionStatus = 'pending' | 'in-progress' | 'completed';

export interface RouteSuggestion {
  suggestionId: string;
  summary: string;
  status: RouteSuggestionStatus;
  suggestedRoute?: RoutePoint[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RouteSuggestionInput {
  suggestionId?: string;
  summary: string;
  status?: RouteSuggestionStatus;
  suggestedRoute?: RoutePoint[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMissionRequest {
  droneId: string;
  missionId?: string;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
  metadata?: Record<string, unknown>;
  routeSuggestions?: RouteSuggestionInput[];
}

export interface UpdateMissionRequest {
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  missionType?: MissionType;
  routeSuggestions?: RouteSuggestionInput[];
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