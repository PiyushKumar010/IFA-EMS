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
  // Admin can edit after submission
  lastEditedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  lastEditedAt: { type: Date },
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
  next();
});

const DailyForm = mongoose.model("DailyForm", dailyFormSchema);
export default DailyForm;

