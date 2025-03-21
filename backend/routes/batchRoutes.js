const express = require("express");
const Batch = require("../models/Batch");

const router = express.Router();

// GET all batches
router.get("/", async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batches: " + error.message });
  }
});

// POST a new batch
router.post("/", async (req, res) => {
  try {
    // Check for existing batch with same name and intake
    const existingBatchName = await Batch.findOne({ 
      batchName: req.body.batchName,
      intake: req.body.intake
    });
    if (existingBatchName) {
      return res.status(400).json({ 
        message: "Batch already exists with this name and intake" 
      });
    }

    // Check for existing batch with same batchNo
    const existingBatchNo = await Batch.findOne({ 
      batchNo: req.body.batchNo 
    });
    if (existingBatchNo) {
      return res.status(400).json({ 
        message: "Batch ID already exists" 
      });
    }

    const batch = new Batch(req.body);
    const savedBatch = await batch.save();
    res.status(201).json(savedBatch);
  } catch (error) {
    res.status(400).json({ 
      message: "Error creating batch: " + error.message 
    });
  }
});

// PUT (Update a batch)
router.put("/:id", async (req, res) => {
  try {
    // Check for existing batch with same name and intake (excluding current batch)
    const existingBatchName = await Batch.findOne({ 
      batchName: req.body.batchName,
      intake: req.body.intake,
      _id: { $ne: req.params.id }
    });
    if (existingBatchName) {
      return res.status(400).json({ 
        message: "Batch already exists with this name and intake" 
      });
    }

    // Check for existing batch with same batchNo (excluding current batch)
    const existingBatchNo = await Batch.findOne({ 
      batchNo: req.body.batchNo,
      _id: { $ne: req.params.id }
    });
    if (existingBatchNo) {
      return res.status(400).json({ 
        message: "Batch ID already exists" 
      });
    }

    const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true 
    });
    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ 
      message: "Error updating batch: " + error.message 
    });
  }
});

// DELETE a batch
router.delete("/:id", async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);
    if (!deletedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(400).json({ 
      message: "Error deleting batch: " + error.message 
    });
  }
});

module.exports = router;