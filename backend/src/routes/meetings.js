import express from "express";
import Meeting from "../models/meeting.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Admin: Create a new meeting
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      subject,
      meetingLink,
      description,
      meetingType,
      scheduledDate,
      scheduledTime,
      duration,
      meetingFor,
      invitedEmployees,
      invitedClients
    } = req.body;

    const meeting = new Meeting({
      subject,
      meetingLink,
      description: description || "",
      meetingType: meetingType || "other",
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: duration || 60,
      createdBy: req.user.userId,
      meetingFor: meetingFor || "employees",
      invitedEmployees: invitedEmployees || [],
      invitedClients: invitedClients || [],
      status: "scheduled"
    });

    await meeting.save();
    
    const populated = await Meeting.findById(meeting._id)
      .populate("createdBy", "name email")
      .populate("invitedEmployees", "name email")
      .populate("invitedClients", "name email");

    res.status(201).json({ success: true, meeting: populated });
  } catch (err) {
    console.error("Error creating meeting:", err);
    res.status(400).json({ error: "Failed to create meeting" });
  }
});

// Get all meetings (admin sees all, employees/clients see only their invited ones)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let meetings;
    
    if (Array.isArray(req.user.roles) && req.user.roles.includes("admin")) {
      // Admin sees all meetings
      meetings = await Meeting.find()
        .populate("createdBy", "name email")
        .populate("invitedEmployees", "name email")
        .populate("invitedClients", "name email")
        .sort({ scheduledDate: -1, scheduledTime: -1 });
    } else if (Array.isArray(req.user.roles) && req.user.roles.includes("employee")) {
      // Employees see meetings they're invited to
      meetings = await Meeting.find({
        $or: [
          { meetingFor: "employees" },
          { meetingFor: "both" },
          { invitedEmployees: req.user.userId }
        ]
      })
        .populate("createdBy", "name email")
        .populate("invitedEmployees", "name email")
        .populate("invitedClients", "name email")
        .sort({ scheduledDate: -1, scheduledTime: -1 });
    } else if (Array.isArray(req.user.roles) && req.user.roles.includes("client")) {
      // Clients see meetings they're invited to
      meetings = await Meeting.find({
        $or: [
          { meetingFor: "clients" },
          { meetingFor: "both" },
          { invitedClients: req.user.userId }
        ]
      })
        .populate("createdBy", "name email")
        .populate("invitedEmployees", "name email")
        .populate("invitedClients", "name email")
        .sort({ scheduledDate: -1, scheduledTime: -1 });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ meetings });
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

// Get a specific meeting
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("invitedEmployees", "name email")
      .populate("invitedClients", "name email");

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Check if user has access
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
    const isEmployee = Array.isArray(req.user.roles) && req.user.roles.includes("employee");
    const isClient = Array.isArray(req.user.roles) && req.user.roles.includes("client");

    if (!isAdmin) {
      if (isEmployee && meeting.meetingFor !== "employees" && meeting.meetingFor !== "both") {
        if (!meeting.invitedEmployees.some(emp => emp._id.toString() === req.user.userId)) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      if (isClient && meeting.meetingFor !== "clients" && meeting.meetingFor !== "both") {
        if (!meeting.invitedClients.some(client => client._id.toString() === req.user.userId)) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
    }

    res.json({ meeting });
  } catch (err) {
    console.error("Error fetching meeting:", err);
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
});

// Admin: Update meeting
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const {
      subject,
      meetingLink,
      description,
      meetingType,
      scheduledDate,
      scheduledTime,
      duration,
      meetingFor,
      invitedEmployees,
      invitedClients,
      status
    } = req.body;

    if (subject) meeting.subject = subject;
    if (meetingLink) meeting.meetingLink = meetingLink;
    if (description !== undefined) meeting.description = description;
    if (meetingType) meeting.meetingType = meetingType;
    if (scheduledDate) meeting.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) meeting.scheduledTime = scheduledTime;
    if (duration) meeting.duration = duration;
    if (meetingFor) meeting.meetingFor = meetingFor;
    if (invitedEmployees) meeting.invitedEmployees = invitedEmployees;
    if (invitedClients) meeting.invitedClients = invitedClients;
    if (status) meeting.status = status;

    await meeting.save();

    const populated = await Meeting.findById(meeting._id)
      .populate("createdBy", "name email")
      .populate("invitedEmployees", "name email")
      .populate("invitedClients", "name email");

    res.json({ success: true, meeting: populated });
  } catch (err) {
    console.error("Error updating meeting:", err);
    res.status(400).json({ error: "Failed to update meeting" });
  }
});

// Admin: Delete meeting
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting meeting:", err);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
});

export default router;

