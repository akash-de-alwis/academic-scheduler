const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  batchNo: { type: String, required: true },
  year: { type: Number, required: true },
  department: { type: String, required: true, default: "Information Technology" },
  studentCount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  scheduleType: { type: String, enum: ["Weekdays", "Weekend"], required: true },
});

module.exports = mongoose.model("Batch", batchSchema);
