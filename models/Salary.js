const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },  // benzersiz ve zorunlu
  lastClaimed: { type: Date, default: null },
  salaryBlocked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Salary', salarySchema);
