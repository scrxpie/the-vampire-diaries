const Partner = require('../models/Partner');
const { MessageEmbed } = require('discord.js');

module.exports = async (message) => {
    if (message.author.bot || !message.guild) return;

    // Partner kanalı kontrolü (istersen kaldırabilirsin)
    const allowedChannelID = '1327625994411970560'; // örnek: '123456789012345678'
    if (message.channel.id !== allowedChannelID) return;

    // Mesajda discord.gg linki var mı?
    const linkRegex = /(https?:\/\/)?(www\.)?(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+/gi;
    const foundLinks = message.content.match(linkRegex);
    if (!foundLinks) return;

    const userID = message.author.id;
    let data = await Partner.findOne({ userID });
    if (!data) data = new Partner({ userID });

    // Sunucu adı tahmini (düz yazılardan çıkarılabilir, ama şimdilik link göster)
    const serverName = foundLinks[0] || "Bilinmeyen Sunucu";

    data.logs.push({ serverName });
    data.daily += 1;
    data.weekly += 1;
    data.monthly += 1;
    data.total += 1;
    await data.save();

    // Embed mesaj
    const embed = new MessageEmbed()
        .setAuthor("Partner Tamamlandı", message.guild.iconURL({ dynamic: true }))
        .setDescription(`Partner Yapılan Sunucu: [Link](${serverName})\n\n✨ <@${userID}> istatistiklerin güncellendi:`)
        .addField("• Günlük", `${data.daily}`, true)
        .addField("• Haftalık", `${data.weekly}`, true)
        .addField("• Aylık", `${data.monthly}`, true)
        .addField("• Toplam", `${data.total}`, true)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        

    message.channel.send({ embeds: [embed] });
};
