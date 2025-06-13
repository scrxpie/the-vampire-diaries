const AllowedChannel = require('../models/AllowedChannel');

module.exports = {
    name: 'kanalekle',
    description: 'Bir kanal ekler.',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanabilmek için yönetici iznine sahip olmalısınız.');
        }

        const channel = message.mentions.channels.first();

        if (!channel) {
            return message.reply('Lütfen bir kanal belirtin.');
        }

        try {
            const existing = await AllowedChannel.findOne({ channelId: channel.id });
            if (existing) {
                return message.reply('Bu kanal zaten eklenmiş.');
            }

            await AllowedChannel.create({ channelId: channel.id });
            return message.reply(`✅ Kanal başarıyla eklendi: ${channel}`);
        } catch (err) {
            console.error('Kanal eklenirken hata oluştu:', err);
            return message.reply('Bir hata oluştu, kanal eklenemedi.');
        }
    },
};
