import { Router } from "express";

import {
  addImage,
  listImages,
  removeImage
} from "../controllers/droneImagesController.js";
import {
  createDroneHandler,
  getDrone,
  getDroneLocation,
  getDrones,
  removeDrone,
  setDroneStatus,
  updateDroneHandler
} from "../controllers/dronesController.js";

const router = Router();

router.get("/", getDrones);
router.post("/", createDroneHandler);
router.get("/:id", getDrone);
router.put("/:id", updateDroneHandler);
router.delete("/:id", removeDrone);
router.patch("/:id/status", setDroneStatus);
router.get("/:id/location", getDroneLocation);

router.get("/:id/images", listImages);
router.post("/:id/images", addImage);
router.delete("/:id/images/:timestamp", removeImage);

export default router;

