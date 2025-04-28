// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  department: { type: String, required: true },
  floor: { type: String, required: true },
  meetingRoom: { type: String, required: true }, // Room ID (LID)
  dayType: { type: String, required: true, enum: ["Weekday", "Weekend"] },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // HH:MM format
  endTime: { type: String, required: true },   // HH:MM format
  seatCount: { type: Number, required: true }, // Room capacity
  totalCount: { type: Number, required: true }, // Number of attendees
  status: { type: String, required: true, enum: ["Pending", "Approved", "Denied"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);