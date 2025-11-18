import express from "express";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
const router = express.Router();

// Get all employees for admin assignment
router.get("/employees", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Not authorized" });
  try {
    const employees = await User.find({ roles: "employee" }, "_id name email");
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
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
      roles: user.roles
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
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
