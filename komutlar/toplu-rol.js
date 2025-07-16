const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'toplu-rolal',
    description: 'Etiketlenen roldeki herkesten o rolü alır.',
    usage: '.toplu-rolal @rol',
    async execute(message, args, client) {
        // Kullanıcının yetkisi var mı?
        const member = await message.guild.members.fetch(message.author.id);
        if (!member.permissions.has('MANAGE_ROLES')) {
            return message.reply('Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.');
        }

        // Rol etiketlenmiş mi?
        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('Lütfen bir rol etiketle. Örn: `.toplu-rolal @rol`');
        }

        // Botun yetkisi yeterli mi?
        if (!message.guild.me.permissions.has('MANAGE_ROLES')) {
            return message.reply('Benim `Rolleri Yönet` yetkim yok.');
        }

        if (message.guild.me.roles.highest.position <= role.position) {
            return message.reply('Bu rol benden daha yüksek veya eşit. Kaldıramam.');
        }

        // O roldeki üyeleri al
        const membersWithRole = role.members;

        if (membersWithRole.size === 0) {
            return message.reply('Bu rolde hiç üye yok.');
        }

        // Onay al
        const confirmMsg = await message.channel.send(`Bu rolde toplam **${membersWithRole.size}** kişi var. Hepsinden \`${role.name}\` rolünü kaldırmak istiyor musun? (evet / hayır)`);

        const filter = m => m.author.id === message.author.id && ['evet', 'hayır'].includes(m.content.toLowerCase());
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 }).catch(() => {});

        if (!collected || collected.first().content.toLowerCase() !== 'evet') {
            return message.channel.send('❌ İşlem iptal edildi.');
        }

        // Rolü kaldırma işlemi
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

        // Bilgilendirme
        const embed = new MessageEmbed()
            .setTitle('Toplu Rol Kaldırma Tamamlandı')
            .setDescription(`✅ Başarıyla ${success} kişiden rol alındı.\n❌ Başarısız: ${failed}`)
            

        message.channel.send({ embeds: [embed] });
    }
};
