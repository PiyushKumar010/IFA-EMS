import express from "express";
import HackathonApplication from "../models/hackathonApplication.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Get hackathon application for current user
router.get("/application", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const application = await HackathonApplication.findOne({ 
      applicant: userId 
    }).populate("applicant", "name email");

    res.json({ 
      application: application || null 
    });
  } catch (err) {
    console.error("Error fetching hackathon application:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit hackathon application
router.post("/apply", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phone,
      university,
      degree,
      graduationYear,
      experience,
      skills,
      projectIdea,
      teamStatus,
      teamMembers,
      previousHackathons,
      motivation,
      githubProfile,
      portfolioUrl
    } = req.body;

    // Check if user already has an application
    const existingApplication = await HackathonApplication.findOne({ 
      applicant: userId 
    });

    if (existingApplication) {
      return res.status(400).json({ 
        error: "You have already submitted an application" 
      });
    }

    // Create new application
    const application = new HackathonApplication({
      applicant: userId,
      fullName,
      phone,
      university,
      degree,
      graduationYear,
      experience,
      skills,
      projectIdea,
      teamStatus,
      teamMembers,
      previousHackathons,
      motivation,
      githubProfile,
      portfolioUrl,
      status: "submitted",
      submittedAt: new Date()
    });

    await application.save();

    res.json({ 
      success: true, 
      message: "Application submitted successfully",
      application 
    });
  } catch (err) {
    console.error("Error submitting hackathon application:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save application draft
router.post("/save-draft", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const applicationData = req.body;

    // Find existing draft or create new one
    let application = await HackathonApplication.findOne({ 
      applicant: userId 
    });

    if (application) {
      // Update existing draft
      Object.assign(application, applicationData);
      application.updatedAt = new Date();
    } else {
      // Create new draft
      application = new HackathonApplication({
        ...applicationData,
        applicant: userId,
        status: "draft"
      });
    }

    await application.save();

    res.json({ 
      success: true, 
      message: "Draft saved successfully",
      application 
    });
  } catch (err) {
    console.error("Error saving hackathon application draft:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all applications (admin only)
router.get("/admin/applications", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || !user.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const applications = await HackathonApplication.find({})
      .populate("applicant", "name email")
      .sort({ submittedAt: -1 });

    res.json({ applications });
  } catch (err) {
    console.error("Error fetching hackathon applications:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update application status (admin only)
router.put("/admin/application/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    // Check if user is admin
    const user = await User.findById(req.user.userId);
    if (!user || !user.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const application = await HackathonApplication.findById(id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user.userId;

    await application.save();

    res.json({ 
      success: true, 
      message: "Application status updated",
      application 
    });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;