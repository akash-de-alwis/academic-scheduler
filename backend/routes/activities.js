const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");

// Get all activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    res.status(200).json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new activity
router.post("/", async (req, res) => {
  const { type, subjectName, subjectID } = req.body;
  try {
    const activity = new Activity({
      type,
      subjectName,
      subjectID,
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;