import { Router } from "express";

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

export default router;

