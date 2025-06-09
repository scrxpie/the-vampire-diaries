const mongoose = require('mongoose');

const weeklySchema = new mongoose.Schema({
  _id: String, // Kullanıcı ID'si
  words: { type: Number, default: 0 }
});

module.exports = mongoose.model('WeeklyWords', weeklySchema);
