const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-kes',
  description: 'Kullanıcının maaş almasını engeller.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('Bir kullanıcı etiketlemelisin.');

    await Salary.findByIdAndUpdate(
      user.id,
      { salaryBlocked: true },
      { upsert: true }
    );

    message.reply(`${user.username} kullanıcısının maaşı bu hafta için kesildi.`);
  }
};
