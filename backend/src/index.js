import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js";
import progressRoutes from "./routes/progress.js";
import employeeInfo from "./routes/employeeinfo.js"
import requests from "./routes/admin.js"
import messagesRoutes from "./routes/messages.js"
import dailyFormRoutes from "./routes/dailyForms.js"
import meetingsRoutes from "./routes/meetings.js"
import { initSocketServer } from "./socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parseOrigins = (raw) =>
  (raw || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const DEFAULT_ORIGINS = ["https://ifa-frt.onrender.com"];
const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);
const fallbackOrigins = parseOrigins(process.env.FRONTEND_URL);
const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : fallbackOrigins.length
    ? fallbackOrigins
    : DEFAULT_ORIGINS;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Request logger to help debug whether requests reach the backend
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Host: ${req.headers.host}`,
  );
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/employees",employeeInfo);
app.use("/api/admin",requests);
app.use("/api/requests",requests);
app.use("/api/messages", messagesRoutes);
app.use("/api/daily-forms", dailyFormRoutes);
app.use("/api/meetings", meetingsRoutes);

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  const clientDistPath = path.join(__dirname, "..", "..", "frontend", "dist");
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  } else {
    console.warn(
      `frontend/dist not found at ${clientDistPath}. Did you run "npm run build" inside frontend?`,
    );
  }
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
