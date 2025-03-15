const express = require("express");
const Settings = require("../models/Settings");
const router = express.Router();

// GET max workload
router.get("/max-workload", async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: "maxWorkload" });
    res.json({ maxWorkload: setting ? setting.value : 5 }); // Default to 5 if not set
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST max workload
router.post("/max-workload", async (req, res) => {
  try {
    const { maxWorkload } = req.body;
    if (!maxWorkload || maxWorkload < 1) {
      return res.status(400).json({ message: "Maximum workload must be at least 1" });
    }
    const setting = await Settings.findOneAndUpdate(
      { key: "maxWorkload" },
      { value: maxWorkload },
      { upsert: true, new: true }
    );
    res.json({ maxWorkload: setting.value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;