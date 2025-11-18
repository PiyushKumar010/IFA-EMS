import express from "express";
import User from "../models/user.js";

const router = express.Router();

// authenticate token waala function idhr bhi daalna hai 


// GET all employees
router.get("/info", async (req, res) => {
  try {
    const employees = await User.find({ roles: "employee" }).select(
      "name email lastLogin roles"
    );

    res.json({ employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

export default router;
