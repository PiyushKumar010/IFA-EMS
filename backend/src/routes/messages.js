
import express from "express";
import Message from "../models/message.js";
import User from "../models/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import { emitMessages } from "../socket.js";

const router = express.Router();

// Admin sends message to multiple employees
router.post("/admin/send-multi", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const { content, employeeIds } = req.body;
  if (!content || !Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ error: "Message content and employeeIds required" });
  }
  const employees = await User.find({ _id: { $in: employeeIds }, roles: { $in: ["employee"] } }, "_id");
  const messages = employees.map(emp => ({
    sender: req.user.userId,
    receiver: emp._id,
    content,
    type: "admin-to-employee"
  }));
  const inserted = await Message.insertMany(messages);
  await emitMessages(inserted);
  res.json({ success: true });
});

// Get all messages between admin and a specific employee
router.get("/admin/chat/:employeeId", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const employeeId = req.params.employeeId;
  const admins = await User.find({ roles: { $in: ["admin"] } }, "_id");
  const adminIds = admins.map(a => a._id);
  // Find all messages where any admin and employee are sender/receiver
  const messages = await Message.find({
    $or: [
      { sender: employeeId, receiver: { $in: adminIds } },
      { sender: { $in: adminIds }, receiver: employeeId }
    ]
  }).populate("sender", "name email picture roles").sort({ createdAt: 1 });
  res.json({ messages });
});

// Admin sends message to a specific employee
router.post("/admin/send", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const { content, employeeId } = req.body;
  if (!content || !employeeId) return res.status(400).json({ error: "Message content and employeeId required" });
  const message = new Message({
    sender: req.user.userId,
    receiver: employeeId,
    content,
    type: "admin-to-employee"
  });
  await message.save();
  await emitMessages(message);
  res.json({ success: true });
});

// Admin: get all employees
router.get("/employees", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const employees = await User.find({ roles: { $in: ["employee"] } }, "_id name email picture");
  res.json({ employees });
});

// Admin: send bulk message to all employees
router.post("/admin/send-bulk", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const { content, recipients } = req.body;
  if (!content) return res.status(400).json({ error: "Message content required" });
  let employees;
  if (Array.isArray(recipients) && recipients.length > 0) {
    employees = await User.find({ _id: { $in: recipients }, roles: "employee" }, "_id");
  } else {
    employees = await User.find({ roles: "employee" }, "_id");
  }
  const messages = employees.map(emp => ({
    sender: req.user.userId,
    receiver: emp._id,
    content,
    type: "admin-to-employee"
  }));
  const inserted = await Message.insertMany(messages);
  await emitMessages(inserted);
  res.json({ success: true });
});

// Admin: get messages from employees
router.get("/admin/inbox", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const messages = await Message.find({ type: "employee-to-admin" }).populate("sender", "name email picture").sort({ createdAt: -1 });
  res.json({ messages });
});

// Employee: get all messages between employee and admin
router.get("/employee/chat", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) return res.status(403).json({ error: "Forbidden" });
  const employeeId = req.user.userId;
  // Find all admins
  const admins = await User.find({ roles: { $in: ["admin"] } }, "_id");
  const adminIds = admins.map(a => a._id);
  // Find all messages between this employee and any admin
  const messages = await Message.find({
    $or: [
      { sender: employeeId, receiver: { $in: adminIds } },
      { sender: { $in: adminIds }, receiver: employeeId }
    ]
  }).populate("sender", "name email picture roles").sort({ createdAt: 1 });
  res.json({ messages });
});

// Employee: send message to admin (to first admin)
router.post("/employee/send", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("employee")) return res.status(403).json({ error: "Forbidden" });
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Message content required" });
  // Find first admin user
  const admin = await User.findOne({ roles: { $in: ["admin"] } }, "_id");
  if (!admin) return res.status(400).json({ error: "No admin found" });
  const message = new Message({
    sender: req.user.userId,
    receiver: admin._id,
    content,
    type: "employee-to-admin"
  });
  await message.save();
  await emitMessages(message);
  res.json({ success: true });
});

// Client: get all messages between client and admin
router.get("/client/chat", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("client")) return res.status(403).json({ error: "Forbidden" });
  const clientId = req.user.userId;
  // Find all admins
  const admins = await User.find({ roles: { $in: ["admin"] } }, "_id");
  const adminIds = admins.map(a => a._id);
  // Find all messages between this client and any admin
  const messages = await Message.find({
    $or: [
      { sender: clientId, receiver: { $in: adminIds } },
      { sender: { $in: adminIds }, receiver: clientId }
    ]
  }).populate("sender", "name email picture roles").sort({ createdAt: 1 });
  res.json({ messages });
});

// Client: send message to admin
router.post("/client/send", authenticateToken, async (req, res) => {
  try {
    if (!Array.isArray(req.user.roles) || !req.user.roles.includes("client")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content required" });
    }
    
    // Find first admin user
    const admin = await User.findOne({ roles: { $in: ["admin"] } }, "_id");
    if (!admin) {
      console.error("No admin user found in database");
      return res.status(500).json({ error: "No admin available to receive messages" });
    }
    
    const message = new Message({
      sender: req.user.userId,
      receiver: admin._id,
      content: content.trim(),
      type: "client-to-admin"
    });
    
    await message.save();
    await emitMessages(message);
    
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending client message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Admin: get all clients
router.get("/clients", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const clients = await User.find({ roles: { $in: ["client"] } }, "_id name email picture");
  res.json({ clients });
});

// Admin: get all messages between admin and a specific client
router.get("/admin/client-chat/:clientId", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const clientId = req.params.clientId;
  const admins = await User.find({ roles: { $in: ["admin"] } }, "_id");
  const adminIds = admins.map(a => a._id);
  // Find all messages where any admin and client are sender/receiver
  const messages = await Message.find({
    $or: [
      { sender: clientId, receiver: { $in: adminIds } },
      { sender: { $in: adminIds }, receiver: clientId }
    ]
  }).populate("sender", "name email picture roles").sort({ createdAt: 1 });
  res.json({ messages });
});

// Admin: send message to a specific client
router.post("/admin/send-to-client", authenticateToken, async (req, res) => {
  if (!Array.isArray(req.user.roles) || !req.user.roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  const { content, clientId } = req.body;
  if (!content || !clientId) return res.status(400).json({ error: "Message content and clientId required" });
  const message = new Message({
    sender: req.user.userId,
    receiver: clientId,
    content,
    type: "admin-to-client"
  });
  await message.save();
  await emitMessages(message);
  res.json({ success: true });
});

export default router;
