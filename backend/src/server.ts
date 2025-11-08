import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./docs/swagger.js";
import dronesRouter from "./routes/dronesRoutes.js";
import missionsRouter from "./routes/missionsRoutes.js";
import usersRouter from "./routes/usersRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

app.use("/drones", dronesRouter);
app.use("/missions", missionsRouter);
app.use("/users", usersRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

