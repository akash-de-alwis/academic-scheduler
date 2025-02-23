const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  LID: { type: String, required: true, unique: true },
  hallType: { type: String, enum: ["Lecturer Hall", "Laboratory", "Meeting Room"], required: true },
  department: { type: String, enum: ["Computer Faculty", "Engineer Faculty", "Business Faculty"], required: true },
  massHall: { type: Boolean, default: false },
  generalHall: { type: Boolean, default: false },
  miniHall: { type: Boolean, default: false },
  floor: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  totalComputers: { type: Number, default: 0 }, // Only for Laboratories
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
