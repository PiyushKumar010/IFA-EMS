import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
