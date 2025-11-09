import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./docs/swagger.js";
import authRouter from "./routes/authRoutes.js";
import dronesRouter from "./routes/dronesRoutes.js";
import missionsRouter from "./routes/missionsRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import camerasRouter from "./routes/camerasRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// --- Add request logging middleware ---
app.use((req, res, next) => {
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/drones", dronesRouter);
app.use("/missions", missionsRouter);
app.use("/users", usersRouter);
app.use("/cameras", camerasRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

