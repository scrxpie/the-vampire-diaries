const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  _id: String, // Discord kullanıcı ID'si
  words: { type: Number, default: 0 },            // Toplam kelime sayısı
  weeklyWords: { type: Number, default: 0 },      // Haftalık kelime sayısı
  dailyWords: { type: Number, default: 0 },       // Günlük kelime sayısı
  longestEmote: { type: Number, default: 0 },     // En uzun RP mesajı (bir mesajda en çok kelime)
  lastUpdate: { type: Date, default: Date.now }   // En son güncelleme (günlük/haftalık reset için)
});

module.exports = mongoose.model('Words', wordSchema);
