import { Router } from "express";

import {
  getCalgaryCameraSnapshots,
  getCalgaryCameras,
  syncCalgaryCameraImagesHandler
} from "../controllers/camerasController.js";

const router = Router();

router.get("/calgary", getCalgaryCameras);
router.get("/calgary/images", getCalgaryCameraSnapshots);
router.post("/calgary/sync", syncCalgaryCameraImagesHandler);

export default router;


