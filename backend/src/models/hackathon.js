import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    default: ""
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: "Virtual"
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  prizes: [{
    position: String, // "1st", "2nd", "3rd", etc.
    amount: String,   // "₹50,000", etc.
    description: String
  }],
  requirements: [String], // Array of requirements
  contactInfo: {
    email: String,
    phone: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    teamName: String,
    teamMembers: [String]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

export default Hackathon;