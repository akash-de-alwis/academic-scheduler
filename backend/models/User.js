const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['Student', 'Staff'],
    required: [true, 'Role is required'],
    default: 'Student'
  },
  batch: {
    type: String,
    trim: true
  },
  currentYear: {
    type: String,
    enum: ['', '1', '2', '3', '4']
  },
  currentSemester: {
    type: String,
    enum: ['', 'Semester1', 'Semester2']
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 4
  },
  department: {
    type: String,
    enum: ['', 'Faculty of Computing', 'Faculty of Business Studies', 'Faculty of Engineering']
  },
  profilePhoto: { // Added field for profile image
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);