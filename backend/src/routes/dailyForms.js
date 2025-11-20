import express from "express";
import DailyForm from "../models/dailyForm.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Standard daily tasks list
const STANDARD_TASKS = [
  { taskId: "attended_morning", taskText: "Attended morning session", category: "Disciplinary Tasks", frequency: "daily" },
  { taskId: "came_on_time", taskText: "Came on time", category: "Disciplinary Tasks", frequency: "daily" },
  { taskId: "worked_on_project", taskText: "Worked on my project", category: "Client Handling", frequency: "daily" },
  { taskId: "asked_new_project", taskText: "Asked senior team for new Project", category: "Project Related", frequency: "daily" },
  { taskId: "got_code_corrected", taskText: "Got code corrected", category: "Management Related", frequency: "daily" },
  { taskId: "updated_client", taskText: "Updated client", category: "Client Handling", frequency: "daily" },
  { taskId: "worked_training", taskText: "Worked on training task", category: "Project Related", frequency: "daily" },
  { taskId: "updated_senior", taskText: "Updated Senior Team", category: "Management Related", frequency: "daily" },
  { taskId: "updated_progress", taskText: "Updated Daily Progress", category: "Management Related", frequency: "daily" },
  { taskId: "plan_next_day", taskText: "Plan Next day's task", category: "Management Related", frequency: "daily" },
  { taskId: "completed_all", taskText: "Completed all task for the day", category: "Management Related", frequency: "daily" },
  { taskId: "multiple_projects", taskText: "Worked on more than 1 project (if assigned)", category: "Project Related", frequency: "daily" },
  { taskId: "tasks_for_day", taskText: "Tasks for the day", category: "Project Related", frequency: "daily" },
  { taskId: "inform_unable", taskText: "Did you inform you are not able to do the project?", category: "Management Related", frequency: "daily" },
  { taskId: "project_given_elsewhere", taskText: "Did you made sure project was given to someone else?", category: "Management Related", frequency: "daily" },
  { taskId: "project_on_time", taskText: "Did you made sure project was on time?", category: "Management Related", frequency: "daily" },
  { taskId: "inform_bunking", taskText: "Did you inform before bunking the day before?", category: "Disciplinary Tasks", frequency: "daily" },
  { taskId: "inform_late", taskText: "Did you inform before coming late?", category: "Disciplinary Tasks", frequency: "daily" },
  { taskId: "inform_left_meeting", taskText: "Did you inform when you left the meeting?", category: "Disciplinary Tasks", frequency: "daily" },
  { taskId: "freelancer_needed", taskText: "Is freelancer needed for this project?", category: "Project Related", frequency: "daily" },
  { taskId: "freelancer_hired", taskText: "Did you made sure freelancer was hired?", category: "Project Related", frequency: "daily" },
  { taskId: "whatsapp_group", taskText: "Did you made sure you have been added to client's WhatsApp group on the same day?", category: "Client Handling", frequency: "daily" },
  { taskId: "slack_group", taskText: "Has the slack group made for this project?", category: "Project Related", frequency: "daily" },
  { taskId: "onedrive_files", taskText: "Did u add relevant files to onedrive?", category: "Management Related", frequency: "daily" },
  { taskId: "check_assigned", taskText: "Check if it has been assigned to somebody else already?", category: "Project Related", frequency: "daily" },
  { taskId: "choose_supervisor", taskText: "Choose your own supervisor", category: "Management Related", frequency: "daily" },
  { taskId: "check_priority", taskText: "Check if the project assigned is still on and in priority", category: "Project Related", frequency: "daily" },
  { taskId: "client_followup", taskText: "Have you taken follow up from the client?", category: "Client Handling", frequency: "daily" },
  { taskId: "made_tasks", taskText: "Have you made all the tasks for the project?", category: "Project Related", frequency: "daily" },
  { taskId: "assign_deadlines", taskText: "Did you assign deadlines for each task?", category: "Project Related", frequency: "daily" },
  { taskId: "record_loom", taskText: "Did you record all the relavent loom videos", category: "Project Related", frequency: "daily" },
  { taskId: "organize_loom", taskText: "Did you record organize loom videos", category: "Project Related", frequency: "daily" },
  { taskId: "deadline_followed", taskText: "Was deadline followed?", category: "Project Related", frequency: "daily" },
  { taskId: "screensharing", taskText: "Were you screensharing and working at all times?", category: "Disciplinary Tasks", frequency: "daily" },
];

