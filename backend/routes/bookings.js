const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const FacilityIssue = require("../models/FacilityIssue");

// Get all bookings or filter by status, enriched with pending facility issues
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const bookings = await Booking.find(query);

    // Fetch all pending facility issues
    const issues = await FacilityIssue.find({ status: "Pending" });

    // Map issues by roomId for quick lookup
    const issuesByRoom = issues.reduce((acc, issue) => {
      acc[issue.roomId] = acc[issue.roomId] || [];
      acc[issue.roomId].push({
        facilityType: issue.facilityType,
        department: issue.department,
        issues: issue.issues,
        description: issue.description,
        reportedDate: issue.reportedDate,
        status: issue.status,
      });
      return acc;
    }, {});

    // Enrich bookings with their related issues
    const enrichedBookings = bookings.map(booking => ({
      ...booking._doc,
      issues: issuesByRoom[booking.meetingRoom] || [],
    }));

    res.json(enrichedBookings);
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

    // Fetch issues for the newly created booking's room
    const issues = await FacilityIssue.find({ roomId: meetingRoom, status: "Pending" });
    res.status(201).json({
      ...newBooking._doc,
      issues: issues.map(issue => ({
        facilityType: issue.facilityType,
        department: issue.department,
        issues: issue.issues,
        description: issue.description,
        reportedDate: issue.reportedDate,
        status: issue.status,
      })),
    });
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

    // Fetch issues for the updated booking's room
    const issues = await FacilityIssue.find({ roomId: booking.meetingRoom, status: "Pending" });
    res.json({
      ...updatedBooking._doc,
      issues: issues.map(issue => ({
        facilityType: issue.facilityType,
        department: issue.department,
        issues: issue.issues,
        description: issue.description,
        reportedDate: issue.reportedDate,
        status: issue.status,
      })),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;