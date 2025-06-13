const mongoose = require('mongoose');

const allowedChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true }
});

module.exports = mongoose.model('AllowedChannel', allowedChannelSchema);
