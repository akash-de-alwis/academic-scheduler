const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { 
    type: String, 
    required: [true, "Batch name is required"],
    trim: true,
    unique: false 
  },
  intake: { 
    type: String, 
    enum: {
      values: ["Regular", "Main"],
      message: "Intake must be either 'Regular' or 'Main'"
    },
    required: [true, "Intake is required"], 
    default: "Regular" 
  },
  batchNo: { 
    type: String, 
    required: [true, "Batch number is required"],
    unique: [true, "Batch number must be unique"],
    trim: true,
    match: [/^BT\d{3}$/, "Batch number must follow format BT followed by 3 digits (e.g., BT001)"]
  },
  year: { 
    type: Number, 
    required: [true, "Year is required"],
    min: [1, "Year must be at least 1"],
    max: [4, "Year cannot exceed 4"]
  },
  semester: { 
    type: String, 
    enum: {
      values: ["Semester1", "Semester2"],
      message: "Semester must be either 'Semester1' or 'Semester2'"
    },
    required: [true, "Semester is required"],
    default: "Semester1" 
  },
  department: { 
    type: String, 
    enum: {
      values: ["Information Technology", "Engineering", "Business Studies"],
      message: "Department must be 'Information Technology', 'Engineering', or 'Business Studies'"
    },
    required: [true, "Department is required"], 
    default: "Information Technology" 
  },
  studentCount: { 
    type: Number, 
    required: [true, "Student count is required"],
    min: [1, "Student count must be at least 1"]
  },
  startDate: { 
    type: Date, 
    required: [true, "Start date is required"]
  },
  endDate: { 
    type: Date, 
    required: [true, "End date is required"]
  },
  scheduleType: { 
    type: String, 
    enum: {
      values: ["Weekdays", "Weekend"],
      message: "Schedule type must be either 'Weekdays' or 'Weekend'"
    },
    required: [true, "Schedule type is required"],
    default: "Weekdays"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique batchName and intake combination
batchSchema.index({ batchName: 1, intake: 1 }, { 
  unique: true,
  name: "unique_batchName_intake"
});

// Pre-validate hook for document creation or full updates
batchSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate) {
    if (new Date(this.startDate) >= new Date(this.endDate)) {
      this.invalidate('endDate', 'End date must be after start date');
    }
  }
  next();
});

// Pre-update hook for partial updates
batchSchema.pre(['updateOne', 'findOneAndUpdate'], async function(next) {
  try {
    const update = this.getUpdate();
    const Model = this.model; // Get the model from the schema context

    const doc = await Model.findById(this.getQuery()._id);
    if (!doc) {
      return next(new Error('Batch not found'));
    }

    // Handle $set operator or direct update
    const startDate = update.$set?.startDate || update.startDate || doc.startDate;
    const endDate = update.$set?.endDate || update.endDate || doc.endDate;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      const error = new mongoose.Error.ValidationError();
      error.errors.endDate = new mongoose.Error.ValidatorError({
        message: 'End date must be after start date',
        path: 'endDate',
        value: endDate
      });
      return next(error);
    }
    next();
  } catch (err) {
    next(new Error('Error validating dates: ' + err.message));
  }
});

// Create and export the model after all middleware is defined
module.exports = mongoose.model("Batch", batchSchema);