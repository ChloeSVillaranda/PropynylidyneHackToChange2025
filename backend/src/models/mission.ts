export type MissionType = "Patrol" | "Emergency" | "Data Collection";

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export type Mission = {
  missionId: number;
  droneId: string;
  missionType?: MissionType;
  startTime?: string;
  endTime?: string;
  route?: RoutePoint[];
};
