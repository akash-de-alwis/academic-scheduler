const express = require("express");
const router = express.Router();
const Timetable = require("../models/Timetable");
const Allocation = require("../models/Allocation");
const PublishedTimetable = require("../models/PublishedTimetable");

// Create a schedule
router.post("/", async (req, res) => {
  try {
    const { allocationId } = req.body;
    const allocation = await Allocation.findOne({ allocationId });
    if (!allocation) {
      return res.status(400).json({ error: "Invalid Allocation ID" });
    }
    const newSchedule = new Timetable(req.body);
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all schedules
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
    const { allocationId } = req.body;
    if (allocationId) {
      const allocation = await Allocation.findOne({ allocationId });
      if (!allocation) {
        return res.status(400).json({ error: "Invalid Allocation ID" });
      }
    }
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

// Delete schedules by batch
router.delete("/batch", async (req, res) => {
  try {
    const { batch } = req.body;
    await Timetable.deleteMany({ batch });
    res.json({ message: `Schedules for batch ${batch} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Publish timetable
router.post("/published-timetable", async (req, res) => {
  try {
    const { batch, schedules } = req.body;
    const existing = await PublishedTimetable.findOne({ batch });
    if (existing) {
      await PublishedTimetable.updateOne({ batch }, { schedules });
    } else {
      const newPublished = new PublishedTimetable({ batch, schedules });
      await newPublished.save();
    }
    res.status(201).json({ message: "Timetable published successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get published timetable
router.get("/published-timetable", async (req, res) => {
  try {
    const { batch } = req.query;
    const timetable = await PublishedTimetable.findOne({ batch });
    res.json(timetable || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;