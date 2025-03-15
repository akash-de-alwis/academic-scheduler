const express = require("express");
const Allocation = require("../models/Allocation");
const Lecturer = require("../models/Lecturer");
const Settings = require("../models/Settings");

const router = express.Router();

// Helper function to get max workload
const getMaxWorkload = async () => {
  const setting = await Settings.findOne({ key: "maxWorkload" });
  return setting ? setting.value : 5; // Default to 5 if not set
};

// GET all allocations
router.get("/", async (req, res) => {
  try {
    const allocations = await Allocation.find();
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new allocation
router.post("/", async (req, res) => {
  try {
    const maxWorkload = await getMaxWorkload();
    const existingBatch = await Allocation.findOne({ batchId: req.body.batchId });
    if (existingBatch) {
      return res.status(400).json({ message: "This batch is already allocated" });
    }

    const allAllocations = await Allocation.find();
    const lecturerWorkloads = {};
    for (const subject of req.body.subjects) {
      const lecturerId = subject.lecturerId;
      if (!lecturerWorkloads[lecturerId]) {
        lecturerWorkloads[lecturerId] = allAllocations.reduce((count, alloc) => {
          return count + alloc.subjects.filter(s => s.lecturerId === lecturerId).length;
        }, 0);
      }
      if (lecturerWorkloads[lecturerId] >= maxWorkload) {
        const selectedLecturer = await Lecturer.findOne({ lecturerId });
        const selectedSkills = selectedLecturer.skills;
        const allLecturers = await Lecturer.find();
        const suitableLecturer = allLecturers.find((lecturer) => {
          const currentCount = allAllocations.reduce((count, alloc) => {
            return count + alloc.subjects.filter(s => s.lecturerId === lecturer.lecturerId).length;
          }, 0);
          const commonSkills = selectedSkills.filter(skill => lecturer.skills.includes(skill));
          return currentCount < maxWorkload && commonSkills.length >= 2;
        });
        return res.status(400).json({
          message: `Lecturer ${selectedLecturer.name} is at full workload (${maxWorkload} subjects)`,
          subject: subject.subjectName,
          suggestedLecturer: suitableLecturer ? {
            name: suitableLecturer.name,
            lecturerId: suitableLecturer.lecturerId,
            skills: suitableLecturer.skills
          } : null
        });
      }
      lecturerWorkloads[lecturerId]++;
    }

    const allocation = new Allocation(req.body);
    const savedAllocation = await allocation.save();
    res.status(201).json(savedAllocation);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.batchId) {
      return res.status(400).json({ message: "This batch is already allocated" });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT (Update an allocation)
router.put("/:id", async (req, res) => {
  try {
    const maxWorkload = await getMaxWorkload();
    const existingBatch = await Allocation.findOne({
      batchId: req.body.batchId,
      _id: { $ne: req.params.id },
    });
    if (existingBatch) {
      return res.status(400).json({ message: "This batch is already allocated to another allocation" });
    }

    const allAllocations = await Allocation.find({ _id: { $ne: req.params.id } });
    const lecturerWorkloads = {};
    for (const subject of req.body.subjects) {
      const lecturerId = subject.lecturerId;
      if (!lecturerWorkloads[lecturerId]) {
        lecturerWorkloads[lecturerId] = allAllocations.reduce((count, alloc) => {
          return count + alloc.subjects.filter(s => s.lecturerId === lecturerId).length;
        }, 0);
      }
      if (lecturerWorkloads[lecturerId] >= maxWorkload) {
        const selectedLecturer = await Lecturer.findOne({ lecturerId });
        const selectedSkills = selectedLecturer.skills;
        const allLecturers = await Lecturer.find();
        const suitableLecturer = allLecturers.find((lecturer) => {
          const currentCount = allAllocations.reduce((count, alloc) => {
            return count + alloc.subjects.filter(s => s.lecturerId === lecturer.lecturerId).length;
          }, 0);
          const commonSkills = selectedSkills.filter(skill => lecturer.skills.includes(skill));
          return currentCount < maxWorkload && commonSkills.length >= 2;
        });
        return res.status(400).json({
          message: `Lecturer ${selectedLecturer.name} is at full workload (${maxWorkload} subjects)`,
          subject: subject.subjectName,
          suggestedLecturer: suitableLecturer ? {
            name: suitableLecturer.name,
            lecturerId: suitableLecturer.lecturerId,
            skills: suitableLecturer.skills
          } : null
        });
      }
      lecturerWorkloads[lecturerId]++;
    }

    const updatedAllocation = await Allocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAllocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.json(updatedAllocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an allocation
router.delete("/:id", async (req, res) => {
  try {
    const deletedAllocation = await Allocation.findByIdAndDelete(req.params.id);
    if (!deletedAllocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }
    res.json({ message: "Allocation deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;