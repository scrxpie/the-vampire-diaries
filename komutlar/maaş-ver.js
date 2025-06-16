const { PermissionsBitField } = require('discord.js');
const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-ver',
  description: 'Bir kullanıcının maaş alma hakkını açar.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Lütfen maaşı açılacak kullanıcıyı etiketle.');
    }

    let salaryData = await Salary.findOne({ userId: user.id });
    if (!salaryData) {
      salaryData = new Salary({
        userId: user.id,
        lastClaim: null,
        salaryBlocked: false
      });
    } else {
      salaryData.salaryBlocked = false;
    }

    await salaryData.save();

    message.reply(`${user.tag} kullanıcısının maaş alma hakkı açıldı.`);
  }
};
