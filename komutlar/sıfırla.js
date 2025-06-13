const WeeklyWords = require('../models/WeeklyWords'); // Yolunu ayarla

module.exports = {
  name: 'sıfırla',
  description: 'Haftalık kelime verilerini sıfırlar.',
  async execute(message) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yönetici yetkisine sahip olmalısınız.');
    }

    try {
      // Tüm weekly kelimeleri sıfırla
      await WeeklyWords.updateMany({}, { $set: { words: 0 } });

      return message.reply('Haftalık kelime verileri başarıyla sıfırlandı.');
    } catch (error) {
      console.error('Veri sıfırlama hatası:', error);
      return message.reply('Veri sıfırlama sırasında bir hata oluştu.');
    }
  },
};
