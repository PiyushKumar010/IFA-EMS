import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  meetingLink: { type: String, required: true },
  description: { type: String, default: "" },
  meetingType: { 
    type: String, 
    enum: ["zoom", "google_meet", "teams", "other"],
    default: "other"
  },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true }, // e.g., "14:30"
  duration: { type: Number, default: 60 }, // Duration in minutes
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  // For employee meetings
  invitedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // For client meetings
  invitedClients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  meetingFor: {
    type: String,
    enum: ["employees", "clients", "both"],
    default: "employees"
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;

