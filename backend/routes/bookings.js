// routes/bookings.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Get all bookings or filter by status
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a booking
router.post("/", async (req, res) => {
  try {
    const { meetingRoom, date, startTime, endTime, seatCount, totalCount } = req.body;

    const room = await Room.findOne({ LID: meetingRoom, hallType: "Meeting Room" });
    if (!room) return res.status(404).json({ message: "Meeting room not found" });
    if (seatCount !== room.totalSeats) {
      return res.status(400).json({ message: "Seat count must match room capacity" });
    }
    if (totalCount > seatCount) {
      return res.status(400).json({ message: "Total count cannot exceed room capacity" });
    }

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      meetingRoom,
      date: new Date(date).toISOString().split("T")[0],
      status: "Approved",
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });
    if (existingBooking) {
      return res.status(400).json({ message: "Room already booked for this time slot" });
    }

    const booking = new Booking(req.body);
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update booking status
router.put("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;