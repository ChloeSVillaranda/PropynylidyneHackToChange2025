import { Request, Response } from "express";

import jwt from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-in-dev";
const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "12h";

type JwtPayload = {
  email: string;
  role: string;
};

const buildToken = (payload: JwtPayload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN
  });

const normalizeEmail = (value?: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }
  return trimmed;
};

export const login = (req: Request, res: Response) => {
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : null;

  if (!email || !password) {
    res.status(400).json({ message: "email and password are required" });
    return;
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    res.status(500).json({ message: "Authentication is not configured on the server" });
    return;
  }

  const matchesAdmin = email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;

  if (!matchesAdmin) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = buildToken({ email, role: "admin" });

  res.json({
    token,
    role: "admin",
    expiresIn: TOKEN_EXPIRES_IN,
    user: {
      email,
      role: "admin"
    }
  });
};



