export interface CameraSnapshot {
  cameraId: number;
  viewId: number;
  location?: string;
  roadway?: string;
  direction?: string;
  latitude?: number;
  longitude?: number;
  capturedAt: string;
  imageUrl?: string;
  source?: string;
  s3Key?: string;
}


