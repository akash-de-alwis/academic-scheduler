const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Activity = require("../models/Activity");

// Create Subject
router.post("/", async (req, res) => {
  try {
    const { subjectName, timeDuration } = req.body;

    // Validate subjectName: only letters and spaces allowed
    if (!subjectName || !/^[a-zA-Z\s]+$/.test(subjectName)) {
      return res.status(400).json({ error: "Subject name must contain only letters and spaces" });
    }

    // Validate subjectName length (optional, matching frontend)
    if (subjectName.length < 3 || subjectName.length > 100) {
      return res.status(400).json({ error: "Subject name must be between 3 and 100 characters" });
    }

    // Validate timeDuration
    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time duration must be between 40 and 60 hours" });
    }

    // Check if subjectID already exists (assuming subjectID is unique)
    const existingSubject = await Subject.findOne({ subjectID: req.body.subjectID });
    if (existingSubject) {
      return res.status(400).json({ error: "Subject ID already exists" });
    }

    const subject = new Subject(req.body);
    await subject.save();

    // Log activity
    const activity = new Activity({
      type: "added",
      subjectName: subject.subjectName,
      subjectID: subject.subjectID,
    });
    await activity.save();

    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Subject
router.put("/:id", async (req, res) => {
  try {
    const { subjectName, timeDuration } = req.body;

    // Validate subjectName: only letters and spaces allowed
    if (!subjectName || !/^[a-zA-Z\s]+$/.test(subjectName)) {
      return res.status(400).json({ error: "Subject name must contain only letters and spaces" });
    }

    // Validate subjectName length (optional, matching frontend)
    if (subjectName.length < 3 || subjectName.length > 100) {
      return res.status(400).json({ error: "Subject name must be between 3 and 100 characters" });
    }

    // Validate timeDuration
    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time duration must be between 40 and 60 hours" });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Log activity
    const activity = new Activity({
      type: "edited",
      subjectName: updatedSubject.subjectName,
      subjectID: updatedSubject.subjectID,
    });
    await activity.save();

    res.status(200).json(updatedSubject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Subject
router.delete("/:id", async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    await Subject.findByIdAndDelete(req.params.id);

    // Log activity
    const activity = new Activity({
      type: "deleted",
      subjectName: subject.subjectName,
      subjectID: subject.subjectID,
    });
    await activity.save();

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = router;