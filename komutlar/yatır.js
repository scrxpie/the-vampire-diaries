const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');

module.exports = {
  name: "yatır",
  description: "Cüzdandaki parayı bankaya yatırır.",
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

    const depositAmount = amount === 'hepsi' ? userData.balance : amount;
    if (userData.balance < depositAmount) return message.reply("Cüzdanınızda bu kadar para yok.");

    userData.balance -= depositAmount;
    userData.bank += depositAmount;
    await userData.save();

    const embed = new MessageEmbed()
      .setTitle('Başarıyla Para Yatırıldı!')
      .setDescription(`${depositAmount} para bankaya yatırıldı.\nYeni cüzdan: ${userData.balance}\nYeni banka: ${userData.bank}`)
      .setTimestamp()
      .setFooter({ text: 'Banka işlemi tamamlandı.' })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setImage('https://media1.tenor.com/m/56YMc63ICdEAAAAd/money-kayy.gif');

    return message.reply({ embeds: [embed] });
  }
};
