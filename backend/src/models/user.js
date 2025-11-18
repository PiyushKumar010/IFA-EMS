import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  roles: { type: [String], default: [] },  // e.g. ["employee", "admin"]
  name: String,
  picture: String,
  lastLogin: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default:"approved",
  },
  
   assignedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
});

//  Only employees get assigned "pending"
userSchema.pre("save", function (next) {
  // Only set status to 'pending' for new employees
  if (this.isNew && Array.isArray(this.roles) && this.roles.includes("employee")) {
    this.status = "pending";
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
