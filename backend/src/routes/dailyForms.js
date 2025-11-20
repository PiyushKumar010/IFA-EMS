import express from "express";
import DailyForm from "../models/dailyForm.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper function to check if form editing is allowed (before midnight of form date)
const isFormEditableByEmployee = (formDate) => {
  const now = new Date();
  const formDateObj = new Date(formDate);
  
  // Get the start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get the start of the form date
  const formDay = new Date(formDateObj);
  formDay.setHours(0, 0, 0, 0);
  
  // If the form is from today, it's always editable (until midnight)
  if (formDay.getTime() === today.getTime()) {
    return true;
  }
  
  // If the form is from a previous day, it's not editable
  if (formDay.getTime() < today.getTime()) {
    return false;
  }
  
  // If the form is from a future day, it's not editable
  return false;
};

// Helper function to get time remaining until midnight
const getTimeUntilMidnight = (formDate) => {
  const now = new Date();
  const formDateObj = new Date(formDate);
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get form's date
  const formDay = new Date(formDateObj);
  formDay.setHours(0, 0, 0, 0);
  
  // If form is not from today, return expired
  if (formDay.getTime() !== today.getTime()) {
    return { 
      expired: true, 
      message: "Can only edit today's form" 
    };
  }
  
  // Calculate time until end of today
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  const timeRemaining = endOfToday - now;
  
  if (timeRemaining <= 0) {
    return { expired: true, message: "Today's editing period has expired" };
  }
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    expired: false,
    timeRemaining,
    hours,
    minutes,
    message: `${hours}h ${minutes}m remaining to edit today's form`
  };
};

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
const calculateScoreAndBonus = (form, { requireAdminApproval = true } = {}) => {
  let score = 0;

  const isTaskCompleted = (task = {}) => {
    if (requireAdminApproval) {
      if (typeof task.isCompleted === "boolean") {
        return task.isCompleted;
      }
      return Boolean(task.employeeChecked && task.adminChecked);
    }
    return Boolean(task.employeeChecked || task.adminChecked);
  };
  
  // Count completed tasks
  const completedTasks = (form.tasks || []).reduce(
    (count, task) => count + (isTaskCompleted(task) ? 1 : 0),
    0
  );
  const completedCustomTasks = (form.customTasks || []).reduce(
    (count, task) => count + (isTaskCompleted(task) ? 1 : 0),
    0
  );
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
    
    // Add editability status - always calculate time based on current day
    const isEditable = isFormEditableByEmployee(form.date);
    const timeInfo = getTimeUntilMidnight(); // Remove form.date parameter
    
    res.json({ 
      form: formObj, 
      canEdit: isEditable,
      timeRemaining: timeInfo
    });
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

    let form = await DailyForm.findOne({
      employee: req.user.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!form) {
      return res.status(404).json({ error: "No form found for today" });
    }

    // Check if form is still editable (midnight restriction)
    if (!isFormEditableByEmployee(form.date)) {
      return res.status(403).json({ 
        error: "Cannot edit previous day's form",
        message: "You can only edit today's form. Previous day forms are locked after midnight."
      });
    }

    const { tasks, customTasks, hoursAttended, screensharing } = req.body;

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
    
    // Add editability info to response
    const timeInfo = getTimeUntilMidnight(); // Remove form.date parameter
    
    res.json({ 
      success: true, 
      form: updatedFormObj,
      canEdit: false, // After submission, form becomes non-editable
      timeRemaining: timeInfo
    });
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

// Leaderboard: Get employee rankings based on daily bonuses
router.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const { date, days = 30, view = "auto" } = req.query;
    
    let startDate, endDate;
    if (date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      startDate.setHours(0, 0, 0, 0);
    }

    const baseMatch = {
      date: { $gte: startDate, $lt: endDate }
    };

    const fetchForms = async (criteria = {}) => {
      return DailyForm.find({ ...baseMatch, ...criteria })
        .populate("employee", "name email status roles")
        .lean();
    };

    let resolvedView = view;
    let forms = [];

    if (view === "approved") {
      forms = await fetchForms({ submitted: true, adminConfirmed: true });
      resolvedView = "approved";
    } else if (view === "submitted") {
      forms = await fetchForms({ submitted: true });
      resolvedView = "submitted";
    } else {
      forms = await fetchForms({ submitted: true, adminConfirmed: true });
      resolvedView = forms.length ? "approved" : "submitted";

      if (!forms.length) {
        forms = await fetchForms({ submitted: true });
      }

      if (!forms.length) {
        forms = await fetchForms({});
        resolvedView = forms.length ? "historical" : "none";
      }
    }

    const statsByEmployee = {};
    let approvalsUsed = 0;
    let pendingUsed = 0;

    forms.forEach((form) => {
      if (!form.employee) {
        return;
      }

      const empId = form.employee._id.toString();
      if (!statsByEmployee[empId]) {
        statsByEmployee[empId] = {
          employee: {
            _id: form.employee._id,
            name: form.employee.name || "Unnamed Employee",
            email: form.employee.email,
            status: form.employee.status
          },
          totalScore: 0,
          totalBonus: 0,
          daysWorked: 0,
          averageScore: 0,
          provisionalDays: 0,
          approvedDays: 0
        };
      }

      const requireAdminApproval =
        view === "approved"
          ? true
          : form.adminConfirmed === true;

      if (requireAdminApproval) {
        approvalsUsed += 1;
      } else {
        pendingUsed += 1;
      }

      const { score, dailyBonus } = calculateScoreAndBonus(form, {
        requireAdminApproval
      });

      statsByEmployee[empId].totalScore += score;
      statsByEmployee[empId].totalBonus += dailyBonus;
      statsByEmployee[empId].daysWorked += 1;

      if (requireAdminApproval) {
        statsByEmployee[empId].approvedDays += 1;
      } else {
        statsByEmployee[empId].provisionalDays += 1;
      }
    });

    const leaderboard = Object.values(statsByEmployee)
      .map((entry) => ({
        ...entry,
        averageScore:
          entry.daysWorked > 0
            ? Number((entry.totalScore / entry.daysWorked).toFixed(2))
            : 0,
        hasProvisionalData: entry.provisionalDays > 0
      }))
      .sort((a, b) => {
        if (b.totalBonus === a.totalBonus) {
          return b.totalScore - a.totalScore;
        }
        return b.totalBonus - a.totalBonus;
      });

    res.json({
      leaderboard,
      dateRange: {
        start: startDate,
        end: endDate
      },
      summary: {
        dataSource: resolvedView,
        formsEvaluated: forms.length,
        approvalsUsed,
        pendingUsed
      }
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
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

// Get employee's own stats and bonus
router.get("/my-stats", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { days = 30, range } = req.query;
    const isAllTime = range === "all" || days === "all";

    let startDate = null;
    let endDate = null;
    if (!isAllTime) {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days, 10));
      startDate.setHours(0, 0, 0, 0);
    }

    const baseFilters = {
      employee: req.user.userId,
      submitted: true,
      adminConfirmed: true
    };

    if (!isAllTime) {
      baseFilters.date = { $gte: startDate, $lt: endDate };
    }

    const forms = await DailyForm.find(baseFilters)
      .sort({ date: -1 })
      .lean();

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

    stats.averageScore = stats.daysWorked > 0 ? Number((stats.totalScore / stats.daysWorked).toFixed(2)) : 0;

    const pendingFilters = {
      employee: req.user.userId,
      submitted: true,
      $or: [
        { adminConfirmed: false },
        { adminConfirmed: { $exists: false } }
      ]
    };
    if (!isAllTime) {
      pendingFilters.date = { $gte: startDate, $lt: endDate };
    }

    stats.pendingApproval = await DailyForm.countDocuments(pendingFilters);

    res.json({
      stats,
      meta: {
        type: isAllTime ? "all" : "rolling",
        days: isAllTime ? null : parseInt(days, 10),
        dateRange: {
          start: startDate,
          end: endDate
        },
        lastUpdated: new Date()
      }
    });
  } catch (err) {
    console.error("Error fetching employee stats:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Admin auto-select all employee checked items
router.post("/admin/auto-select/:formId", authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    const adminId = req.user.userId;

    // Verify admin role
    const admin = await User.findById(adminId);
    if (!admin || !admin.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const form = await DailyForm.findById(formId).populate("employee", "name email");
    if (!form) {
      return res.status(404).json({ error: "Daily form not found" });
    }

    // Auto-select all items that employee has checked
    if (form.tasks) {
      form.tasks.forEach(task => {
        if (task.employeeChecked) {
          task.adminChecked = true;
        }
      });
    }

    if (form.customTasks) {
      form.customTasks.forEach(task => {
        if (task.employeeChecked) {
          task.adminChecked = true;
        }
      });
    }

    if (form.customTags) {
      form.customTags.forEach(tag => {
        if (tag.employeeChecked) {
          tag.adminChecked = true;
        }
      });
    }

    // Mark as auto-selected
    form.adminAutoSelected = true;
    form.adminAutoSelectedAt = new Date();
    form.lastEditedBy = adminId;
    form.lastEditedAt = new Date();

    await form.save();

    res.json({ 
      success: true, 
      message: "Auto-selected all employee checked items",
      form
    });
  } catch (error) {
    console.error("Auto-select error:", error);
    res.status(500).json({ error: "Failed to auto-select items" });
  }
});

// Update time tracking (entry/exit)
router.put("/time-tracking/:formId", authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    const { entryTime, exitTime } = req.body;
    const userId = req.user.userId;

    const form = await DailyForm.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Daily form not found" });
    }

    // Check if user is the form owner or admin
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes("admin");
    const isOwner = form.employee.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Unauthorized to update this form" });
    }

    // For employees, check midnight restriction
    if (!isAdmin && !isFormEditableByEmployee(form.date)) {
      return res.status(403).json({ 
        error: "Cannot edit previous day's form",
        message: "You can only edit today's form. Previous day forms are locked after midnight."
      });
    }

    // Update time tracking
    if (entryTime) form.entryTime = new Date(entryTime);
    if (exitTime) form.exitTime = new Date(exitTime);

    form.lastEditedBy = userId;
    form.lastEditedAt = new Date();

    await form.save();

    // Add editability info to response
    const canEdit = isAdmin || isFormEditableByEmployee(form.date);
    const timeInfo = getTimeUntilMidnight(); // Remove form.date parameter

    res.json({ 
      success: true, 
      message: "Time tracking updated",
      form,
      canEdit,
      timeRemaining: timeInfo
    });
  } catch (error) {
    console.error("Time tracking error:", error);
    res.status(500).json({ error: "Failed to update time tracking" });
  }
});

