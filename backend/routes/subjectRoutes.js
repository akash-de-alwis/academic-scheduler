const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// Create Subject
router.post("/", async (req, res) => {
  try {
    const { timeDuration } = req.body;

    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time Duration must be between 40 and 60 hours." });
    }
    const subject = new Subject(req.body);
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all Subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Subject
router.put("/:id", async (req, res) => {
  try {
    const { timeDuration } = req.body;

    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time Duration must be between 40 and 60 hours." });
    }
    const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedSubject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Subject
router.delete("/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
