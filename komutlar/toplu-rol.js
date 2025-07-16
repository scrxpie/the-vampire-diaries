const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'toplu-rolal',
    description: 'Etiketlenen roldeki herkesten o rolü alır.',
    usage: '.toplu-rolal @rol',
    async execute(message, args, client) {
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member || !member.permissions.has('MANAGE_ROLES')) {
            return message.reply('Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.');
        }

        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('Lütfen bir rol etiketle. Örn: `.toplu-rolal @rol`');
        }

        if (!message.guild.me.permissions.has('MANAGE_ROLES')) {
            return message.reply('Benim `Rolleri Yönet` yetkim yok.');
        }

        if (message.guild.me.roles.highest.position <= role.position) {
            return message.reply('Bu rol benden daha yüksek veya eşit. Kaldıramam.');
        }

        // Tüm üyeleri fetchle ve o role sahip olanları filtrele
        await message.guild.members.fetch(); // herkes çekilir
        const membersWithRole = message.guild.members.cache.filter(m => m.roles.cache.has(role.id));

        if (membersWithRole.size === 0) {
            return message.reply('Bu rolde hiç üye yok.');
        }

        const confirmMsg = await message.channel.send(`Bu rolde toplam **${membersWithRole.size}** kişi var. Hepsinden \`${role.name}\` rolünü kaldırmak istiyor musun? (evet / hayır)`);

        const filter = m => m.author.id === message.author.id;
        try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
            const response = collected.first().content.toLowerCase();

            if (response !== 'evet') {
                return message.channel.send('❌ İşlem iptal edildi.');
            }
        } catch (err) {
            return message.channel.send('⏰ Süre doldu. İşlem iptal edildi.');
        }

        let success = 0;
        let failed = 0;

        for (const member of membersWithRole.values()) {
            try {
                await member.roles.remove(role);
                success++;
            } catch (err) {
                failed++;
            }
        }

        const embed = new MessageEmbed()
            .setTitle('Toplu Rol Kaldırma Tamamlandı')
            .setDescription(`✅ Başarıyla ${success} kişiden rol alındı.\n❌ Başarısız: ${failed}`)
            

        message.channel.send({ embeds: [embed] });
    }
};
