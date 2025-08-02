const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words'); // model yolu yapına göre düzenle

module.exports = {
  name: 'kelimeekle',
  description: 'Bir kullanıcıya belirli miktarda kelime ekler.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('❌ Bu komutu kullanmak için yönetici yetkisine sahip olmanız gerekiyor.');
    }

    if (args.length < 2) {
      return message.reply('❌ Lütfen bir kullanıcı ve eklemek istediğiniz kelime miktarını belirtin. Örnek: `.kelimeekle @kullanıcı 100`');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('❌ Geçerli bir kullanıcı belirtmelisiniz.');
    }

    const wordAmount = parseInt(args[1], 10);
    if (isNaN(wordAmount) || wordAmount <= 0) {
      return message.reply('❌ Lütfen geçerli bir kelime miktarı girin.');
    }

    try {
      const userId = user.id;

      // Mevcut kayıt var mı kontrol et
      let wordData = await Words.findById(userId);

      if (!wordData) {
        // Yeni kullanıcı oluştur
        wordData = new Words({
          _id: userId,
          words: wordAmount,
          weeklyWords: wordAmount,
          dailyWords: wordAmount,
          lastUpdate: new Date()
        });
      } else {
        // Mevcut kullanıcıya kelime ekle
        wordData.words += wordAmount;
        wordData.weeklyWords += wordAmount;
        wordData.dailyWords += wordAmount;
        wordData.lastUpdate = new Date();
      }

      await wordData.save();

      const embed = new MessageEmbed()
        .setColor('BLUE')
        .setTitle('✅ Kelime Ekleme Başarılı')
        .setDescription(`${user.username} kullanıcısına **${wordAmount} kelime** eklendi.`)
        .setFooter('Kelime istatistiği güncellendi.')
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('Kelime ekleme hatası:', err);
      return message.reply('❌ Bir hata oluştu, lütfen tekrar deneyin.');
    }
  }
};
