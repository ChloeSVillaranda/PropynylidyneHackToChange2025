import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import dronesRouter from "./routes/dronesRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

app.use("/drones", dronesRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

