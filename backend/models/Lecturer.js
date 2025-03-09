const mongoose = require("mongoose");

const LecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lecturerId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  scheduleType: { type: String, enum: ["Weekdays", "Weekend"], required: true },
  skills: [{ type: String }], // New skills field as an array of strings
});

const Lecturer = mongoose.model("Lecturer", LecturerSchema);

module.exports = Lecturer;