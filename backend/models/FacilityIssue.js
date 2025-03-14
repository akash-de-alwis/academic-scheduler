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
  description: {
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
    enum: ['Pending', 'Resolved']
  },
  urgency: { // New field
    type: String,
    required: true,
    enum: ['Urgent', 'Medium', 'Low'],
    default: 'Low'
  }
});

module.exports = mongoose.model('FacilityIssue', facilityIssueSchema);