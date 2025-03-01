const mongoose = require('mongoose');

const AllocationSchema = new mongoose.Schema({
    allocationId: { type: String, unique: true, required: true },
    subjects: [{
        subjectName: { type: String, required: true },
        subjectId: { type: String, required: true }
    }],
    batchName: { type: String, required: true },
    batchId: { type: String, required: true },
    lecturerName: { type: String, required: true },
    lecturerId: { type: String, required: true }
});

module.exports = mongoose.model('Allocation', AllocationSchema);