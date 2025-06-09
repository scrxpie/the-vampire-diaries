const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  _id: String, // Discord kullanıcı ID'si
  tur: { type: String, enum: ['Hunter', 'Human'], required: true }, // Kullanıcının türü

  hak: { type: Number, default: 0 },             // Kullanılabilir stat puanı
  verilenStat: { type: Number, default: 0 },     // Toplam harcanmış stat puanı

  guc: { type: Number, default: 0 },
  direnc: { type: Number, default: 0 },
  odak: { type: Number, default: 0 },
  irade: { type: Number, default: 0 },
  karizma: { type: Number, default: 0 },
  zeka: { type: Number, default: 0 },
  refleks: { type: Number, default: 0 },
});

module.exports = mongoose.model('Stat', statSchema);