// Helper function to calculate isCompleted for all tasks
const calculateTaskCompletion = (form) => {
  if (form.tasks && Array.isArray(form.tasks)) {
    form.tasks = form.tasks.map(task => {
      const taskObj = task.toObject ? task.toObject() : task;
      return {
        ...taskObj,
        isCompleted: taskObj.employeeChecked && taskObj.adminChecked
      };
    });
  }
  if (form.customTasks && Array.isArray(form.customTasks)) {
    form.customTasks = form.customTasks.map(task => {
      const taskObj = task.toObject ? task.toObject() : task;
      return {
        ...taskObj,
        isCompleted: taskObj.employeeChecked && taskObj.adminChecked
      };
    });
  }
  return form;
};

// Helper function to calculate score and bonus
// Score: Each completed task = 1 point, screensharing bonus = 5 points, hours bonus (max 8 hours = 10 points)
// Bonus: Score * 10 = bonus in rupees (₹10 per point, max ₹500 per day)
const calculateScoreAndBonus = (form) => {
  let score = 0;
  
  // Count completed tasks (both employee and admin checked)
  const completedTasks = (form.tasks || []).filter(t => t.isCompleted).length;
  const completedCustomTasks = (form.customTasks || []).filter(t => t.isCompleted).length;
  score += completedTasks + completedCustomTasks;
  
  // Screensharing bonus: +5 points
  if (form.screensharing) {
    score += 5;
  }
  
  // Hours bonus: up to 10 points for 8+ hours
  if (form.hoursAttended >= 8) {
    score += 10;
  } else if (form.hoursAttended >= 6) {
    score += 7;
  } else if (form.hoursAttended >= 4) {
    score += 4;
  } else if (form.hoursAttended >= 2) {
    score += 2;
  }
  
  // Calculate bonus: ₹10 per point, capped at ₹500 per day
  const dailyBonus = Math.min(score * 10, 500);
  
  return { score, dailyBonus };
};

