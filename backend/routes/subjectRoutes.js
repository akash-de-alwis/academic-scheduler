const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Activity = require("../models/Activity");

// Create Subject
router.post("/", async (req, res) => {
  try {
    const { timeDuration } = req.body;

    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time Duration must be between 40 and 60 hours." });
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
    const { timeDuration } = req.body;

    if (timeDuration < 40 || timeDuration > 60) {
      return res.status(400).json({ error: "Time Duration must be between 40 and 60 hours." });
    }
    const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });

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
    if (!subject) return res.status(404).json({ error: "Subject not found" });

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