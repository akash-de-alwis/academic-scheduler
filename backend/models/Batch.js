const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  intake: { 
    type: String, 
    enum: ["Regular", "Main"], 
    required: true, 
    default: "Regular" 
  },
  batchNo: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { 
    type: String, 
    enum: ["Semester1", "Semester2"], 
    required: true,
    default: "Semester1" 
  },
  department: { type: String, required: true, default: "Information Technology" },
  studentCount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  scheduleType: { type: String, enum: ["Weekdays", "Weekend"], required: true },
});

module.exports = mongoose.model("Batch", batchSchema);