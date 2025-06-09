const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');

module.exports = {
  name: "paraekle",
  description: "Bir kullanıcıya para ekler.",
  async execute(message, args) {
    // Yetkili kontrolü
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("Bu komutu kullanmak için yeterli yetkiniz yok.");
    }

    // Kullanıcıyı etiketleme kontrolü
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply("Para eklemek istediğiniz kullanıcıyı etiketlemelisiniz.");
    }

    // Eklenmek istenen miktarı kontrol et
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply("Lütfen geçerli bir miktar girin.");
    }

    const userId = targetUser.id;

    // MongoDB'den kullanıcı verisini al veya oluştur
    let balanceData = await Balance.findById(userId);
    if (!balanceData) {
      balanceData = new Balance({ _id: userId });
    }

    // Parayı ekle
    balanceData.balance += amount;
    await balanceData.save();

    // Kullanıcıya başarı mesajı gönder
    const embed = new MessageEmbed()
      .setDescription(`${targetUser.username} kullanıcısına başarıyla ${amount} para eklendi.`)
      .setFooter(`${amount} para eklendi.`)
      .setTimestamp()
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

    return message.reply({ embeds: [embed] });
  }
};
