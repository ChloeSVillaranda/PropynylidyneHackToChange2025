import { Router } from "express";

import {
  createUserHandler,
  getUser,
  getUsers,
  removeUser,
  updateUserHandler
} from "../controllers/usersController.js";

const router = Router();

router.get("/", getUsers);
router.post("/", createUserHandler);
router.get("/:email", getUser);
router.put("/:email", updateUserHandler);
router.delete("/:email", removeUser);

export default router;

