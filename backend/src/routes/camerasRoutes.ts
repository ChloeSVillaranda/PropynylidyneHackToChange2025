import { Router } from "express";

import { getCalgaryCameras, syncCalgaryCameraImagesHandler } from "../controllers/camerasController.js";

const router = Router();

router.get("/calgary", getCalgaryCameras);
router.post("/calgary/sync", syncCalgaryCameraImagesHandler);

export default router;


