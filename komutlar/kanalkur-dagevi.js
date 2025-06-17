const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'kanalkur-dağevi',
    description: 'Belirtilen türde dağ evi kanalı oluşturur.',
    async execute(message, args) {
        // Sunucuda olup olmadığını kontrol et
        if (!message.guild) {
            return message.reply("Bu komut yalnızca sunucularda çalışabilir.");
        }

        // Sadece belirli bir sunucuda çalışması için
        const allowedGuildId = '1368538991569272912';
        if (message.guild.id !== allowedGuildId) {
            return message.reply("Bu komut yalnızca belirli bir sunucuda çalışabilir.");
        }

        // Kullanıcıda kanal oluşturma yetkisi var mı kontrol et
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("Kanalları yönetme izniniz yok.");
        }

        // Kullanıcının ev ismini belirtip belirtmediğini kontrol et
        const evIsmi = args.join(" ");
        if (!evIsmi) {
            return message.reply("Lütfen geçerli bir ev ismi girin.");
        }

        // Kategori ID
        const kategoriId = '1384570189433274499';
        const kategori = message.guild.channels.cache.get(kategoriId);
        if (!kategori) {
            return message.reply("Belirtilen kategori bulunamadı.");
        }

        try {
            // Kanal adı ve açıklama
            const kanalAdi = `『🏡』${evIsmi.replace(/\s+/g, '-').toLowerCase()}-dağ-evi`;

            const kanal = await message.guild.channels.create(kanalAdi, {
                type: 'GUILD_TEXT',
                parent: kategori.id,
                topic: 'Dağ Evi'
            });

            // Alt başlıklar (threadler)
            const altBasliklar = [
                "Oda", "Oda", "Oda",
                "Merdiven", "Koridor",
                "Mutfak", "Salon",
                "Ön Bahçe", "Arka Bahçe"
            ];

            for (const baslik of altBasliklar) {
                const thread = await kanal.threads.create({
                    name: baslik,
                    autoArchiveDuration: 60,
                    reason: `Alt başlık: ${baslik}`,
                });

                await thread.send(`**${baslik}**`);
            }

            message.reply(`Dağ evi ve alt başlıklar başarıyla oluşturuldu: **${evIsmi}**`);
        } catch (error) {
            console.error(error);
            message.reply("Bir hata oluştu, lütfen tekrar deneyin.");
        }
    }
};
