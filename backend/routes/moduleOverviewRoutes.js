// routes/moduleOverviewRoutes.js
const express = require("express");
const router = express.Router();
const ModuleOverview = require("../models/ModuleOverview");
const Activity = require("../models/Activity");

// Create Module Overview
router.post("/", async (req, res) => {
  try {
    const moduleOverview = new ModuleOverview(req.body);
    await moduleOverview.save();

    const activity = new Activity({
      type: "added",
      subjectName: "Module Overview",
      subjectID: moduleOverview._id,
    });
    await activity.save();

    res.status(201).json(moduleOverview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all Module Overviews
router.get("/", async (req, res) => {
  try {
    const moduleOverviews = await ModuleOverview.find().populate("subject");
    res.status(200).json(moduleOverviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Module Overview
router.put("/:id", async (req, res) => {
  try {
    const updatedModule = await ModuleOverview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("subject");

    if (!updatedModule) {
      return res.status(404).json({ error: "Module Overview not found" });
    }

    const activity = new Activity({
      type: "edited",
      subjectName: "Module Overview",
      subjectID: updatedModule._id,
    });
    await activity.save();

    res.status(200).json(updatedModule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Module Overview
router.delete("/:id", async (req, res) => {
  try {
    const moduleOverview = await ModuleOverview.findById(req.params.id);
    if (!moduleOverview) {
      return res.status(404).json({ error: "Module Overview not found" });
    }

    await ModuleOverview.findByIdAndDelete(req.params.id);

    const activity = new Activity({
      type: "deleted",
      subjectName: "Module Overview",
      subjectID: moduleOverview._id,
    });
    await activity.save();

    res.status(200).json({ message: "Module Overview deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;