// Add custom tag
router.post("/custom-tag/:formId", authenticateToken, async (req, res) => {
  try {
    const { formId } = req.params;
    const { name, color } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    const form = await DailyForm.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Daily form not found" });
    }

    // Check if user is admin or owner
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes("admin");
    const isOwner = form.employee.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Unauthorized to add tags" });
    }

    // Add new custom tag
    const newTag = {
      name,
      color: color || "#6366f1",
      employeeChecked: false,
      adminChecked: false,
      isCompleted: false,
      createdBy: userId,
      createdAt: new Date()
    };

    form.customTags.push(newTag);
    form.lastEditedBy = userId;
    form.lastEditedAt = new Date();

    await form.save();

    res.json({ 
      success: true, 
      message: "Custom tag added",
      tag: newTag,
      form
    });
  } catch (error) {
    console.error("Add custom tag error:", error);
    res.status(500).json({ error: "Failed to add custom tag" });
  }
});

// Delete custom tag
router.delete("/custom-tag/:formId/:tagId", authenticateToken, async (req, res) => {
  try {
    const { formId, tagId } = req.params;
    const userId = req.user.userId;

    const form = await DailyForm.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Daily form not found" });
    }

    // Check if user is admin or owner
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes("admin");
    const isOwner = form.employee.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Unauthorized to delete tags" });
    }

    // Remove the tag
    form.customTags = form.customTags.filter(tag => tag._id.toString() !== tagId);
    form.lastEditedBy = userId;
    form.lastEditedAt = new Date();

    await form.save();

    res.json({ 
      success: true, 
      message: "Custom tag deleted",
      form
    });
  } catch (error) {
    console.error("Delete custom tag error:", error);
    res.status(500).json({ error: "Failed to delete custom tag" });
  }
});

