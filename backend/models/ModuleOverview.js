// models/ModuleOverview.js
const mongoose = require("mongoose");

const moduleOverviewSchema = new mongoose.Schema({
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject", 
    required: true 
  },
  description: { 
    type: String, 
    required: true, 
    minlength: 10,
    maxlength: 1000 
  },
  labSessionCount: { 
    type: Number, 
    required: true, 
    min: 0,
    max: 50 
  },
  vivaSessionCount: { 
    type: Number, 
    required: true, 
    min: 0,
    max: 20 
  },
  moduleSessionCount: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 100 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("ModuleOverview", moduleOverviewSchema);