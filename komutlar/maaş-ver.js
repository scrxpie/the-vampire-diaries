const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-ver',
  description: 'Kullanıcının maaş alma hakkını geri verir.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('Bir kullanıcı etiketlemelisin.');

    await Salary.updateOne(
      { _id: user.id },
      { $set: { salaryBlocked: false } },
      { upsert: true }
    );

    message.reply(`${user.username} adlı kullanıcının bu haftaki maaş alım hakkı yeniden aktif edildi.`);
  }
};
