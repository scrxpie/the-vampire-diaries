const { Permissions } = require('discord.js');
const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-kes',
  description: 'Bir kullanıcının maaş alma hakkını engeller.',
  async execute(message, args) {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Lütfen maaşı kesilecek kullanıcıyı etiketle.');
    }

    let salaryData = await Salary.findOne({ userId: user.id });
    if (!salaryData) {
      salaryData = new Salary({
        userId: user.id,
        lastClaim: null,
        salaryBlocked: true
      });
    } else {
      salaryData.salaryBlocked = true;
    }

    await salaryData.save();

    message.reply(`${user.tag} kullanıcısının maaş alma hakkı engellendi.`);
  }
};
