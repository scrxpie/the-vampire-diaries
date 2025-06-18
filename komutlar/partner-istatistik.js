const { MessageEmbed } = require('discord.js');
const Partner = require('../models/Partner');

module.exports = {
    name: 'partner-istatistik',
    description: 'Kullanıcının partnerlik istatistiklerini gösterir.',
    usage: '.partner-istatistik [@kullanıcı]',
    async execute(message, args) {
        // Etiketlenen kullanıcı varsa onu al, yoksa mesajı atanı
        const user = message.mentions.users.first() || message.author;

        // Veriyi çek
        const data = await Partner.findOne({ userID: user.id });

        if (!data) {
            return message.channel.send(`📦 ${user.username} kullanıcısına ait herhangi bir partner verisi bulunamadı.`);
        }

        // Embed oluştur
        const embed = new MessageEmbed()
            .setTitle(`${user.username} Kullanıcısının Partner İstatistikleri`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addField("📅 Günlük", `${data.daily}`, true)
            .addField("📈 Haftalık", `${data.weekly}`, true)
            .addField("📆 Aylık", `${data.monthly}`, true)
            .addField("📊 Toplam", `${data.total}`, true)
            
            .setFooter({ text: `Toplam ${data.logs.length} partner geçmişi kaydı mevcut.` });

        message.channel.send({ embeds: [embed] });
    }
};
