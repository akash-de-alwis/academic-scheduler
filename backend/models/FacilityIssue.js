const mongoose = require('mongoose');

const facilityIssueSchema = new mongoose.Schema({
  facilityType: {
    type: String,
    required: true,
    enum: ['Lecturer Hall', 'Laboratory', 'Meeting Room']
  },
  department: {
    type: String,
    required: true,
    enum: ['Computer Faculty', 'Engineer Faculty', 'Business Faculty']
  },
  roomId: {
    type: String,
    required: true
  },
  issues: [{
    type: String,
    required: true
  }],
  description: { // Added for miscellaneous issues
    type: String,
    default: ""
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Resolved'] // Simplified to only Pending and Resolved
  }
});

module.exports = mongoose.model('FacilityIssue', facilityIssueSchema);