const mongoose = require("mongoose");

const PublishedTimetableSchema = new mongoose.Schema({
  batch: { type: String, required: true, unique: true },
  schedules: [
    {
      allocationId: { type: String, required: true },
      batch: { type: String, required: true },
      subjects: [
        {
          subjectName: { type: String, required: true },
          lecturer: { type: String, required: true },
          room: { type: String, required: true },
          date: { type: String, required: true },
          time: { type: String, required: true },
          duration: { type: String, default: "1" },
        },
      ],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("PublishedTimetable", PublishedTimetableSchema);