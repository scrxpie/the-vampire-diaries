const WeeklyWords = require('../models/WeeklyWords'); // Yolunu kendine göre ayarla

module.exports = {
    name: 'hkelimeekle',
    description: 'Belirtilen kullanıcıya haftalık kelime ekler.',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok!');
        }

        const mentionedUser = message.mentions.users.first();
        if (!mentionedUser) {
            return message.reply('Lütfen bir kullanıcı etiketleyin.');
        }

        const userId = mentionedUser.id;
        const username = mentionedUser.username;

        const amount = parseInt(args[1], 10);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Lütfen geçerli bir miktar girin.');
        }

        try {
            const updatedUser = await WeeklyWords.findOneAndUpdate(
                { _id: userId }, // Doğru alan burası
                { $inc: { words: amount } },
                { upsert: true, new: true }
            );

            message.reply({
                embeds: [{
                    color: 0xffffff,
                    title: 'Kelime Eklendi',
                    description: `${username} adlı kullanıcıya **+${amount}** kelime eklendi.\nYeni toplam: **${updatedUser.words}**`,
                    footer: { text: '༒ | Kelime sistemi' },
                    timestamp: new Date()
                }]
            });
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            return message.reply('Veritabanı işlemi sırasında bir hata oluştu.');
        }
    }
};
