const { Permissions } = require('discord.js');

module.exports = {
    name: 'kanalkur-1+0',
    description: 'Belirtilen türde dublex kanal oluşturur.',
    async execute(message, args) {
        // Sunucuda olup olmadığını kontrol et
        if (!message.guild) {
            return message.reply("Bu komut yalnızca sunucularda çalışabilir.");
        }

        // Sunucu ID'sini kontrol et
        const allowedGuildId = '1368538991569272912';  // Verdiğiniz Guild ID
        if (message.guild.id !== allowedGuildId) {
            return message.reply("Bu komut yalnızca belirli bir sunucuda çalışabilir.");
        }

        // Kullanıcıda kanal oluşturma izni var mı kontrol et
        if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
            return message.reply("Kanalları yönetme izniniz yok.");
        }

        // Komutla gelen ev sahibi ismini al
        const evIsmi = args.join(" ");
        if (!evIsmi) {
            return message.reply("Lütfen geçerli bir ev ismi girin.");
        }

        // Kategori ID'sini burada girin
        const kategoriId = '1384569729120735232';  // Verdiğiniz Kategori ID
        const kategori = message.guild.channels.cache.get(kategoriId);
        if (!kategori) {
            return message.reply("Belirtilen kategori bulunamadı.");
        }

        try {
            // Dublex ana kanalı oluştur
            const kanalAdi = `『🏡』${evIsmi.replace(/\s+/g, '-').toLowerCase()}-Apartman`;  // Kanal adını düzenle
            const kanal = await message.guild.channels.create(kanalAdi, {
                type: 'GUILD_TEXT',
                parent: kategori.id,
            });

          
            message.reply(`1+0 Apartman başarıyla oluşturuldu: **${evIsmi}**`);
        } catch (error) {
            console.error(error);
            message.reply("Bir hata oluştu, lütfen tekrar deneyin.");
        }
    }
};
