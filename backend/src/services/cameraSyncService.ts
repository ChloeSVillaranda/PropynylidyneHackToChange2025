import fetch from "node-fetch";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { CAMERA_S3_BUCKET, s3Client } from "../config/s3Client.js";
import { CameraMetadata, StoredCameraImage } from "../models/cameraImage.js";
import { saveCameraImageRecord } from "./cameraImagesService.js";

const CAMERA_API_URL =
  process.env.CALGARY_CAMERA_API_URL ??
  "https://511.alberta.ca/api/v2/get/cameras?format=json&lang=en";

type CameraViewApi = {
  Id: number;
  Url: string;
  Description?: string;
  Status?: string;
};

type CameraApi = {
  Id: number;
  Source: string;
  SourceId: string;
  Roadway?: string;
  Direction?: string;
  Latitude?: number;
  Longitude?: number;
  Location?: string;
  SortOrder?: number;
  Views?: CameraViewApi[];
};

type CameraApiResponse = CameraApi[];

const normalizeCamera = (camera: CameraApi): CameraMetadata => ({
  id: camera.Id,
  source: camera.Source,
  sourceId: camera.SourceId,
  roadway: camera.Roadway,
  direction: camera.Direction,
  latitude: camera.Latitude,
  longitude: camera.Longitude,
  location: camera.Location,
  sortOrder: camera.SortOrder,
  views: (camera.Views ?? []).map((view) => ({
    id: view.Id,
    url: view.Url,
    description: view.Description,
    status: view.Status
  }))
});

const isCalgaryCamera = (camera: CameraMetadata): boolean => {
  const hints = [
    camera.location,
    camera.source,
    camera.roadway,
    camera.views?.map((view) => view.description).join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (hints.includes("calgary")) {
    return true;
  }

  if (camera.latitude !== undefined && camera.longitude !== undefined) {
    const inLatitudeRange = camera.latitude >= 50.5 && camera.latitude <= 51.5;
    const inLongitudeRange = camera.longitude >= -114.5 && camera.longitude <= -113.5;

    if (inLatitudeRange && inLongitudeRange) {
      return true;
    }
  }

  return false;
};

const fetchCameraFeed = async (url: string): Promise<{ body: Buffer; contentType?: string }> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch camera image from ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const contentType = response.headers.get("content-type") ?? undefined;

  return { body: buffer, contentType };
};

const uploadCameraFeedToS3 = async (
  key: string,
  payload: Buffer,
  contentType?: string
): Promise<void> => {
  if (!CAMERA_S3_BUCKET) {
    throw new Error("CAMERA_S3_BUCKET environment variable is not set");
  }

  const command = new PutObjectCommand({
    Bucket: CAMERA_S3_BUCKET,
    Key: key,
    Body: payload,
    ContentType: contentType
  });

  await s3Client.send(command);
};

const buildS3Key = (camera: CameraMetadata, viewId: number, extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeLocation = (camera.location ?? "unknown-location").replace(/[^a-z0-9-_]/gi, "_");
  return `calgary/${camera.id}/${viewId}/${safeLocation}-${timestamp}.${extension}`;
};

const inferExtension = (contentType?: string): string => {
  if (!contentType) {
    return "jpg";
  }

  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg")) return "jpg";

  return "bin";
};

export const fetchCalgaryCameras = async (): Promise<CameraMetadata[]> => {
  const response = await fetch(CAMERA_API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch camera metadata: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as CameraApiResponse;
  const normalized = data.map(normalizeCamera);
  return normalized.filter(isCalgaryCamera);
};

export type CameraSyncResult = {
  cameraId: number;
  viewId: number;
  success: boolean;
  s3Key?: string;
  error?: string;
};

export const syncCalgaryCameraImages = async (): Promise<CameraSyncResult[]> => {
  const cameras = await fetchCalgaryCameras();
  const results: CameraSyncResult[] = [];

  for (const camera of cameras) {
    for (const view of camera.views ?? []) {
      try {
        const { body, contentType } = await fetchCameraFeed(view.url);
        const extension = inferExtension(contentType);
        const s3Key = buildS3Key(camera, view.id, extension);

        await uploadCameraFeedToS3(s3Key, body, contentType);

        const record: StoredCameraImage = {
          cameraId: camera.id,
          viewId: view.id,
          location: camera.location,
          source: camera.source,
          sourceId: camera.sourceId,
          roadway: camera.roadway,
          direction: camera.direction,
          latitude: camera.latitude,
          longitude: camera.longitude,
          s3Key,
          capturedAt: new Date().toISOString(),
          imageUrl: view.url
        };

        await saveCameraImageRecord(record);

        results.push({
          cameraId: camera.id,
          viewId: record.viewId,
          success: true,
          s3Key
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Failed to sync camera ${camera.id}:`, message);

        results.push({
          cameraId: camera.id,
          viewId: view.id,
          success: false,
          error: message
        });
      }
    }
  }

  return results;
};


