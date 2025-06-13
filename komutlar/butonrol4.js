const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'butonrol4',
  description: 'Başka bir rol seti sunar ve kullanıcıların bu rolleri alıp çıkarmasına olanak verir.',
  async execute(message, args) {
    const roles = [
      { name: 'Partner Ping', id: '1330264276447006822' },
      { name: 'Bot Duyuru Ping', id: '1356981767923433643' },
      { name: 'RolePlay Ping', id: '1381214693053567117' },
      { name: 'Oyun Ping', id: '1381214829410385960' }
    ];

    const row = new MessageActionRow();
    roles.forEach(role => {
      row.addComponents(
        new MessageButton()
          .setCustomId(`toggleExtraRole_${role.id}`)
          .setLabel(role.name)
          .setStyle('DANGER')
      );
    });

    const embed = new MessageEmbed()
      .setColor('#9b59b6')
      .setTitle('Rol almak için butona dokunun.')
      .setDescription(
        `Aşağıdaki butonlara tıklayarak istediğiniz bildirim rollerini alabilir veya kaldırabilirsiniz:\n
🔔 **Partner Ping** – Partner duyurularından haberdar olun.\n
🤖 **Bot Duyuru Ping** – Bot ile ilgili yenilik ve bakım bildirimlerini alın.\n
🎭 **RolePlay Ping** – Roleplay davetlerini almak için bu rolu alın.\n
🎮 **Oyun Ping** – Oyun etkinlikleri ve duyurularını kaçırmayın.`
      )
      .setTimestamp()
      .setFooter('The Other Side', message.guild.iconURL());
await message.channel.send({
      embeds: [embed],
      components: [row],
    });
  },
};
