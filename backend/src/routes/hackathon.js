import express from "express";
import Hackathon from "../models/hackathon.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import authenticateAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

// Get all active hackathons (public for all users)
router.get("/active", authenticateToken, async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ 
      isActive: true, 
      isPublished: true 
    })
    .populate("createdBy", "name email")
    .sort({ startDate: 1 });

    res.json({ hackathons });
  } catch (err) {
    console.error("Error fetching active hackathons:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get hackathon details by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const hackathon = await Hackathon.findById(id)
      .populate("createdBy", "name email")
      .populate("registeredUsers.user", "name email");

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({ hackathon });
  } catch (err) {
    console.error("Error fetching hackathon:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Register for hackathon
router.post("/:id/register", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, teamMembers } = req.body;
    const userId = req.user.userId;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    // Check if registration is still open
    if (new Date() > hackathon.registrationDeadline) {
      return res.status(400).json({ error: "Registration deadline has passed" });
    }

    // Check if user already registered
    const alreadyRegistered = hackathon.registeredUsers.some(
      reg => reg.user.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: "You are already registered for this hackathon" });
    }

    // Check if maximum participants reached
    if (hackathon.registeredUsers.length >= hackathon.maxParticipants) {
      return res.status(400).json({ error: "Maximum participants reached" });
    }

    // Add registration
    hackathon.registeredUsers.push({
      user: userId,
      teamName: teamName || "",
      teamMembers: teamMembers || []
    });

    await hackathon.save();

    res.json({ 
      success: true, 
      message: "Successfully registered for hackathon" 
    });
  } catch (err) {
    console.error("Error registering for hackathon:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN ROUTES

// Get all hackathons (admin only)
router.get("/admin/all", authenticateAdmin, async (req, res) => {
  try {
    const hackathons = await Hackathon.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ hackathons });
  } catch (err) {
    console.error("Error fetching hackathons:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new hackathon (admin only)
router.post("/admin/create", authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      theme,
      startDate,
      endDate,
      registrationDeadline,
      location,
      maxParticipants,
      prizes,
      requirements,
      contactInfo
    } = req.body;

    const hackathon = new Hackathon({
      title,
      description,
      theme,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationDeadline: new Date(registrationDeadline),
      location,
      maxParticipants: maxParticipants || 100,
      prizes: prizes || [],
      requirements: requirements || [],
      contactInfo: contactInfo || {},
      createdBy: req.user.userId,
      isActive: true,
      isPublished: true
    });

    await hackathon.save();

    res.json({ 
      success: true, 
      message: "Hackathon created successfully",
      hackathon 
    });
  } catch (err) {
    console.error("Error creating hackathon:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update hackathon (admin only)
router.put("/admin/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const hackathon = await Hackathon.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({ 
      success: true, 
      message: "Hackathon updated successfully",
      hackathon 
    });
  } catch (err) {
    console.error("Error updating hackathon:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete hackathon (admin only)
router.delete("/admin/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByIdAndDelete(id);

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({ 
      success: true, 
      message: "Hackathon deleted successfully" 
    });
  } catch (err) {
    console.error("Error deleting hackathon:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get hackathon registrations (admin only)
router.get("/admin/:id/registrations", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findById(id)
      .populate("registeredUsers.user", "name email picture");

    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found" });
    }

    res.json({ 
      registrations: hackathon.registeredUsers,
      totalRegistrations: hackathon.registeredUsers.length
    });
  } catch (err) {
    console.error("Error fetching hackathon registrations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;