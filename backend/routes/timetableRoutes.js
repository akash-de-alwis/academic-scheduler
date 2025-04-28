const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
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
    console.error("Error creating schedule:", error);
    res.status(400).json({ error: error.message });
  }
});

// Read all schedules
router.get("/", async (req, res) => {
  try {
    const schedules = await Timetable.find();
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
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
    console.error("Error updating schedule:", error);
    res.status(400).json({ error: error.message });
  }
});

// Delete schedule
router.delete("/:id", async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete schedules by batch
router.delete("/batch", async (req, res) => {
  try {
    const { batch } = req.body;
    console.log("Received batch for deletion:", batch);
    if (!batch) {
      return res.status(400).json({ error: "Batch is required" });
    }
    const result = await Timetable.deleteMany({ batch });
    console.log("Deleted schedules result:", result);
    res.json({ message: `Schedules for batch ${batch} deleted successfully`, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error in delete batch route:", error);
    res.status(500).json({ error: error.message });
  }
});

// Publish timetable
router.post("/published-timetable", async (req, res) => {
  try {
    const { batch, schedules } = req.body;
    console.log("Publishing timetable for batch:", batch, "with schedules:", JSON.stringify(schedules, null, 2));
    if (!batch || !schedules) {
      return res.status(400).json({ error: "Batch and schedules are required" });
    }
    const existing = await PublishedTimetable.findOne({ batch });
    if (existing) {
      await PublishedTimetable.updateOne({ batch }, { schedules });
      console.log("Updated existing timetable for batch:", batch);
    } else {
      const newPublished = new PublishedTimetable({ batch, schedules });
      await newPublished.save();
      console.log("Saved new timetable for batch:", batch);
    }
    res.status(201).json({ message: "Timetable published successfully" });
  } catch (error) {
    console.error("Error publishing timetable:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get published timetable
router.get("/published-timetable", async (req, res) => {
  try {
    const { batch } = req.query;
    console.log("Fetching published timetable for batch:", batch);
    const timetable = await PublishedTimetable.findOne({ batch });
    res.json(timetable || {});
  } catch (error) {
    console.error("Error fetching published timetable:", error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-generate timetable for a batch
router.post("/auto-generate", async (req, res) => {
  try {
    const { batch } = req.body;
    if (!batch) return res.status(400).json({ error: "Batch is required" });

    const allocations = await Allocation.find({ batchName: batch });
    const existingTimetables = await Timetable.find({ batch });
    const rooms = await mongoose.model("Room").find({ hallType: { $ne: "Meeting Room" } });

    const timeSlots = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newSchedules = [];
    for (const allocation of allocations) {
      const subjects = allocation.subjects.map((sub) => ({
        subjectName: sub.subjectName,
        lecturer: sub.lecturerName,
        room: "",
        date: "",
        time: "",
        duration: "1",
      }));

      for (const subject of subjects) {
        let assigned = false;
        for (let i = 0; i < 7 && !assigned; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          const day = weekDays[dayIndex];

          const batchData = await mongoose.model("Batch").findOne({ batchName: batch });
          const isWeekendBatch = batchData?.scheduleType === "Weekend";
          if (isWeekendBatch && ![0, 6].includes(date.getDay())) continue;

          for (const time of timeSlots) {
            const startHour = parseInt(time.split(":")[0]);
            if (startHour < 8 || startHour > 17) continue;

            for (const room of rooms) {
              const isRoomBooked = existingTimetables.some((schedule) =>
                schedule.subjects.some(
                  (sub) =>
                    sub.room === room.LID &&
                    sub.date === date.toISOString().split("T")[0] &&
                    parseInt(sub.time.split(":")[0]) <= startHour &&
                    parseInt(sub.time.split(":")[0]) + parseInt(sub.duration || "1") > startHour
                )
              );

              if (!isRoomBooked) {
                subject.room = room.LID;
                subject.date = date.toISOString().split("T")[0];
                subject.time = time;
                assigned = true;
                break;
              }
            }
            if (assigned) break;
          }
        }
        if (!assigned) {
          return res.status(400).json({ error: `No available slot found for ${subject.subjectName}` });
        }
      }

      const newSchedule = new Timetable({
        allocationId: allocation.allocationId,
        batch,
        subjects,
      });
      newSchedules.push(newSchedule);
    }

    await Promise.all(newSchedules.map((schedule) => schedule.save()));
    res.status(201).json({ message: `Timetable for ${batch} auto-generated successfully`, schedules: newSchedules });
  } catch (error) {
    console.error("Auto-generate error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;