const { PermissionsBitField } = require('discord.js');
const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-kes',
  description: 'Bir kullanıcının maaş alma hakkını engeller.',
  async execute(message, args) {
    // Yetki kontrolü (örneğin, yönetici olabilir)
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Lütfen maaşı kesilecek kullanıcıyı etiketle.');
    }

    let salaryData = await Salary.findOne({ userId: user.id });
    if (!salaryData) {
      // Kullanıcıya ait kayıt yoksa yeni oluşturup engelle
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
