const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');

module.exports = {
  name: "çek",
  description: "Bankadan parayı cüzdana çeker.",
  async execute(message, args) {
    if (!message.member.roles.cache.some(role => role.name === 'RolePlay Üye')) {
      return message.reply('Bu komutu kullanmak için RolePlaye katılın.');
    }

    const amount = args[0] === 'hepsi' ? 'hepsi' : parseInt(args[0]);
    if (amount !== 'hepsi' && (isNaN(amount) || amount <= 0)) {
      return message.reply("Lütfen geçerli bir miktar girin.");
    }

    const userId = message.author.id;
    let userData = await Balance.findById(userId);
    if (!userData) userData = await Balance.create({ _id: userId });

    const withdrawAmount = amount === 'hepsi' ? userData.bank : amount;
    if (userData.bank < withdrawAmount) return message.reply("Bankada bu kadar para yok.");

    userData.bank -= withdrawAmount;
    userData.balance += withdrawAmount;
    await userData.save();

    const embed = new MessageEmbed()
      .setTitle('Başarıyla Para Çekildi!')
      .setDescription(`${withdrawAmount} para bankadan çekildi.\nYeni cüzdan: ${userData.balance}\nYeni banka: ${userData.bank}`)
      .setTimestamp()
      .setFooter({ text: 'Banka işlemi tamamlandı.' })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setImage('https://media1.tenor.com/m/56YMc63ICdEAAAAd/money-kayy.gif');

    return message.reply({ embeds: [embed] });
  }
};
