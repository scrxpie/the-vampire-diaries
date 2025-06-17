module.exports = {
    name: 'kanalkur-villa',
    description: 'Belirtilen türde dublex kanal oluşturur.',
    async execute(message, args) {
        // Sunucuda olup olmadığını kontrol et
        if (!message.guild) {
            return message.reply("Bu komut yalnızca sunucularda çalışabilir.");
        }

        // Sadece belirli sunucuda çalışsın
        const allowedGuildId = '1368538991569272912';
        if (message.guild.id !== allowedGuildId) {
            return message.reply("Bu komut yalnızca belirli bir sunucuda çalışabilir.");
        }

        // Kanal oluşturma izni kontrolü
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("Kanalları yönetme izniniz yok.");
        }

        // Ev ismini al
        const evIsmi = args.join(" ");
        if (!evIsmi) {
            return message.reply("Lütfen geçerli bir ev ismi girin.");
        }

        // Kategori kontrolü
        const kategoriId = '1384570115323854858';
        const kategori = message.guild.channels.cache.get(kategoriId);
        if (!kategori) {
            return message.reply("Belirtilen kategori bulunamadı.");
        }

        try {
            // Ana kanal adı
            const kanalAdi = `『🏡』${evIsmi.replace(/\s+/g, '-').toLowerCase()}-dublex-evi`;

            // Kanal oluştur
            const kanal = await message.guild.channels.create(kanalAdi, {
                type: 'GUILD_TEXT',
                parent: kategori.id,
                topic: 'Villa' // Açıklama
            });

            // Alt başlıklar
            const altBasliklar = [
                "Oda", "Oda", "Oda", "Oda", "Oda",
                "Merdiven", "Koridor", "Mutfak",
                "Salon", "Ön Bahçe", "Arka Bahçe"
            ];

            for (const baslik of altBasliklar) {
                const thread = await kanal.threads.create({
                    name: baslik,
                    autoArchiveDuration: 60,
                    reason: `Alt başlık: ${baslik}`,
                });

                await thread.send(`**${baslik}**`);
            }

            message.reply(`🏡 Dublex villa evi ve alt başlıklar başarıyla oluşturuldu: **${evIsmi}**`);
        } catch (error) {
            console.error(error);
            message.reply("Bir hata oluştu, lütfen tekrar deneyin.");
        }
    }
};
