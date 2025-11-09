export type MissionType = "Patrol" | "Emergency" | "Data Collection";

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export type RouteSuggestionStatus = "pending" | "in-progress" | "completed";

export type RouteSuggestion = {
  suggestionId: string;
  summary: string;
  status: RouteSuggestionStatus;
  suggestedRoute?: RoutePoint[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Mission = {
  missionId: number;
  droneId: string;
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
  routeSuggestions?: RouteSuggestion[];
};
