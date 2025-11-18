import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null for bulk
  content: { type: String, required: true },
  type: { type: String, enum: ["admin-to-all", "admin-to-employee", "employee-to-admin"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
