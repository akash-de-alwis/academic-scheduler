const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["Student", "Staff"],
    required: [true, "Role is required"],
    default: "Student",
  },
  // Student-specific fields (optional for staff)
  batch: {
    type: String,
    trim: true,
    default: "",
  },
  currentYear: {
    type: String,
    enum: ["", "1", "2", "3", "4"],
    default: "",
  },
  currentSemester: {
    type: String,
    enum: ["", "Semester1", "Semester2"],
    default: "",
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 4,
    default: null,
  },
  // Shared field (used by both students and staff)
  department: {
    type: String,
    enum: [
      "",
      "Faculty of Computing",
      "Faculty of Business Studies",
      "Faculty of Engineering",
    ],
    default: "",
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  // Staff-specific fields (optional for students)
  designation: {
    type: String,
    trim: true,
    default: "",
    enum: [
      "",
      "Professor",
      "Associate Professor",
      "Senior Lecturer",
      "Lecturer",
      "Assistant Lecturer",
      "Instructor",
    ],
  },
  officeHours: {
    type: String,
    trim: true,
    default: "",
  },
  officeLocation: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);