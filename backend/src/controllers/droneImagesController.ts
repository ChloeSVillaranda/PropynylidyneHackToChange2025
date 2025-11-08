import { Request, Response } from "express";

import { addDroneImage, deleteDroneImage, listDroneImages } from "../services/droneImagesService.js";

export const listImages = async (req: Request, res: Response) => {
  const { id: droneId } = req.params;
  const { startAfter, limit } = req.query;

  const images = await listDroneImages(droneId, {
    startAfter: startAfter as string | undefined,
    limit: limit ? Number(limit) : undefined
  });

  res.json(images);
};

export const addImage = async (req: Request, res: Response) => {
  const { id: droneId } = req.params;
  const imagePayload = {
    ...req.body,
    droneId
  };

  await addDroneImage(imagePayload);

  res.status(201).json(imagePayload);
};

export const removeImage = async (req: Request, res: Response) => {
  const { id: droneId, timestamp } = req.params;

  await deleteDroneImage(droneId, timestamp);

  res.status(204).send();
};

