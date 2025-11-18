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

export default router;
