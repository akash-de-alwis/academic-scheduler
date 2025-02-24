const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");

// Create a schedule
router.post("/", async (req, res) => {
  try {
    const newSchedule = new Timetable(req.body);
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Timetable.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put("/:id", async (req, res) => {
  try {
    const updatedSchedule = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete schedule
router.delete("/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;