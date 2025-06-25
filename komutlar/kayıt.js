const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'kayıt',
    description: 'Bir kullanıcıyı kaydeder.',
    async execute(message, args) {
        const kayitsizRolID = '1327613823531749436'; // Kayıtsız rolü
        const uyeRolID = '1327716388726640660'; // Üye rolü
        const otoRolIDs = [
            '1327975111990579322',
            '1327975231960256596',
            '1328066390816456865',
            '1328419375937622171',
            '1365694307964551299'
        ]; // Oto roller
        const logChannelID = '1327541284646293507'; // Log kanalı ID
        const logChannel = message.guild.channels.cache.get(logChannelID);

        const target = message.mentions.members.first();
        const [isim, yas] = args.slice(1);

        if (!target || !isim || !yas) {
            return message.reply('Doğru kullanım: `.kayıt @kullanıcı İsim Yaş`');
        }

        const kayitsizRol = message.guild.roles.cache.get(kayitsizRolID);
        const uyeRol = message.guild.roles.cache.get(uyeRolID);

        if (!kayitsizRol || !uyeRol) {
            return console.error('Kayıtsız veya Üye rolü bulunamadı. Rol ID\'lerini kontrol edin.');
        }

        if (!target.roles.cache.has(kayitsizRolID)) {
            return message.reply('Bu kullanıcı Kayıtsız rolüne sahip değil. Kayıt işlemi yapılamaz.');
        }

        try {
            // 1. Adım: "Kayıtsız" rolünü kaldır
            await target.roles.remove(kayitsizRol);
            console.log(`${target.user.tag} kullanıcısından Kayıtsız rolü başarıyla kaldırıldı.`);
   // 2. Adım: "Üye" rolünü ekle
            await target.roles.add(uyeRol);
            console.log(`${target.user.tag} kullanıcısına Üye rolü başarıyla eklendi.`);

            // 3. Adım: Oto rolleri ekle
            for (const roleID of otoRolIDs) {
                const otoRol = message.guild.roles.cache.get(roleID);
                if (otoRol) {
                    await target.roles.add(otoRol);
                    console.log(`${target.user.tag} kullanıcısına oto rol ${otoRol.name} başarıyla eklendi.`);
                } else {
                    console.error(`Oto rol bulunamadı: ${roleID}`);
                }
            }

            // 4. Adım: Takma adı değiştir
            await target.setNickname(`${isim} | ${yas}`);
            console.log(`${target.user.tag} kullanıcısının takma adı başarıyla değiştirildi.`);

            // Kullanıcıya başarı mesajı gönder
            const userEmbed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setTitle('Kayıt İşlemi Tamamlandı')
                .setDescription('Bir kullanıcı başarıyla kayıt edildi.')
                .addField('Kullanıcı:', `${target.user.tag}`, true)
                .addField('İsim:', isim, true)
                .addField('Yaş:', yas, true)
                .addField('Kayıt Eden:', message.author.toString(), true)
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

message.reply({ embeds: [userEmbed] });

            // 5. Adım: Log kanalına mesaj gönder
            const logEmbed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setTitle('Aramıza Hoş Geldin!')
                .setDescription(
                  `𝘓𝘶𝘵𝘧𝘦𝘯 𝘒𝘶𝘳𝘢𝘭𝘭𝘢𝘳𝘪 𝘖𝘬𝘶 <#1327543048690864170>, 𝘒𝘦𝘯𝘥𝘪𝘯𝘦 𝘜𝘺𝘨𝘶𝘯 𝘙𝘦𝘯𝘨𝘪 𝘚𝘦𝘤 <#1327984398833811538>. 𝘙𝘰𝘭𝘦𝘗𝘭𝘢𝘺'𝘦 𝘒𝘢𝘵𝘪𝘭𝘮𝘢𝘬 𝘪𝘤𝘪𝘯 <#1327583221764067379> 𝘒𝘢𝘯𝘢𝘭𝘪𝘯𝘪 𝘖𝘬𝘶𝘥𝘶𝘬𝘵𝘢𝘯 𝘚𝘰𝘯𝘳𝘢 𝘍𝘰𝘳𝘮𝘶𝘯𝘶 <#1327714017086668890> 𝘉𝘶𝘳𝘢𝘺𝘢 𝘎𝘰𝘯𝘥𝘦𝘳.`
                )
                .addField('Kayıt Eden:', message.author.toString(), true)
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setImage('https://i.imgur.com/btr4bju.gif')
                .setFooter('Sunucumuza hoş geldiniz!', message.guild.iconURL({ dynamic: true }));

            if (logChannel) {
                logChannel.send({ content: `> ${target}`, embeds: [logEmbed] });
            } else {
                console.error('Log kanalı bulunamadı.');
            }
        } catch (err) {
            console.error(`Bir işlem sırasında hata oluştu: ${err}`);
            message.reply('Kayıt işlemi sırasında bir hata oluştu.');
        }
    },
};
