const { MessageEmbed } = require('discord.js');
const Partner = require('../models/Partner');

module.exports = {
    name: 'partner-sıralama',
    description: 'En çok partner yapanları sıralar.',
    usage: '.partner-sıralama [günlük|haftalık|aylık|toplam]',
    async execute(message, args) {
        // Sıralama türünü al
        const type = args[0]?.toLowerCase() || 'toplam';
        let sortField;

        switch (type) {
            case 'günlük':
                sortField = 'daily';
                break;
            case 'haftalık':
                sortField = 'weekly';
                break;
            case 'aylık':
                sortField = 'monthly';
                break;
            case 'toplam':
            default:
                sortField = 'total';
                break;
        }

        // Verileri çek ve sırala
        const topUsers = await Partner.find().sort({ [sortField]: -1 }).limit(10);

        if (!topUsers.length) {
            return message.channel.send("⛔ Hiç partner verisi bulunamadı.");
        }

        const embed = new MessageEmbed()
            .setTitle(` En Çok Partner Yapanlar (${type.charAt(0).toUpperCase() + type.slice(1)})`)
            

        let rank = 1;
        for (const userData of topUsers) {
            const user = await message.client.users.fetch(userData.userID).catch(() => null);
            const username = user ? user.tag : `Bilinmeyen Kullanıcı (${userData.userID})`;
            embed.addField(`#${rank} • ${username}`, `${sortField} partner: **${userData[sortField]}**`, false);
            rank++;
        }

        message.channel.send({ embeds: [embed] });
    }
};
