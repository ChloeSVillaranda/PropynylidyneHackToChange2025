import { Router } from "express";

import {
  createMissionHandler,
  getMission,
  getMissions,
  removeMission,
  updateMissionHandler
} from "../controllers/missionsController.js";

const router = Router();

router.get("/", getMissions);
router.post("/", createMissionHandler);
router.get("/:id", getMission);
router.put("/:id", updateMissionHandler);
router.delete("/:id", removeMission);

export default router;

