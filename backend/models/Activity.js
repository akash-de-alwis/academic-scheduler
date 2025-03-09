const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ["added", "edited", "deleted"], required: true },
  subjectName: { type: String, required: true },
  subjectID: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", activitySchema);