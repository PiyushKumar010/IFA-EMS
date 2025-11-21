import express from "express";
import DefaultFormTemplate from "../models/defaultFormTemplate.js";
import authAdmin from "../middlewares/authAdmin.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Get all default form templates
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log("GET templates request, user:", req.user);
    
    const templates = await DefaultFormTemplate.find({ isActive: true })
      .populate("createdBy", "name email")
      .sort({ isDefault: -1, createdAt: -1 });
    
    console.log("Found templates:", templates.length);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching default form templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Get a specific template by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const template = await DefaultFormTemplate.findById(req.params.id)
      .populate("createdBy", "name email");
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

// Create a new default form template (Admin only)
router.post("/", authAdmin, async (req, res) => {
  try {
    console.log("Creating template, user:", req.user);
    console.log("Request body:", req.body);
    
    const { name, description, roleType, tasks, customTasks, isDefault } = req.body;
    
    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Template name is required" });
    }
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "User authentication failed" });
    }
    
    // If this is being set as default, unset other defaults for the same role
    if (isDefault) {
      await DefaultFormTemplate.updateMany(
        { roleType: roleType || "general", isDefault: true },
        { isDefault: false }
      );
    }
    
    const template = new DefaultFormTemplate({
      name: name.trim(),
      description: description || "",
      roleType: roleType || "general",
      tasks: Array.isArray(tasks) ? tasks : [],
      customTasks: Array.isArray(customTasks) ? customTasks : [],
      isDefault: Boolean(isDefault),
      createdBy: req.user.userId,
    });
    
    await template.save();
    await template.populate("createdBy", "name email");
    
    res.status(201).json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Failed to create template", details: error.message });
  }
});

// Update a default form template (Admin only)
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { name, description, roleType, tasks, customTasks, isDefault } = req.body;
    
    const template = await DefaultFormTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // If this is being set as default, unset other defaults for the same role
    if (isDefault && !template.isDefault) {
      await DefaultFormTemplate.updateMany(
        { roleType, isDefault: true, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    template.name = name || template.name;
    template.description = description || template.description;
    template.roleType = roleType || template.roleType;
    template.tasks = tasks || template.tasks;
    template.customTasks = customTasks || template.customTasks;
    template.isDefault = isDefault !== undefined ? isDefault : template.isDefault;
    
    await template.save();
    await template.populate("createdBy", "name email");
    
    res.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ error: "Failed to update template" });
  }
});

// Delete a template (Admin only)
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const template = await DefaultFormTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    template.isActive = false;
    await template.save();
    
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// Get default template for a role
router.get("/default/:roleType", authenticateToken, async (req, res) => {
  try {
    const template = await DefaultFormTemplate.findOne({
      roleType: req.params.roleType,
      isDefault: true,
      isActive: true,
    }).populate("createdBy", "name email");
    
    if (!template) {
      // Return a basic template if no default is found
      return res.json({
        name: "Basic Daily Form",
        roleType: req.params.roleType,
        tasks: [
          {
            taskId: "task-1",
            taskText: "Complete assigned work",
            isCompleted: false,
            employeeChecked: false,
            adminChecked: false
          }
        ],
        customTasks: []
      });
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error fetching default template:", error);
    res.status(500).json({ error: "Failed to fetch default template" });
  }
});

export default router;