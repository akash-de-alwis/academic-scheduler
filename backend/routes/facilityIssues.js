const express = require('express');
const router = express.Router();
const FacilityIssue = require('../models/FacilityIssue');

// Get all facility issues
router.get('/', async (req, res) => {
  try {
    const issues = await FacilityIssue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new facility issue
router.post('/', async (req, res) => {
  const issue = new FacilityIssue({
    facilityType: req.body.facilityType,
    department: req.body.department,
    roomId: req.body.roomId,
    issues: req.body.issues,
    description: req.body.description,
    reportedDate: req.body.reportedDate,
    status: req.body.status
  });

  try {
    const newIssue = await issue.save();
    res.status(201).json(newIssue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update facility issue status
router.put('/:id', async (req, res) => {
  try {
    const issue = await FacilityIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = req.body.status;
    const updatedIssue = await issue.save();
    res.json(updatedIssue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;