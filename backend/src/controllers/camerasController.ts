import { Request, Response } from "express";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { CAMERA_S3_BUCKET, s3Client } from "../config/s3Client.js";
import { listCameraImageRecords } from "../services/cameraImagesService.js";
import { fetchCalgaryCameras, syncCalgaryCameraImages } from "../services/cameraSyncService.js";

export const getCalgaryCameras = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cameras = await fetchCalgaryCameras();

    res.json({
      count: cameras.length,
      data: cameras
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Calgary cameras";
    res.status(500).json({ message });
  }
};

export const syncCalgaryCameraImagesHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const results = await syncCalgaryCameraImages();

    const successCount = results.filter((result) => result.success).length;
    const failureCount = results.length - successCount;

    res.json({
      processed: results.length,
      successes: successCount,
      failures: failureCount,
      results
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync Calgary camera images";
    res.status(500).json({ message });
  }
};

export const getCalgaryCameraSnapshots = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [records, metadata] = await Promise.all([
      listCameraImageRecords(),
      fetchCalgaryCameras().catch(() => [])
    ]);

    const metadataById = new Map(metadata.map((camera) => [camera.id, camera]));

    const payload = await Promise.all(
      records.map(async (record) => {
        const camera = metadataById.get(record.cameraId);
        const latitude = record.latitude ?? camera?.latitude;
        const longitude = record.longitude ?? camera?.longitude;

        let signedUrl: string | undefined;
        if (CAMERA_S3_BUCKET && record.s3Key) {
          try {
            signedUrl = await getSignedUrl(
              s3Client,
              new GetObjectCommand({
                Bucket: CAMERA_S3_BUCKET,
                Key: record.s3Key
              }),
              { expiresIn: 60 * 15 }
            );
          } catch (error) {
            console.warn(`[getCalgaryCameraSnapshots] Failed to sign URL for ${record.s3Key}:`, error);
          }
        }

        const fallbackUrl =
          CAMERA_S3_BUCKET && record.s3Key
            ? `https://${CAMERA_S3_BUCKET}.s3.amazonaws.com/${record.s3Key}`
            : record.imageUrl;

        return {
          cameraId: record.cameraId,
          viewId: record.viewId,
          location: record.location ?? camera?.location,
          roadway: record.roadway ?? camera?.roadway,
          direction: record.direction ?? camera?.direction,
          latitude,
          longitude,
          capturedAt: record.capturedAt,
          imageUrl: signedUrl ?? fallbackUrl,
          source: record.source,
          s3Key: record.s3Key
        };
      })
    );

    // Filter out records without coordinates to keep the map clean
    const filtered = payload.filter((entry) => typeof entry.latitude === "number" && typeof entry.longitude === "number");

    res.json({
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Calgary camera snapshots";
    res.status(500).json({ message });
  }
};


