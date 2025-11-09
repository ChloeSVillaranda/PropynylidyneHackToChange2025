import { Router } from "express";

import {
  addImage,
  listImages,
  removeImage
} from "../controllers/droneImagesController.js";
import {
  createDroneHandler,
  getDrone,
  getDroneDetail,
  getDroneLocation,
  getDrones,
  removeDrone,
  setDroneStatus,
  updateDroneHandler
} from "../controllers/dronesController.js";

const router = Router();

router.get("/", getDrones);
router.post("/", createDroneHandler);
router.get("/:id/detail", getDroneDetail);
router.get("/:id/location", getDroneLocation);
router.get("/:id/images", listImages);
router.post("/:id/images", addImage);
router.delete("/:id/images/:timestamp", removeImage);
router.get("/:id", getDrone);
router.patch("/:id", updateDroneHandler);
router.delete("/:id", removeDrone);

export default router;

