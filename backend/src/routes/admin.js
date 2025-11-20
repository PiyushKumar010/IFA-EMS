import express from "express";
import User from "../models/user.js";
import Project from "../models/project.js";
import DailyForm from "../models/dailyForm.js";
import Meeting from "../models/meeting.js";
import Message from "../models/message.js";
import authenticateAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

// Get admin dashboard overview data
router.get("/overview", authenticateAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalEmployees = await User.countDocuments({ roles: "employee" });
    const approvedEmployees = await User.countDocuments({ roles: "employee", status: "approved" });
    const pendingEmployees = await User.countDocuments({ roles: "employee", status: "pending" });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: "Active" });
    const completedProjects = await Project.countDocuments({ status: "Completed" });
    const newProjects = await Project.countDocuments({ status: "New" });

    // Get recent data
    const recentEmployees = await User.find({ roles: "employee" })
      .sort({ lastLogin: -1 })
      .limit(5)
      .select('name email status lastLogin');

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignees', 'name email')
      .select('projectName clientName status createdAt assignees');

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySubmissions = await DailyForm.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      submitted: true
    });

    // Get recent messages
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sender', 'name email')
      .select('subject sender createdAt');

    // Calculate total hours logged across all projects
    const totalHoursLogged = await Project.aggregate([
      { $group: { _id: null, total: { $sum: "$estimatedHoursTaken" } } }
    ]);

    const stats = {
      employees: {
        total: totalEmployees,
        approved: approvedEmployees,
        pending: pendingEmployees,
        rejected: totalEmployees - approvedEmployees - pendingEmployees
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        new: newProjects
      },
      dailyForms: {
        todaySubmissions
      },
      totalHoursLogged: totalHoursLogged[0]?.total || 0
    };

    const recentData = {
      employees: recentEmployees,
      projects: recentProjects,
      messages: recentMessages
    };

    res.json({
      success: true,
      stats,
      recentData
    });

  } catch (error) {
    console.error("Error fetching overview data:", error);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});


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
