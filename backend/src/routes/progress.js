import express from "express";
import Progress from "../models/progress.js";
import { authenticateToken } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Get all progress reports for a project
router.get("/:projectId", authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  // Validate projectId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  try {
    console.log(`GET /api/progress/${projectId} by user=${req.user?.email || "anonymous"}`);
    const progress = await Progress.find({ project: projectId })
      .populate("employee", "name email")
      .sort({ date: -1 });
    res.json({ progress });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Add a progress report to a project
router.post("/:projectId", authenticateToken, async (req, res) => {
  // console.log(req)
  const { projectId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid projectId" });
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Report 'text' is required and must be a non-empty string" });
  }

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Unauthorized: User ID missing in token" });
  }

  try {
    console.log(`POST /api/progress/${projectId} by user=${req.user.email}`);

    const report = new Progress({
      project: projectId,
      employee: req.user.userId, // Ensure this is set by your authenticateToken middleware
      text: text.trim(),
      date: new Date(),
    });

    await report.save();
    res.json({ success: true, progress: report });
  } catch (err) {
    console.error("Error saving progress report:", err);
    res.status(500).json({ error: "Failed to save progress report" });
  }
});

export default router;
