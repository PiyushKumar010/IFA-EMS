import express from "express";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
const router = express.Router();

// Get all employees for admin assignment
router.get("/employees", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Not authorized" });
  try {
    // Get only approved employees
    const employees = await User.find({ 
      roles: "employee",
      status: "approved"
    }, "_id name email status");
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Get all clients for admin assignment
router.get("/clients", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Not authorized" });
  try {
    const clients = await User.find({ 
      roles: "client"
    }, "_id name email");
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      status: user.status,
      profileCompleted: user.profileCompleted || false,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      streetAddress: user.streetAddress,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      designation: user.designation,
      department: user.department,
      joiningDate: user.joiningDate,
      skills: user.skills || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update employee profile (for profile completion)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const {
      phoneNumber,
      dateOfBirth,
      streetAddress,
      city,
      state,
      pincode,
      designation,
      department,
      joiningDate,
      skills,
    } = req.body;

    // Validate required fields
    if (!phoneNumber || !dateOfBirth || !streetAddress || !city || !state || !pincode || !designation || !department || !joiningDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update profile fields
    user.phoneNumber = phoneNumber;
    user.dateOfBirth = new Date(dateOfBirth);
    user.streetAddress = streetAddress;
    user.city = city;
    user.state = state;
    user.pincode = pincode;
    user.designation = designation;
    user.department = department;
    user.joiningDate = new Date(joiningDate);
    user.skills = Array.isArray(skills) ? skills : (skills ? [skills] : []);
    user.profileCompleted = true;

    await user.save();

    res.json({ success: true, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
    } });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Debug route: list all users and approval status
router.get("/debug", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Not authorized" });
  try {
    const users = await User.find({}, "_id name email roles");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
