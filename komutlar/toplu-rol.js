const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'toplu-rolal',
    description: 'Belirtilen roldeki herkesten rolü alır.',
    usage: '.toplu-rolal @rol',
    async execute(client, message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısın.');
        }

        // Rol etiketlenmiş mi?
        const role = message.mentions.roles.first();
        if (!role) {
            return message.reply('Lütfen bir rol etiketle.');
        }

        // Botun yetkisi yeterli mi?
        if (message.guild.me.roles.highest.position <= role.position) {
            return message.reply('Bu rol benden daha yüksek veya eşit, kaldıramam.');
        }

        const membersWithRole = role.members;

        if (membersWithRole.size === 0) {
            return message.reply('Bu rolde hiç üye yok.');
        }

        // Onay mesajı
        const confirmMsg = await message.channel.send(`> ${membersWithRole.size} üyeden \`${role.name}\` rolünü kaldırmak istediğine emin misin? (evet/hayır)`);

        // Mesaj dinleyici
        const filter = m => m.author.id === message.author.id && ['evet', 'hayır'].includes(m.content.toLowerCase());
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] }).catch(() => {});

        if (!collected || collected.first().content.toLowerCase() === 'hayır') {
            return message.channel.send('İşlem iptal edildi.');
        }

        let success = 0;
        let failed = 0;

        // Rolü kaldır
        for (const member of membersWithRole.values()) {
            try {
                await member.roles.remove(role);
                success++;
            } catch (err) {
                failed++;
            }
        }

        // Sonuç mesajı
        const embed = new MessageEmbed()
            .setTitle('Toplu Rol Alma')
            .setDescription(`✅ Başarıyla ${success} kişiden rol alındı.\n❌ Başarısız: ${failed}`)
            
        message.channel.send({ embeds: [embed] });
    }
};
