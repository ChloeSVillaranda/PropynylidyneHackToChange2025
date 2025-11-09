import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "changeme-in-dev";

type TokenPayload = {
  email: string;
  role?: string;
  iat: number;
  exp: number;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      email: string;
      role?: string;
    };
  }
}

const extractBearerToken = (headerValue?: string): string | null => {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

const verifyToken = (authorizationHeader?: string): TokenPayload | null => {
  const token = extractBearerToken(authorizationHeader);
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    console.warn("[auth] Failed to verify token:", (error as Error).message);
    return null;
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const payload = verifyToken(req.headers.authorization);

  if (!payload) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  req.user = {
    email: payload.email,
    role: payload.role
  };

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const payload = verifyToken(req.headers.authorization);

  if (!payload) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (payload.role !== "admin") {
    res.status(403).json({ message: "Admin role required" });
    return;
  }

  req.user = {
    email: payload.email,
    role: payload.role
  };

  next();
};


