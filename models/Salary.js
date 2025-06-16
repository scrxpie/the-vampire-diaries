const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  lastClaimed: { type: Date, default: null },
  salaryBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Salary', salarySchema);
