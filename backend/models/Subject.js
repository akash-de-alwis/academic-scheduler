const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectID: { type: String, required: true, unique: true },
  credit: { type: Number, required: true },
  timeDuration: { 
    type: Number, 
    required: true,
    min: 40, 
    max: 60
  },
  department: { 
    type: String, 
    enum: ["Faculty of Computing", "Faculty of Engineering", "Faculty of Business Studies"],
    required: true
  },
  year: { 
    type: String, 
    enum: ["1 Year", "2 Year", "3 Year", "4 Year"],
    required: true
  }
});

module.exports = mongoose.model("Subject", subjectSchema);
