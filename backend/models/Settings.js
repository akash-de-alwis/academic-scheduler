const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

module.exports = mongoose.model('Settings', SettingsSchema);