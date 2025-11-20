import express from "express";
import User from "../models/user.js";
import Project from "../models/project.js";
import DailyForm from "../models/dailyForm.js";
import Meeting from "../models/meeting.js";
import Message from "../models/message.js";
import authenticateAdmin from "../middlewares/authAdmin.js";
import { seedTestData } from "../seedData.js";

const router = express.Router();

// Seed test data endpoint (for development)
router.post("/seed-test-data", authenticateAdmin, async (req, res) => {
  try {
    const counts = await seedTestData();
    res.json({ success: true, message: "Test data seeded successfully", counts });
  } catch (error) {
    console.error("Seed data error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Simple overview endpoint for debugging
router.get("/overview-simple", authenticateAdmin, async (req, res) => {
  try {
    // Test basic collections exist
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();
    
    console.log("Simple counts - Users:", userCount, "Projects:", projectCount);
    
    // Get some actual data
    const users = await User.find({ roles: "employee" }).limit(3);
    const projects = await Project.find().limit(3);
    
    console.log("Sample users:", users.map(u => ({ email: u.email, roles: u.roles, status: u.status })));
    console.log("Sample projects:", projects.map(p => ({ name: p.projectName, status: p.status })));
    
    res.json({
      success: true,
      counts: { users: userCount, projects: projectCount },
      samples: { users, projects }
    });
  } catch (error) {
    console.error("Simple overview error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get admin dashboard overview data
router.get("/overview", authenticateAdmin, async (req, res) => {
  try {
    // Get total counts - handle both string and array roles
    const totalEmployees = await User.countDocuments({
      $or: [
        { roles: "employee" },
        { roles: { $in: ["employee"] } }
      ]
    });
    const approvedEmployees = await User.countDocuments({
      $or: [
        { roles: "employee" },
        { roles: { $in: ["employee"] } }
      ],
      status: "approved"
    });
    const pendingEmployees = await User.countDocuments({
      $or: [
        { roles: "employee" },
        { roles: { $in: ["employee"] } }
      ],
      status: "pending"
    });
    const rejectedEmployees = await User.countDocuments({
      $or: [
        { roles: "employee" },
        { roles: { $in: ["employee"] } }
      ],
      status: "rejected"
    });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: "Active" });
    const completedProjects = await Project.countDocuments({ status: "Completed" });
    const newProjects = await Project.countDocuments({ status: "New" });

    console.log("Basic counts:", {
      totalEmployees,
      approvedEmployees,
      pendingEmployees,
      totalProjects,
      activeProjects
    });

    // Get recent data - handle both string and array roles
    const recentEmployees = await User.find({
      $or: [
        { roles: "employee" },
        { roles: { $in: ["employee"] } }
      ]
    })
      .sort({ lastLogin: -1 })
      .limit(8)
      .select('name email status lastLogin profileCompleted department designation');

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('assignees', 'name email')
      .populate('leadAssignee', 'name email')
      .select('projectName clientName status createdAt assignees leadAssignee completionPercentage estimatedHoursRequired estimatedHoursTaken priority');

    // Get today's and recent daily form data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const todaySubmissions = await DailyForm.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      submitted: true
    });

    const weeklySubmissions = await DailyForm.countDocuments({
      date: { $gte: weekAgo, $lt: tomorrow },
      submitted: true
    });

    console.log("Daily form counts:", { todaySubmissions, weeklySubmissions });

    // Get recent daily forms with employee details
    const recentDailyForms = await DailyForm.find({
      date: { $gte: weekAgo, $lt: tomorrow },
      submitted: true
    })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('employee', 'name email department designation')
      .select('employee date submittedAt hoursAttended score tasks customTasks adminConfirmed screensharing');

    // Get productivity stats
    const productivityStats = await DailyForm.aggregate([
      {
        $match: {
          date: { $gte: weekAgo, $lt: tomorrow },
          submitted: true
        }
      },
      {
        $group: {
          _id: null,
          totalHoursAttended: { $sum: "$hoursAttended" },
          averageScore: { $avg: "$score" },
          totalFormsSubmitted: { $sum: 1 },
          confirmedForms: {
            $sum: { $cond: ["$adminConfirmed", 1, 0] }
          },
          screensharingForms: {
            $sum: { $cond: ["$screensharing", 1, 0] }
          }
        }
      }
    ]);

    // Get recent messages - updated to match actual Message model
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('sender', 'name email roles')
      .populate('receiver', 'name email')
      .select('content sender receiver createdAt type');

    // Get top performers (based on recent daily form scores)
    const topPerformers = await DailyForm.aggregate([
      {
        $match: {
          date: { $gte: weekAgo, $lt: tomorrow },
          submitted: true,
          score: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$employee",
          averageScore: { $avg: "$score" },
          totalHours: { $sum: "$hoursAttended" },
          formsSubmitted: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employeeInfo"
        }
      },
      {
        $unwind: "$employeeInfo"
      },
      {
        $match: {
          "employeeInfo.roles": { $in: ["employee"] },
          "employeeInfo.status": "approved"
        }
      },
      {
        $sort: { averageScore: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: "$employeeInfo.name",
          email: "$employeeInfo.email",
          department: "$employeeInfo.department",
          averageScore: { $round: ["$averageScore", 1] },
          totalHours: 1,
          formsSubmitted: 1
        }
      }
    ]);

    // Calculate total hours logged across all projects
    const totalHoursLogged = await Project.aggregate([
      { $group: { _id: null, total: { $sum: "$estimatedHoursTaken" } } }
    ]);

    // Get meeting statistics - updated to match actual Meeting model
    let meetingStats = { total: 0, thisWeek: 0 };
    try {
      const totalMeetings = await Meeting.countDocuments();
      const weeklyMeetings = await Meeting.countDocuments({
        scheduledDate: { $gte: weekAgo, $lt: tomorrow }
      });
      meetingStats = { total: totalMeetings, thisWeek: weeklyMeetings };
    } catch (err) {
      console.log("Meeting stats error:", err.message);
      meetingStats = { total: 0, thisWeek: 0 };
    }

    const stats = {
      employees: {
        total: totalEmployees,
        approved: approvedEmployees,
        pending: pendingEmployees,
        rejected: rejectedEmployees
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        new: newProjects
      },
      dailyForms: {
        todaySubmissions,
        weeklySubmissions,
        productivity: productivityStats[0] || {}
      },
      meetings: meetingStats,
      totalHoursLogged: totalHoursLogged[0]?.total || 0
    };

    const recentData = {
      employees: recentEmployees,
      projects: recentProjects,
      messages: recentMessages,
      dailyForms: recentDailyForms,
      topPerformers
    };

    console.log("Final stats:", stats);
    console.log("Recent data counts:", {
      employees: recentData.employees?.length,
      projects: recentData.projects?.length,
      messages: recentData.messages?.length,
      dailyForms: recentData.dailyForms?.length,
      topPerformers: recentData.topPerformers?.length
    });

    res.json({
      success: true,
      stats,
      recentData
    });

  } catch (error) {
    console.error("Error fetching overview data:", error);
    res.status(500).json({ error: "Failed to fetch overview data", details: error.message });
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
