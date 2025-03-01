const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');

// Create allocation
router.post('/', async (req, res) => {
    try {
        const allocation = new Allocation(req.body);
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
        if (!updatedAllocation) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        res.json(updatedAllocation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete allocation
router.delete('/:id', async (req, res) => {
    try {
        const deletedAllocation = await Allocation.findByIdAndDelete(req.params.id);
        if (!deletedAllocation) {
            return res.status(404).json({ error: 'Allocation not found' });
        }
        res.json({ message: 'Allocation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;