const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const { v4: uuidv4 } = require('uuid');

// Create allocation
router.post('/', async (req, res) => {
    try {
        const allocation = new Allocation({
            allocationId: uuidv4(), // Auto-generate ID
            ...req.body
        });
        await allocation.save();
        res.status(201).json(allocation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all allocations
router.get('/', async (req, res) => {
    try {
        const allocations = await Allocation.find();
        res.json(allocations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update allocation
router.put('/:id', async (req, res) => {
    try {
        const updatedAllocation = await Allocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAllocation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete allocation
router.delete('/:id', async (req, res) => {
    try {
        await Allocation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Allocation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;