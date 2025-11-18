import express from "express";
import Project from "../models/project.js";
import { authenticateToken } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  try {
    const projectData = req.body;
    if (Array.isArray(req.user.roles) && req.user.roles.includes("client")) {
      projectData.clientEmail = req.user.email;
      projectData.clientName = projectData.clientName || "Client";
    }
    const project = new Project(projectData);
    await project.save();
    // populate user refs before returning
    const populated = await Project.findById(project._id)
      .populate("assignees", "name email")
      .populate("leadAssignee", "name email");
    res.status(201).json({ success: true, project: populated });
  } catch (err) {
    res.status(400).json({ error: "Failed to create project" });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { roles, userId, email } = req.user;
    let filter = {};

    // Approval system removed

    if (Array.isArray(roles) && roles.includes("admin")) {
      // Admins see all projects
      filter = {};
    } else if (Array.isArray(roles) && roles.includes("client")) {
      filter = { clientEmail: email };
    } else if (Array.isArray(roles) && roles.includes("employee")) {
      // Only show projects where this employee is assigned
      let uid = userId;
      // Convert to string for comparison
      if (typeof uid !== "string") uid = String(uid);
      filter = {
        $or: [
          { assignees: uid },
          { leadAssignee: uid }
        ]
      };
    }

    const projects = await Project.find(filter)
      .populate("assignees", "name email")
      .populate("leadAssignee", "name email");

    res.json({ projects });

  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Update a project (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
    const proj = await Project.findById(req.params.id);
    if (!proj) return res.status(404).json({ error: "Project not found" });

    // Update allowed fields from request body
    const allowed = [
      "status",
      "clientType",
      "priority",
      "projectType",
      "estimatedHoursRequired",
      "estimatedHoursTaken",
      "startDate",
      "endDate",
      "assignees",
      "leadAssignee",
      "vaIncharge",
      "freelancer",
      "updateIncharge",
      "codersRecommendation",
      "leadership",
      "githubLinks",
      "loomLink",
      "whatsappGroupLink"
    ];

    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === "assignees") {
          let newAssignees = req.body.assignees;
          // Accept single string, array, or empty
          if (!newAssignees) {
            proj.assignees = [];
          } else if (Array.isArray(newAssignees)) {
            proj.assignees = newAssignees.filter(Boolean).map(id => {
              try {
                return new mongoose.Types.ObjectId(id);
              } catch {
                return null;
              }
            }).filter(Boolean);
          } else {
            // Single string
            try {
              proj.assignees = [new mongoose.Types.ObjectId(newAssignees)];
            } catch {
              proj.assignees = [];
            }
          }
        } else {
          proj[key] = req.body[key];
        }
      }
    });

    await proj.save();
    const populated = await Project.findById(proj._id)
      .populate("assignees", "name email")
      .populate("leadAssignee", "name email");
    res.json({ success: true, project: populated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update project" });
  }
});

export default router;
