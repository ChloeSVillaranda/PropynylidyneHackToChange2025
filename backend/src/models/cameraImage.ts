export type CameraView = {
  id: number;
  url: string;
  description?: string;
  status?: string;
};

export type CameraMetadata = {
  id: number;
  source: string;
  sourceId: string;
  roadway?: string;
  direction?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  sortOrder?: number;
  views: CameraView[];
};

export type StoredCameraImage = {
  cameraId: number;
  viewId: number;
  location?: string;
  source: string;
  sourceId?: string;
  roadway?: string;
  direction?: string;
  latitude?: number;
  longitude?: number;
  s3Key: string;
  capturedAt: string;
  imageUrl?: string;
};


