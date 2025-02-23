const express = require("express");
const Room = require("../models/Room");

const router = express.Router();

//  Create a Room Booking
router.post("/", async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//  Get All Room Bookings
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Get a Single Room Booking by ID
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Update Room Booking
router.put("/:id", async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: "Room not found" });
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Delete Room Booking
router.delete("/:id", async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
