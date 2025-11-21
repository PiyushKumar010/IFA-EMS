import mongoose from "mongoose";

const hackathonApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  experience: {
    type: String,
    default: ""
  },
  skills: {
    type: String,
    required: true
  },
  projectIdea: {
    type: String,
    required: true
  },
  teamStatus: {
    type: String,
    enum: ["solo", "team", "looking"],
    required: true,
    default: "solo"
  },
  teamMembers: {
    type: String,
    default: ""
  },
  previousHackathons: {
    type: String,
    default: ""
  },
  motivation: {
    type: String,
    required: true
  },
  githubProfile: {
    type: String,
    default: ""
  },
  portfolioUrl: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "under-review", "accepted", "rejected"],
    default: "draft"
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewNotes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

const HackathonApplication = mongoose.model("HackathonApplication", hackathonApplicationSchema);

export default HackathonApplication;