import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  clientName: String,
  clientEmail: { type: String, required: true },
  description: String,
  status: { type: String, default: "New" },
  clientType: { type: String, default: "New" },
  priority: { type: String, default: "Normal" },
  projectType: { type: String, default: "" },
  vaIncharge: String,
  freelancer: String,
  updateIncharge: String,
  codersRecommendation: String,
  leadership: String,
  githubLinks: String,
  loomLink: String,
  whatsappGroupLink: String,
  estimatedHoursRequired: Number,
  estimatedHoursTaken: Number,
  startDate: Date,
  endDate: Date,
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  leadAssignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assigned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
