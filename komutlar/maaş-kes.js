const { PermissionsBitField } = require('discord.js');
const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-kes',
  description: 'Bir kullanıcının maaşını keser.',
  usage: '.maaş-kes @kullanıcı',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Lütfen maaşı kesilecek kullanıcıyı etiketle.');
    }

    let salaryData = await Salary.findById(user.id);
    if (!salaryData) {
      salaryData = new Salary({ _id: user.id });
    }

    salaryData.salaryBlocked = true;
    await salaryData.save();

    message.channel.send(`${user} kullanıcısının maaşı bu hafta için kesildi.`);
  }
};
