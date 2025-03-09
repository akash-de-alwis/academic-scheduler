// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  department: { type: String, required: true },
  floor: { type: String, required: true },
  meetingRoom: { type: String, required: true }, // Room ID (LID)
  dayType: { type: String, required: true, enum: ["Weekday", "Weekend"] },
  date: { type: Date, required: true },
  timeDuration: { type: String, required: true }, // Stored as HH:MM
  seatCount: { type: Number, required: true },
  status: { type: String, required: true, enum: ["Pending", "Approved", "Denied"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);