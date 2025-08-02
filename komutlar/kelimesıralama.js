const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words'); // Model yolunu kendi dosya yapına göre güncelle

module.exports = {
  name: 'sıralama',
  description: 'RolePlay Üye rolündeki kullanıcıların kelime sayısına göre sıralar.',
  async execute(message) {
    const roleName = 'RolePlay Üye';

    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.reply(`**${roleName}** rolü bulunamadı.`);

    // Üyeleri cache'e al (rol kontrolü için)
    await message.guild.members.fetch();

    // MongoDB'den kelime verilerini al
    const allWordData = await Words.find({ words: { $gt: 0 } });

    // Role sahip olanları filtrele
    const users = allWordData
      .map(data => {
        const member = message.guild.members.cache.get(data._id);
        if (!member || !member.roles.cache.has(role.id)) return null;
        return {
          userId: data._id,
          words: data.words
        };
      })
      .filter(Boolean);

    // Kelime sayısına göre sırala
    const sortedUsers = users.sort((a, b) => b.words - a.words);
    const topUsers = sortedUsers.slice(0, 10);

    const topList = await Promise.all(
      topUsers.map(async (user, index) => {
        const member = message.guild.members.cache.get(user.userId);
        const username = member ? member.user.username : 'Bilinmeyen Kullanıcı';
        return `${index + 1}. ${username} - ${user.words} kelime`;
      })
    );

    const yourIndex = sortedUsers.findIndex(u => u.userId === message.author.id);
    const yourRank = yourIndex !== -1 ? yourIndex + 1 : null;

    // Kendi kelime sayını al
    const yourData = await Words.findById(message.author.id);
    const yourWords = yourData?.words || 0;

    const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTitle('**༒ Kelime Sıralaması**')
      .setDescription(topList.join('\n') || 'Liste boş.')
      .setFooter({
        text: yourRank
          ? `༒ | Senin sıran: ${yourRank}. - ${yourWords} kelime`
          : '༒ | Sıralamada değilsin.'
      });

    return message.channel.send({ embeds: [embed] });
  },
};
