import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import conectBD from './config/db.js';
import { port } from './config/config.js';
import userRouter from './routes/UserRoute.js';
import companyRoutes from "./routes/companyRoutes.js";
import candidateProfileRoutes from "./routes/candidateProfileRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import goToWorkRoutes from "./routes/goToWorkRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import trainingProgramRoutes from "./routes/trainingProgramRoutes.js";
import hospitalityProgramRoutes from "./routes/hospitalityProgramRoutes.js";
import roleConfigRoutes from "./routes/roleConfigRoutes.js";
import cookieParser from 'cookie-parser';
import cors from "cors"
import mongoose from "mongoose";
const app = express();
const PORT = port
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = String(process.env.NODE_ENV || "").toLowerCase() === "production";

app.use(express.json());
app.use(cookieParser());

const staticAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://64.226.100.229",
  "https://smart-full-system.onrender.com",
];

const envAllowedOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...(isProduction ? [] : staticAllowedOrigins),
  ...envAllowedOrigins,
]);
const localhostPortPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      if (!isProduction && localhostPortPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked for this origin"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, message: "System is running" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true, message: "Backend connected" });
});

app.get("/api/health/full", (_req, res) => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbState = mongoose.connection.readyState;
  res.status(200).json({
    ok: true,
    backend: "connected",
    database: stateMap[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/users', userRouter);
app.use("/api/companies", companyRoutes);
app.use("/api/candidate-profiles", candidateProfileRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/go-to-work", goToWorkRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/training-programs", trainingProgramRoutes);
app.use("/api/hospitality-programs", hospitalityProgramRoutes);
app.use("/api/roles", roleConfigRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// forget password


conectBD();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

})