// Employee: Get today's form or create a new one
router.get("/today", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let form = await DailyForm.findOne({
      employee: req.user.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // If no form exists, create one with standard tasks
    if (!form) {
      const tasks = STANDARD_TASKS.map(task => ({
        taskId: task.taskId,
        taskText: task.taskText,
        category: task.category,
        frequency: task.frequency,
        employeeChecked: false,
        adminChecked: false
      }));

      form = new DailyForm({
        employee: req.user.userId,
        date: today,
        tasks: tasks,
        customTasks: [],
        hoursAttended: 0,
        screensharing: false,
        submitted: false
      });
      await form.save();
    }

    const formObj = form.toObject();
    calculateTaskCompletion(formObj);
    res.json({ form: formObj });
  } catch (err) {
    console.error("Error fetching today's form:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Employee: Check if form can be submitted (once per day)
router.get("/can-submit", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const form = await DailyForm.findOne({
      employee: req.user.userId,
      date: { $gte: today, $lt: tomorrow },
      submitted: true
    });

    res.json({ canSubmit: !form });
  } catch (err) {
    console.error("Error checking submission:", err);
    res.status(500).json({ error: "Failed to check submission" });
  }
});

// Employee: Submit daily form
router.post("/submit", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already submitted today
    const existing = await DailyForm.findOne({
      employee: req.user.userId,
      date: { $gte: today, $lt: tomorrow },
      submitted: true
    });

    if (existing) {
      return res.status(400).json({ error: "Form already submitted for today" });
    }

    const { tasks, customTasks, hoursAttended, screensharing } = req.body;

    let form = await DailyForm.findOne({
      employee: req.user.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!form) {
      // Create new form with standard tasks if not exists
      const standardTasks = STANDARD_TASKS.map(task => ({
        taskId: task.taskId,
        taskText: task.taskText,
        category: task.category,
        frequency: task.frequency,
        employeeChecked: false,
        adminChecked: false
      }));

      form = new DailyForm({
        employee: req.user.userId,
        date: today,
        tasks: standardTasks,
        customTasks: [],
        hoursAttended: 0,
        screensharing: false
      });
    }

    // Update form with submitted data
    if (tasks) form.tasks = tasks;
    if (customTasks) form.customTasks = customTasks;
    if (hoursAttended !== undefined) form.hoursAttended = hoursAttended;
    if (screensharing !== undefined) form.screensharing = screensharing;
    
    form.submitted = true;
    form.submittedAt = new Date();

    // Reset scoring until admin confirms
    form.adminConfirmed = false;
    form.adminConfirmedAt = null;
    form.score = 0;
    form.dailyBonus = 0;
    form.scoreCalculatedAt = null;

    await form.save();
    const updatedFormObj = form.toObject();
    calculateTaskCompletion(updatedFormObj);
    res.json({ success: true, form: updatedFormObj });
  } catch (err) {
    console.error("Error submitting form:", err);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

// Admin: Get all forms for an employee
router.get("/employee/:employeeId", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const forms = await DailyForm.find({ employee: employeeId })
      .populate("employee", "name email")
      .sort({ date: -1 });

    const formsWithCompletion = forms.map(form => {
      const formObj = form.toObject();
      return calculateTaskCompletion(formObj);
    });

    res.json({ forms: formsWithCompletion });
  } catch (err) {
    console.error("Error fetching employee forms:", err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// Admin: Get a specific form by ID
router.get("/:formId", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { formId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }

    const form = await DailyForm.findById(formId)
      .populate("employee", "name email");

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const formObj = form.toObject();
    calculateTaskCompletion(formObj);
    res.json({ form: formObj });
  } catch (err) {
    console.error("Error fetching form:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Admin: Update form (edit and approve)
router.put("/:formId", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { formId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }

    const { tasks, customTasks, hoursAttended, screensharing } = req.body;

    const form = await DailyForm.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    if (tasks) form.tasks = tasks;
    if (customTasks) form.customTasks = customTasks;
    if (hoursAttended !== undefined) form.hoursAttended = hoursAttended;
    if (screensharing !== undefined) form.screensharing = screensharing;
    
    form.lastEditedBy = req.user.userId;
    form.lastEditedAt = new Date();

    // Calculate score and bonus before saving
    const formObj = form.toObject();
    calculateTaskCompletion(formObj);
    const { score, dailyBonus } = calculateScoreAndBonus(formObj);
    form.score = score;
    form.dailyBonus = dailyBonus;
    form.scoreCalculatedAt = new Date();
    form.adminConfirmed = true;
    form.adminConfirmedAt = new Date();

    await form.save();
    const updatedFormObj = form.toObject();
    calculateTaskCompletion(updatedFormObj);
    res.json({ success: true, form: updatedFormObj });
  } catch (err) {
    console.error("Error updating form:", err);
    res.status(500).json({ error: "Failed to update form" });
  }
});

// Admin: Create custom form/tasks for an employee
router.post("/custom/:employeeId", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const { customTasks, date } = req.body;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let form = await DailyForm.findOne({
      employee: employeeId,
      date: { $gte: targetDate, $lt: nextDay }
    });

    if (!form) {
      // Create new form with standard tasks
      const standardTasks = STANDARD_TASKS.map(task => ({
        taskId: task.taskId,
        taskText: task.taskText,
        category: task.category,
        frequency: task.frequency,
        employeeChecked: false,
        adminChecked: false
      }));

      form = new DailyForm({
        employee: employeeId,
        date: targetDate,
        tasks: standardTasks,
        customTasks: customTasks || [],
        hoursAttended: 0,
        screensharing: false
      });
    } else {
      // Add custom tasks to existing form
      if (customTasks && Array.isArray(customTasks)) {
        form.customTasks = [...(form.customTasks || []), ...customTasks];
      }
    }

    await form.save();
    const formObj = form.toObject();
    calculateTaskCompletion(formObj);
    res.json({ success: true, form: formObj });
  } catch (err) {
    console.error("Error creating custom form:", err);
    res.status(500).json({ error: "Failed to create custom form" });
  }
});

// Leaderboard: Get employee rankings based on daily bonuses
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    // Get date range (default: last 30 days, or specific date)
    const { date, days = 30 } = req.query;
    
    let startDate, endDate;
    if (date) {
      // Get leaderboard for specific date
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      // Get leaderboard for last N days
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      startDate.setHours(0, 0, 0, 0);
    }

    // Get all approved employees
    const employees = await User.find({
      roles: "employee",
      status: "approved"
    }).select("_id name email");

    // Get all forms in date range
    const forms = await DailyForm.find({
      date: { $gte: startDate, $lt: endDate },
      submitted: true,
      adminConfirmed: true
    }).populate("employee", "name email");

    // Calculate totals for each employee
    const employeeStats = {};
    
    employees.forEach(emp => {
      employeeStats[emp._id.toString()] = {
        employee: {
          _id: emp._id,
          name: emp.name,
          email: emp.email
        },
        totalScore: 0,
        totalBonus: 0,
        daysWorked: 0,
        averageScore: 0
      };
    });

    // Aggregate scores and bonuses
    forms.forEach(form => {
      const empId = form.employee._id.toString();

      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employee: {
            _id: form.employee._id,
            name: form.employee.name,
            email: form.employee.email
          },
          totalScore: 0,
          totalBonus: 0,
          daysWorked: 0,
          averageScore: 0
        };
      }

      employeeStats[empId].totalScore += form.score || 0;
      employeeStats[empId].totalBonus += form.dailyBonus || 0;
      employeeStats[empId].daysWorked += 1;
    });

    // Calculate averages and convert to array
    const leaderboard = Object.values(employeeStats)
      .map(stat => ({
        ...stat,
        averageScore: stat.daysWorked > 0 ? (stat.totalScore / stat.daysWorked).toFixed(2) : 0
      }))
      .sort((a, b) => b.totalBonus - a.totalBonus); // Sort by total bonus descending

    res.json({
      leaderboard,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get employee's own stats and bonus
router.get("/my-stats", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { days = 30 } = req.query;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const forms = await DailyForm.find({
      employee: req.user.userId,
      date: { $gte: startDate, $lt: endDate },
      submitted: true,
      adminConfirmed: true
    }).sort({ date: -1 });

    const stats = {
      totalScore: 0,
      totalBonus: 0,
      daysWorked: forms.length,
      averageScore: 0,
      pendingApproval: 0,
      recentForms: forms.slice(0, 7).map(form => ({
        date: form.date,
        score: form.score || 0,
        bonus: form.dailyBonus || 0
      }))
    };

    forms.forEach(form => {
      stats.totalScore += form.score || 0;
      stats.totalBonus += form.dailyBonus || 0;
    });

    stats.averageScore = stats.daysWorked > 0 ? (stats.totalScore / stats.daysWorked).toFixed(2) : 0;

    stats.pendingApproval = await DailyForm.countDocuments({
      employee: req.user.userId,
      date: { $gte: startDate, $lt: endDate },
      submitted: true,
      adminConfirmed: false
    });

    res.json({ stats });
  } catch (err) {
    console.error("Error fetching employee stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;

