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
    const rejectedEmployees = await User.countDocuments({ roles: "employee", status: "rejected" });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: "Active" });
    const completedProjects = await Project.countDocuments({ status: "Completed" });
    const newProjects = await Project.countDocuments({ status: "New" });

    // Get recent data
    const recentEmployees = await User.find({ roles: "employee" })
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

    // Get recent messages
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('sender', 'name email roles')
      .populate('recipient', 'name email')
      .select('subject sender recipient createdAt isRead');

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
          "employeeInfo.roles": "employee",
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

    // Get meeting statistics if available
    let meetingStats = { total: 0, thisWeek: 0 };
    try {
      const totalMeetings = await Meeting.countDocuments();
      const weeklyMeetings = await Meeting.countDocuments({
        scheduledAt: { $gte: weekAgo, $lt: tomorrow }
      });
      meetingStats = { total: totalMeetings, thisWeek: weeklyMeetings };
    } catch (err) {
      // Meeting model might not exist
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
