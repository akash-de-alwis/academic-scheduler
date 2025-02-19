import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  availability: { type: String, enum: ["weekdays", "weekend"], required: true },
});

export default mongoose.model("Lecturer", LecturerSchema);
