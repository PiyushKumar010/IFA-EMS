import mongoose from "mongoose";

const dailyFormSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  // Time tracking
  entryTime: { 
    type: Date,
    default: null 
  },
  exitTime: { 
    type: Date,
    default: null 
  },
  // Custom tags that can be added/removed
  customTags: [{
    name: { type: String, required: true },
    color: { type: String, default: "#6366f1" }, // Hex color
    employeeChecked: { type: Boolean, default: false },
    adminChecked: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  }],
  // Standard tasks with employee and admin checkboxes
  tasks: [{
    taskId: { type: String, required: true }, // Unique identifier for the task
    taskText: { type: String, required: true },
    category: { type: String }, // e.g., "Disciplinary Tasks", "Client Handling", etc.
    frequency: { 
      type: String, 
      enum: ["daily", "weekly"], 
      default: "daily" 
    },
    employeeChecked: { type: Boolean, default: false },
    adminChecked: { type: Boolean, default: false },
    // Only counts if both are checked - calculated dynamically
    isCompleted: { 
      type: Boolean, 
      default: false
    }
  }],
  // Custom tasks assigned by admin
  customTasks: [{
    taskText: { type: String, required: true },
    employeeChecked: { type: Boolean, default: false },
    adminChecked: { type: Boolean, default: false },
    isCompleted: { 
      type: Boolean, 
      default: false
    }
  }],
  // Additional fields
  hoursAttended: { type: Number, default: 0 },
  screensharing: { type: Boolean, default: false },
  adminConfirmed: { type: Boolean, default: false },
  adminConfirmedAt: { type: Date },
  // Form status
  submitted: { type: Boolean, default: false },
  submittedAt: { type: Date },
  // Admin workflow
  adminAutoSelected: { type: Boolean, default: false },
  adminAutoSelectedAt: { type: Date },
  adminReviewed: { type: Boolean, default: false },
  adminReviewedAt: { type: Date },
  lastEditedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  lastEditedAt: { type: Date },
  // Admin notes
  adminNotes: { type: String, default: "" },
  // Scoring and bonus fields
  score: { type: Number, default: 0 }, // Score based on completed tasks
  dailyBonus: { type: Number, default: 0 }, // Bonus in Indian Rupees
  scoreCalculatedAt: { type: Date } // When score was last calculated
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index to ensure one form per employee per day
dailyFormSchema.index({ employee: 1, date: 1 }, { unique: true });

// Pre-save hook to update isCompleted for all tasks
dailyFormSchema.pre("save", function(next) {
  // Update tasks
  if (this.tasks) {
    this.tasks.forEach(task => {
      task.isCompleted = task.employeeChecked && task.adminChecked;
    });
  }
  // Update customTasks
  if (this.customTasks) {
    this.customTasks.forEach(task => {
      task.isCompleted = task.employeeChecked && task.adminChecked;
    });
  }
  // Update customTags
  if (this.customTags) {
    this.customTags.forEach(tag => {
      tag.isCompleted = tag.employeeChecked && tag.adminChecked;
    });
  }
  // Auto calculate hours if both entry and exit time are set
  if (this.entryTime && this.exitTime) {
    const diffMs = this.exitTime - this.entryTime;
    this.hoursAttended = Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  }
  next();
});

const DailyForm = mongoose.model("DailyForm", dailyFormSchema);
export default DailyForm;

