const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance'); // model yolunu kendi yapına göre ayarla

module.exports = {
  name: 'zenginler',
  description: 'RolePlay Üye rolündeki kullanıcıların toplam parasına göre sıralar.',
  async execute(message) {
    const roleName = 'RolePlay Üye';
    const role = message.guild.roles.cache.find(r => r.name === roleName);
    if (!role) return message.reply(`**${roleName}** rolü bulunamadı.`);

    await message.guild.members.fetch();

    const balances = await Balance.find({});

    const users = [];

    for (const entry of balances) {
      const total = (entry.balance || 0) + (entry.bank || 0);
      if (total <= 0) continue;

      const member = message.guild.members.cache.get(entry._id);
      if (!member) continue;
      if (!member.roles.cache.has(role.id)) continue;

      users.push({
        userId: entry._id,
        total
      });
    }

    const sortedUsers = users.sort((a, b) => b.total - a.total);
    const topUsers = sortedUsers.slice(0, 10);

    const topList = topUsers.map((user, index) => {
      const member = message.guild.members.cache.get(user.userId);
      const username = member ? member.user.username : 'Bilinmeyen Kullanıcı';
      return `${index + 1}. ${username} - ${user.total} `;
    });

    const yourIndex = sortedUsers.findIndex(u => u.userId === message.author.id);
    const yourRank = yourIndex !== -1 ? yourIndex + 1 : null;
    const yourData = await Balance.findById(message.author.id);
    const yourTotal = (yourData?.balance || 0) + (yourData?.bank || 0);

    const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
      .setTitle('**༒ Para Sıralaması**')
      .setDescription(topList.join('\n') || 'Liste boş.')
      .setFooter({
        text: yourRank
          ? `༒ | Senin sıran: ${yourRank}. - ${yourTotal} `
          : '༒ | Sıralamada değilsin.'
      });

    return message.channel.send({ embeds: [embed] });
  },
};
