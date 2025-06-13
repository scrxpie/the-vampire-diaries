const mongoose = require('mongoose');

const allowedChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['channel', 'category'], required: true }
});

module.exports = mongoose.model('AllowedChannel', allowedChannelSchema);
