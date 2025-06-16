const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lastClaimed: { type: Date, default: null }
});

module.exports = mongoose.model('Salary', salarySchema);
