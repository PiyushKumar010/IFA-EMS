import express from "express";
import User from "../models/user.js";
import authenticateAdmin from "../middlewares/authAdmin.js";

const router = express.Router();


// Get all pending employees
router.get("/pending-users", authenticateAdmin, async (req, res) => {
  const users = await User.find({ status: "pending", roles: "employee" });
  res.json({ requests: users });
});

// approve employee
router.put("/approve/:id",authenticateAdmin,async (req,res)=>{
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {status: "approved"},
        
    );
    res.json({success: true, user});
});

// Reject employee
router.put("/reject/:id", authenticateAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ success: true });
});

// Suspend employee (revoke access - sets status to pending so they need approval again)
router.put("/suspend/:id", authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error suspending employee:", err);
    res.status(500).json({ error: "Failed to suspend employee" });
  }
});

export default router;
