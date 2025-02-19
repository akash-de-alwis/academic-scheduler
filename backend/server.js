import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import lecturerRoutes from "./routes/lecturerRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/lecturers", lecturerRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
