const { MessageEmbed } = require('discord.js');
const WeeklyWords = require('../models/WeeklyWords'); // model yolu uygun şekilde ayarlanmalı
const fs = require('fs');

// Haftalık kelime sayımını takip eden fonksiyon
async function trackWords(message) {
    if (message.author.bot) return;

    let channelId = message.channel.id;

    // Eğer mesaj bir thread içinde ise, parent kanalını kontrol et
    if (message.channel.isThread()) {
        channelId = message.channel.parentId;
    }

    // Kanal ID'lerini dosyadan oku
    let allowedChannels;
    try {
        allowedChannels = JSON.parse(await fs.promises.readFile('./data/kanalid.json', 'utf8'));
        allowedChannels = allowedChannels.allowedChannels;
    } catch (error) {
        console.error('Kanal ID\'leri okunamadı:', error);
        return;
    }

    if (!Array.isArray(allowedChannels) || !allowedChannels.includes(channelId)) return;

    const userId = message.author.id;
    const content = message.content.trim();
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    if (wordCount === 0) return;

    // MongoDB'den kullanıcı verisini al veya oluştur
    let weeklyData = await WeeklyWords.findById(userId);
    if (!weeklyData) {
        weeklyData = new WeeklyWords({
            _id: userId,
            words: wordCount
        });
    } else {
        weeklyData.words += wordCount;
    }

    try {
        await weeklyData.save();
        console.log(`Kullanıcı ${message.author.username} (${userId}) ${wordCount} kelime yazdı. Haftalık: ${weeklyData.words}`);
    } catch (error) {
        console.error('Veritabanına yazılırken hata oluştu:', error);
    }
}

// Haftalık kelime sayısını gösterme fonksiyonu
async function showWeeklyWords(message) {
    let userId = message.author.id;
    let username = message.author.username;

    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
        userId = mentionedUser.id;
        username = mentionedUser.username;
    }

    let weeklyData;
    try {
        weeklyData = await WeeklyWords.findById(userId);
    } catch (error) {
        console.error('MongoDB verisi okunamadı:', error);
        return message.reply('Haftalık kelime veritabanı okunurken bir hata oluştu.');
    }

    const totalWeeklyWords = weeklyData?.words || 0;

    const embed = new MessageEmbed()
        .setColor('#ffffff')
        .setTitle('༒ Haftalık Kelime Sayısı')
        .setDescription(`${username} adlı kullanıcının haftalık kelime sayısı: **${totalWeeklyWords}**`)
        .setFooter({ text: '༒ | Kelime sistemi' })
        .setTimestamp()
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    message.reply({ embeds: [embed] });
}

// messageCreate eventinde kelime sayma işlemi
module.exports = {
    name: 'hkelime',
    description: 'Kullanıcının haftalık kelime sayısını gösterir.',
    execute(message) {
        showWeeklyWords(message);
    },
    messageCreate: async (message) => {
        await trackWords(message);
    }
};
