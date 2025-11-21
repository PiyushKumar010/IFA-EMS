import mongoose from "mongoose";

const defaultFormTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  roleType: {
    type: String,
    enum: ["general", "developer", "designer", "manager", "intern"],
    default: "general",
  },
  tasks: [{
    taskId: {
      type: String,
      required: true,
    },
    taskText: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    employeeChecked: {
      type: Boolean,
      default: false,
    },
    adminChecked: {
      type: Boolean,
      default: false,
    }
  }],
  customTasks: [{
    taskText: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    employeeChecked: {
      type: Boolean,
      default: false,
    },
    adminChecked: {
      type: Boolean,
      default: false,
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update timestamp on save
defaultFormTemplateSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("DefaultFormTemplate", defaultFormTemplateSchema);