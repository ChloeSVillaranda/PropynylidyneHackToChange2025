export type AccessLevel = "user" | "admin";

export type DroneImage = {
  imageId: string;
  droneId: string;
  timestamp: string;
  s3Uri: string;
  accessLevel: AccessLevel;
  metadata?: Record<string, string | number | boolean>;
};

