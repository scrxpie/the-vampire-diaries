const { MessageEmbed } = require('discord.js');
const Inventory = require('../models/Inventory'); // MongoDB modelinizi doğru yola göre ayarlayın

module.exports = {
  name: 'envanter',
  description: 'Kullanıcının sahip olduğu ürünleri gösterir.',
  async execute(message) {
    // Kullanıcıda belirli bir rol olup olmadığını kontrol eden fonksiyon
    const hasRole = (roleName) => message.member.roles.cache.some(role => role.name === roleName);

    const roleName = 'RolePlay Üye';
    const isAdmin = hasRole('Kurucu');
    const isRolePlayUser = hasRole(roleName);

    // Kendi envanterini görmek isteyen kullanıcı
    if (!message.mentions.users.size) {
      if (!isRolePlayUser) {
        const embed = new MessageEmbed()
          .setTitle('❌ Yetki Hatası')
          .setDescription('Bu komutu kullanmak için RolePlaye katılmalısın.')
          .setColor('#FF0000');
        return message.reply({ embeds: [embed] });
      }

      const userId = message.author.id;
      const userInventory = await Inventory.findOne({ userId });

      if (!userInventory || !userInventory.items.length) {
        const embed = new MessageEmbed()
          .setTitle('📦 Envanter Boş')
          .setDescription('Henüz hiçbir ürününüz yok.')
          .setColor('#FFFF00');
        return message.reply({ embeds: [embed] });
      }

      const inventoryList = userInventory.items.map(i => `\`${i}\``).join('\n');

      const embed = new MessageEmbed()
        .setTitle(`${message.author.username} Envanteri`)
        .setDescription(inventoryList)
        .setColor('#3498DB');
      return message.channel.send({ embeds: [embed] });
    }

    // Başka bir kullanıcı etiketlendiyse
    if (message.mentions.users.size === 1) {
      if (!isAdmin) {
        const embed = new MessageEmbed()
          .setTitle('❌ Yetki Hatası')
          .setDescription('Başka bir kullanıcının envanterini görmek için yetkili olmanız gerekmektedir.')
          .setColor('#FF0000');
        return message.reply({ embeds: [embed] });
      }

      const mentionedUser = message.mentions.users.first();
      const mentionedUserId = mentionedUser.id;

      const mentionedInventory = await Inventory.findOne({ userId: mentionedUserId });

      if (!mentionedInventory || !mentionedInventory.items.length) {
        const embed = new MessageEmbed()
          .setTitle('Envanter Boş')
          .setDescription(`${mentionedUser.username} adlı kullanıcının henüz hiçbir ürünü yok.`)
          .setColor('#FFFF00');
        return message.reply({ embeds: [embed] });
      }

      const inventoryList = mentionedInventory.items.map(i => `\`${i}\``).join('\n');

      const embed = new MessageEmbed()
        .setTitle(`${mentionedUser.username} Envanteri`)
        .setDescription(inventoryList)
        
      return message.channel.send({ embeds: [embed] });
    }

    // Diğer durumlarda uyarı
    const embed = new MessageEmbed()
      .setTitle('❌ Hata')
      .setDescription('Lütfen sadece kendinizin envanterini görün ya da başka kullanıcıları görmek için yetkiniz olsun.')
      .setColor('#FF0000');
    return message.reply({ embeds: [embed] });
  }
};
