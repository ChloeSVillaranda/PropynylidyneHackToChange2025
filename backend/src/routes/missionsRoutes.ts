import { Router } from "express";

import {
  createMissionHandler,
  getMission,
  getMissions,
  removeMission,
  updateMissionHandler
} from "../controllers/missionsController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getMissions);
router.post("/", requireAdmin, createMissionHandler);
router.get("/:id", getMission);
router.put("/:id", requireAdmin, updateMissionHandler);
router.delete("/:id", requireAdmin, removeMission);

export default router;

