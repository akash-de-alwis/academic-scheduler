const mongoose = require("mongoose");

const LecturerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lecturerId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  scheduleType: { type: String, enum: ["Weekdays", "Weekend"], required: true },
});

const Lecturer = mongoose.model("Lecturer", LecturerSchema);

module.exports = Lecturer;
