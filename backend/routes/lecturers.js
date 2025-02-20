const express = require("express");
const Lecturer = require("../models/Lecturer");  // Using require instead of import

const router = express.Router();

// Create a new lecturer
router.post("/", async (req, res) => {
  try {
    const newLecturer = new Lecturer(req.body);
    const savedLecturer = await newLecturer.save();
    res.status(201).json(savedLecturer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all lecturers
router.get("/", async (req, res) => {
  try {
    const lecturers = await Lecturer.find();
    res.json(lecturers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a lecturer
router.put("/:id", async (req, res) => {
  try {
    const updatedLecturer = await Lecturer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLecturer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a lecturer
router.delete("/:id", async (req, res) => {
  try {
    await Lecturer.findByIdAndDelete(req.params.id);
    res.json({ message: "Lecturer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;  // Using module.exports to export the router
