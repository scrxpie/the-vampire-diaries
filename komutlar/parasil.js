const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance'); // Model dosya yolunu kendi yapına göre düzenle

module.exports = {
  name: "parasil",
  description: "Belirli bir kullanıcıdan toplam bakiyeden para siler (cüzdan ve banka dahil).",
  async execute(message, args) {
    // Yetki kontrolü
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply("Bu komutu kullanmak için yetkiniz yok.");
    }

    // Argüman kontrolü
    if (args.length < 2) {
      return message.reply("Lütfen silinecek miktarı ve kullanıcıyı belirtin. Örnek: `!parasil @kullanıcı 100`");
    }

    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply("Lütfen bir kullanıcı etiketleyin.");
    }

    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply("Geçerli bir para miktarı girin.");
    }

    const userId = targetUser.id;

    // Kullanıcı verisini veritabanından al (yoksa oluştur)
    let userData = await Balance.findById(userId);
    if (!userData) {
      userData = new Balance({
        _id: userId,
        balance: 0,
        bank: 0
      });
    }

    const totalBalance = userData.balance + userData.bank;

    if (totalBalance < amount) {
      return message.reply(
        `${targetUser.username} adlı kullanıcının yeterli parası yok. Mevcut toplam: ${totalBalance}`
      );
    }

    // Parayı sil
    let remaining = amount;

    if (userData.balance >= remaining) {
      userData.balance -= remaining;
      remaining = 0;
    } else {
      remaining -= userData.balance;
      userData.balance = 0;
    }

    if (remaining > 0) {
      userData.bank -= remaining;
    }

    // Veriyi kaydet
    await userData.save();

    // Embed mesajı gönder
    const embed = new MessageEmbed()
      .setDescription(`${targetUser.username} adlı kullanıcıdan toplam **${amount}** para silindi.`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `${amount} para silindi.` })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
