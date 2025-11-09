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
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getDrones);
router.post("/", requireAdmin, createDroneHandler);
router.get("/:id/detail", getDroneDetail);
router.get("/:id/location", getDroneLocation);
router.get("/:id", getDrone);
router.patch("/:id", requireAdmin, updateDroneHandler);
router.delete("/:id", requireAdmin, removeDrone);

export default router;

