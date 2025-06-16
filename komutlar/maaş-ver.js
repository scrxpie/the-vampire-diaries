const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-ver',
  description: 'Kullanıcının maaş engelini kaldırır.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('Bir kullanıcı etiketlemelisin.');

    await Salary.findByIdAndUpdate(
      user.id,
      { salaryBlocked: false },
      { upsert: true }
    );

    message.reply(`${user.username} artık bu hafta maaş alabilir.`);
  }
};
