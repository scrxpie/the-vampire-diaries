module.exports = {
    name: 'kanalkur-müstakil',
    description: 'Belirtilen türde müstakil ev kanalı oluşturur.',
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("Bu komut yalnızca sunucularda çalışabilir.");
        }

        const allowedGuildId = '1327541284646293504';
        if (message.guild.id !== allowedGuildId) {
            return message.reply("Bu komut yalnızca belirli bir sunucuda çalışabilir.");
        }

        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("Kanalları yönetme izniniz yok.");
        }

        const evIsmi = args.join(" ");
        if (!evIsmi) {
            return message.reply("Lütfen geçerli bir ev ismi girin.");
        }

        const kategoriId = '1328094321211080745';
        const kategori = message.guild.channels.cache.get(kategoriId);
        if (!kategori) {
            return message.reply("Belirtilen kategori bulunamadı.");
        }

        try {
            const kanalAdi = `『🏡』${evIsmi.replace(/\s+/g, '-').toLowerCase()}-müstakil-evi`;

            const kanal = await message.guild.channels.create(kanalAdi, {
                type: 'GUILD_TEXT',
                parent: kategori.id,
                topic: 'Müstakil Ev'
            });

            const altBasliklar = [
                "Oda", "Oda", "Oda",
                "Merdiven", "Koridor",
                "Mutfak", "Salon",
                "Ön Bahçe"
            ];

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
