import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./docs/swagger.js";
import dronesRouter from "./routes/dronesRoutes.js";
import missionsRouter from "./routes/missionsRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import camerasRouter from "./routes/camerasRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import authRouter from "./routes/auth.js";  // Keep .js for the compiled output

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000"
];

const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
if (vercelUrl) {
  allowedOrigins.push(vercelUrl);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// --- Add request logging middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Incoming request: ${req.method} ${req.originalUrl}`);
  if (req.query && Object.keys(req.query).length) {
    console.log(`[${ts}] Query:`, req.query);
  }
  if (req.body && Object.keys(req.body).length) {
    // avoid logging huge bodies, stringify for readability
    try {
      console.log(`[${ts}] Body:`, JSON.stringify(req.body));
    } catch {
      console.log(`[${ts}] Body: (unserializable)`);
    }
  }

  res.on("finish", () => {
    const ts2 = new Date().toISOString();
    console.log(`[${ts2}] Response: ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});
// --- end request logging middleware ---

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

// Add auth routes with proper prefix
app.use("/api/auth", authRouter);

app.use("/api/drones", dronesRouter);
app.use("/api/missions", missionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cameras", camerasRouter);
app.use("/api/chat", chatRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