// Admin create new daily form for employee
router.post("/admin/create-for-employee", authenticateToken, async (req, res) => {
  try {
    const { employeeId, date, entryTime, exitTime, adminNotes, customTasks = [], customTags = [] } = req.body;
    const adminId = req.user.userId;

    // Verify admin role
    const admin = await User.findById(adminId);
    if (!admin || !admin.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee || !employee.roles.includes("employee")) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Fix date handling
    const formDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(formDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(formDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if form already exists for this date
    const existingForm = await DailyForm.findOne({
      employee: employeeId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (existingForm) {
      return res.status(400).json({ error: "Daily form already exists for this date" });
    }

    // Create entry and exit DateTime objects
    let entryDateTime = null;
    let exitDateTime = null;
    
    if (entryTime) {
      entryDateTime = new Date(`${formDate.toISOString().split('T')[0]}T${entryTime}`);
    }
    if (exitTime) {
      exitDateTime = new Date(`${formDate.toISOString().split('T')[0]}T${exitTime}`);
    }

    // Create new form with standard tasks
    const newForm = new DailyForm({
      employee: employeeId,
      date: startOfDay,
      entryTime: entryDateTime,
      exitTime: exitDateTime,
      tasks: STANDARD_TASKS.map(task => ({
        ...task,
        employeeChecked: false,
        adminChecked: false,
        isCompleted: false
      })),
      customTasks: customTasks.map(task => ({
        taskText: task.taskText || task.text || task,
        employeeChecked: false,
        adminChecked: false,
        isCompleted: false
      })),
      customTags: customTags.map(tag => ({
        name: tag.name || tag,
        color: tag.color || "#6366f1",
        employeeChecked: false,
        adminChecked: false,
        isCompleted: false,
        createdBy: adminId,
        createdAt: new Date()
      })),
      adminNotes: adminNotes || "",
      submitted: false,
      lastEditedBy: adminId,
      lastEditedAt: new Date()
    });

    await newForm.save();

    const populatedForm = await DailyForm.findById(newForm._id)
      .populate("employee", "name email")
      .populate("lastEditedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Daily form created for employee",
      form: populatedForm
    });
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({ error: "Failed to create daily form" });
  }
});

// Get default form template for admin
router.get("/admin/default-template", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // Return the current standard tasks as the default template
    const defaultTemplate = {
      standardTasks: STANDARD_TASKS,
      customTasks: [],
      customTags: [],
      settings: {
        requireEntryTime: true,
        requireExitTime: true,
        allowCustomTasks: true,
        allowCustomTags: true
      }
    };

    res.json({
      success: true,
      template: defaultTemplate
    });
  } catch (error) {
    console.error("Get default template error:", error);
    res.status(500).json({ error: "Failed to get default template" });
  }
});

// Update default form template (admin can customize the standard form)
router.put("/admin/default-template", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) {
      return res.status(403).json({ error: "Admin access required" });
    }

    // This is a placeholder for future implementation
    // In the future, you could store custom default templates in the database
    res.json({
      success: true,
      message: "Default template updated (feature coming soon)",
      note: "Currently using hardcoded standard tasks. Custom templates will be available in future updates."
    });
  } catch (error) {
    console.error("Update default template error:", error);
    res.status(500).json({ error: "Failed to update default template" });
  }
});

export default router;

