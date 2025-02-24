const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const batchRoutes = require("./routes/batchRoutes");
const lecturerRoutes = require("./routes/lecturers"); 
const roomRoutes = require("./routes/roomRoutes");

const timetableRoutes = require("./routes/timetableRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/batches", batchRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/timetable", timetableRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
