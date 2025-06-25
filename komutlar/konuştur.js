module.exports = {
    name: 'konuştur',
    description: 'Botun belirttiğiniz mesajı yazmasını sağlar.',
    execute(message, args) {
        if (!message.member.permissions.has("ADMINISTRATOR")) {
            return message.reply("Bu komutu kullanmak için yeterli yetkiniz yok.");
        }

        const metin = args.join(' ');

        if (!metin) {
            return message.reply('Lütfen bir mesaj yazın! Örnek kullanım: `.konuştur selam`');
        }

        // Kullanıcının komut mesajını sil
        message.delete().catch(err => {
            console.error("Mesaj silinemedi:", err);
        });

        // Botun mesajı göndermesi
        message.channel.send(metin);
    },
};
