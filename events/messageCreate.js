const kelime = require('../komutlar/kelime');
const hkelime = require('../komutlar/hkelime');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Her iki trackWords fonksiyonunu çağır
    await Promise.all([
      kelime.messageCreate(message),
      hkelime.messageCreate(message)
    ]);
  }
};
