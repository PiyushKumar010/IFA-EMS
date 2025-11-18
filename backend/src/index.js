import express from "express";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js";
import progressRoutes from "./routes/progress.js";
import employeeInfo from "./routes/employeeinfo.js"
import requests from "./routes/admin.js"
import messagesRoutes from "./routes/messages.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url));



const app = express();

app.use(express.json());
app.use(cookieParser());

// Request logger to help debug whether requests reach the backend
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Host: ${req.headers.host}`);
  next();
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/employees",employeeInfo);
app.use("/api/requests",requests);
app.use("/api/messages", messagesRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
