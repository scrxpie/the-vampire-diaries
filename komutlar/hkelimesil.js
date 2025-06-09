const WeeklyWords = require('../models/WeeklyWords'); // Yol yapına göre güncelle

module.exports = {
    name: 'hkelimesil',
    description: 'Belirtilen kullanıcının kelime sayısını siler veya azaltır.',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok!');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Lütfen bir kullanıcı etiketleyin.');
        }

        const userId = user.id;
        const amount = parseInt(args[1], 10);

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Lütfen geçerli bir miktar belirtin. Örnek: `.kelimesil @kullanıcı 500`');
        }

        try {
            let userData = await WeeklyWords.findById(userId);

            if (!userData) {
                return message.reply('Belirtilen kullanıcı kelime verisinde bulunamadı!');
            }

            // Kelimeyi düşür
            userData.words = Math.max(0, userData.words - amount);

            await userData.save();

            message.reply(
                `${user.username} kullanıcısının kelime sayısından ${amount} kelime silindi. Yeni toplam: ${userData.words}`
            );
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            return message.reply('Veritabanı işlemi sırasında bir hata oluştu.');
        }
    }
};
