const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');
const mongoose = require('mongoose');

const boosterLastClaimSchema = new mongoose.Schema({
    _id: String,
    lastClaim: Number
});
const BoosterLastClaim = mongoose.model('BoosterLastClaim', boosterLastClaimSchema);

module.exports = {
    name: 'bgünlük',
    description: 'Boosterlara özel günlük ödül komutu.',
    async execute(message) {
        const boosterRoleId = '1370821728778846328';
        const userId = message.author.id;

        if (!message.member.roles.cache.has(boosterRoleId)) {
            return message.reply('Bu komutu sadece booster rolüne sahip kullanıcılar kullanabilir!');
        }

        // Booster ödül zamanı kontrolü
        const now = Date.now();
        let lastClaimData = await BoosterLastClaim.findById(userId);
        const lastClaimTime = lastClaimData?.lastClaim || 0;

        if (now - lastClaimTime < 86400000) {
            const remainingTime = 86400000 - (now - lastClaimTime);
            const hours = Math.floor(remainingTime / 3600000);
            const minutes = Math.floor((remainingTime % 3600000) / 60000);
            return message.reply(`Günlük ödülünü tekrar almak için **${hours} saat ${minutes} dakika** beklemelisin.`);
        }

        // Kullanıcının bakiyesine 1000 para ekle
        let balanceData = await Balance.findById(userId);
        if (!balanceData) {
            balanceData = new Balance({ _id: userId });
        }

        balanceData.balance += 1000;
        await balanceData.save();

        // Son ödül alım zamanını güncelle
        if (!lastClaimData) {
            await BoosterLastClaim.create({ _id: userId, lastClaim: now });
        } else {
            lastClaimData.lastClaim = now;
            await lastClaimData.save();
        }

        // Embed mesaj
        const embed = new MessageEmbed()
            .setTitle(' Günlük Booster Ödülü')
            .setDescription('Tebrikler, günlük ödemenizi başarıyla aldınız!\nBooster rolüne özel **1000 para** cüzdanınıza eklendi.')
            .setColor('AQUA')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setFooter('Teşekkür ederiz!')
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
