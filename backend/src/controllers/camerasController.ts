import { Request, Response } from "express";

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


