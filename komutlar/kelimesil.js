const Words = require('../models/Words'); // Modelin doğru yolunu belirt

module.exports = {
    name: 'kelimesil',
    description: 'Belirtilen kullanıcının kelime sayısını siler veya azaltır.',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanmak için yetkiniz yok!');
        }

        // Kullanıcıyı alma
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Lütfen bir kullanıcı etiketleyin. Örnek: `.kelimesil @kullanıcı 500`');
        }

        const amount = parseInt(args[1], 10);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Lütfen geçerli bir miktar belirtin. Örnek: `.kelimesil @kullanıcı 500`');
        }

        // Kullanıcının verisini MongoDB'den al
        const wordData = await Words.findById(user.id);
        if (!wordData) {
            return message.reply('Belirtilen kullanıcı veritabanında bulunamadı!');
        }

        // Kelime sayısını azalt
        wordData.words -= amount;
        if (wordData.words < 0) wordData.words = 0;

        // Güncellemeyi kaydet
        await wordData.save();

        message.reply(`${user.username} kullanıcısının kelime sayısından ${amount} kelime silindi. Yeni toplam: ${wordData.words}`);
    },
};
