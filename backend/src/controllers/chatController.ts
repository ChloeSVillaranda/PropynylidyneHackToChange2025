import { Request, Response } from "express";

import {
  createMessage,
  listMessages
} from "../services/chatService.js";

const parseLimit = (value: unknown): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return Math.min(Math.max(parsed, 1), 200);
};

export const postMessage = async (req: Request, res: Response) => {
  try {
    const { author, text, roomId } = req.body ?? {};
    const message = await createMessage({ author, text, roomId });
    res.status(201).json({ data: message });
  } catch (error) {
    console.error("[chat] Failed to create message:", error);
    res.status(400).json({ message: (error as Error).message ?? "Failed to create message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const roomId = typeof req.query.roomId === "string" && req.query.roomId.trim().length > 0
      ? req.query.roomId.trim()
      : "global";
    const limit = parseLimit(req.query.limit);
    const since = typeof req.query.since === "string" ? req.query.since : undefined;

    const messages = await listMessages(roomId, { limit, since });
    res.json({ data: messages });
  } catch (error) {
    console.error("[chat] Failed to fetch messages:", error);
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
};


