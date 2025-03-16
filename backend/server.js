const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const batchRoutes = require('./routes/batchRoutes');
const lecturerRoutes = require('./routes/lecturers');
const roomRoutes = require('./routes/roomRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const allocationRoutes = require('./routes/allocations');
const authRoutes = require('./routes/auth');
const bookingRoutes = require("./routes/bookings");
const timetableRoutes = require("./routes/timetableRoutes");
const facilityIssueRoutes = require('./routes/facilityIssues');
const settingsRoutes = require("./routes/settings");
const moduleOverviewRoutes = require('./routes/moduleOverviewRoutes');
const activityRoutes = require("./routes/activities"); // Ensure this matches the file name

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/batches', batchRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/facility-issues', facilityIssueRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/module-overviews', moduleOverviewRoutes);
app.use('/api/activities', activityRoutes); // Register the activities route

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));