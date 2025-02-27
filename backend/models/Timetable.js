const mongoose = require("mongoose");

const TimetableSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  lecturer: { type: String, required: true },
  batch: { type: String, required: true },
  duration: { type: String, default: "1" } // Added duration field
}, { timestamps: true });

module.exports = mongoose.model("Timetable", TimetableSchema);