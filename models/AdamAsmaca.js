const mongoose = require('mongoose');

const AdamAsmacaSchema = new mongoose.Schema({
  channelId: String,
  kelime: String,
  gösterilen: [String],
  yanlışlar: [String],
  deneme: Number
});

module.exports = mongoose.model('AdamAsmaca', AdamAsmacaSchema);
