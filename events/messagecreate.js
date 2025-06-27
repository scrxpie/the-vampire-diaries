const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');
const trackPartnerMessage = require('../utils/partner');

const prefix = '.';
const arcaneBotId = '437808476106784770';
const fiboBotId = '735147814878969968';
const excludedChannels = ['1327621148606988349', '1327625994411970560'];

module.exports = async (client, message) => {
    // Eğer mesaj bot'tan geldiyse veya hariç tutulan kanallardaysa işlem yapma
    if (message.author.bot || excludedChannels.includes(message.channel.id)) return;

    // 📌 PARTNER MESAJ TAKİBİ
    trackPartnerMessage(message);

    // 📌 FIBO BUMP ÖDÜLÜ
    if (
        message.author.id === fiboBotId &&
        message.content.includes('Thx for bumping our Server!')
    ) {
        const bumpedUser = message.mentions.users.first();
        if (bumpedUser) {
            await addBalance(bumpedUser.id, 100);
            const embed = new MessageEmbed()
                .setTitle('Sunucu Bump Ödülü!')
                .setDescription(`🎉 Tebrikler ${bumpedUser.username}! Sunucuyu bump'ladığın için **100$** kazandın!`)
                .setColor('#F5A623')
                .setTimestamp();
            message.channel.send({ embeds: [embed] });
        }
    }

    // 📌 ARCANE LEVEL ÖDÜLÜ
    if (
        message.author.id === arcaneBotId &&
        message.content.includes('Yeni levelin')
    ) {
        const userIdMatch = message.content.match(/<@!?(\d+)>/);
        const levelMatch = message.content.match(/Yeni levelin \*\*(\d+)\*\*/i);

        if (userIdMatch && levelMatch) {
            const userId = userIdMatch[1];
            const level = parseInt(levelMatch[1], 10);

            const arcaneRewardTable = {
                '5-10': 200,
                '10-25': 300,
                '25-200': 500,
            };

            let reward = 0;
            for (const [range, amount] of Object.entries(arcaneRewardTable)) {
                const [min, max] = range.split('-').map(Number);
                if (level >= min && level <= max) {
                    reward = amount;
                    break;
                }
            }

            if (reward > 0) {
                await addBalance(userId, reward);

                const embed = new MessageEmbed()
                    .setTitle('Arcane Seviye Ödülü!')
                    .setDescription(`Tebrikler <@${userId}>! Arcane'de seviye **${level}** oldun ve **${reward}$** kazandın!`)
                    .setColor('#00ff00')
                    .setTimestamp();
                message.channel.send({ embeds: [embed] });
            }
        }
    }

    // 📌 PREFIX KOMUTLARI (.komut şeklindeki)
    // Buraya prefix komutlar için kontrol eklenebilir
};

// 💰 MONGODB BAKİYE EKLEME FONKSİYONU
async function addBalance(userId, amount) {
    try {
        let userBalance = await Balance.findById(userId);
        if (!userBalance) {
            userBalance = new Balance({ _id: userId, balance: 0, bank: 0 });
        }

        userBalance.balance += amount;
        await userBalance.save();
    } catch (err) {
        console.error('Bakiye eklenirken hata oluştu:', err);
    }
}
