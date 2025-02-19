import express from "express";
import Lecturer from "../models/Lecturer.js";

const router = express.Router();

// ✅ Add New Lecturer
router.post("/", async (req, res) => {
  try {
    const newLecturer = new Lecturer(req.body);
    await newLecturer.save();
    res.status(201).json(newLecturer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Lecturers
router.get("/", async (req, res) => {
  try {
    const lecturers = await Lecturer.find();
    res.json(lecturers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Lecturer
router.delete("/:id", async (req, res) => {
  try {
    await Lecturer.findByIdAndDelete(req.params.id);
    res.json({ message: "Lecturer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
