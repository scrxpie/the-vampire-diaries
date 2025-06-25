module.exports = {
    name: 'kanalkur-ormanevi',
    description: 'Belirtilen türde müstakil kanal oluşturur.',
    async execute(message, args) {
        // Sunucuda olup olmadığını kontrol et
        if (!message.guild) {
            return message.reply("Bu komut yalnızca sunucularda çalışabilir.");
        }

        // Sunucu ID'sini kontrol et
        const allowedGuildId = '1327541284646293504';
        if (message.guild.id !== allowedGuildId) {
            return message.reply("Bu komut yalnızca belirli bir sunucuda çalışabilir.");
        }

        // Kullanıcıda kanal oluşturma izni var mı kontrol et
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("Kanalları yönetme izniniz yok.");
        }

        // Komutla gelen ev sahibi ismini al
        const evIsmi = args.join(" ");
        if (!evIsmi) {
            return message.reply("Lütfen geçerli bir ev ismi girin.");
        }

        // Kategori ID'sini burada girin
        const kategoriId = '1346124777311441050';
        const kategori = message.guild.channels.cache.get(kategoriId);
        if (!kategori) {
            return message.reply("Belirtilen kategori bulunamadı.");
        }

        try {
            // Kanal adı oluştur
            const kanalAdi = `『🏡』${evIsmi.replace(/\s+/g, '-').toLowerCase()}-orman-evi`;

            // Kanalı oluştur
            const kanal = await message.guild.channels.create(kanalAdi, {
                type: 'GUILD_TEXT',
                parent: kategori.id,
                topic: 'Orman Evi', // Açıklamaya ek
            });

            // Alt başlıklar
            const altBasliklar = [
                "Oda", "Oda", "Oda",
                "Merdiven", "Koridor",
                "Mutfak", "Salon",
                "Ön Bahçe", "Arka Bahçe"
            ];

            // Thread'leri oluştur
            for (const baslik of altBasliklar) {
                const thread = await kanal.threads.create({
                    name: baslik,
                    autoArchiveDuration: 60,
                    reason: `Alt başlık: ${baslik}`,
                });

                await thread.send(`**${baslik}**`);
            }

            message.reply(`Müstakil ev ve alt başlıklar başarıyla oluşturuldu: **${evIsmi}**`);
        } catch (error) {
            console.error(error);
            message.reply("Bir hata oluştu, lütfen tekrar deneyin.");
        }
    }
};
