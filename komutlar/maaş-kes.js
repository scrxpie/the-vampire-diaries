const { PermissionsBitField } = require('discord.js');
const Salary = require('../models/Salary');

module.exports = {
  name: 'maaş-kes',
  description: 'Bir kullanıcının maaşını bu hafta için keser.',
  usage: '.maaş-kes @kullanıcı',
  async execute(message, args) {
    // Yönetici yetkisi kontrolü
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Bu komutu kullanmak için yönetici olmalısın.');
    }

    // Kullanıcı etiketi al
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Lütfen maaşı kesilecek kullanıcıyı etiketle.');
    }

    // Veritabanında kullanıcının maaş kaydını ara
    let salaryData = await Salary.findById(user.id);

    // Eğer kayıt yoksa yenisini oluştur
    if (!salaryData) {
      salaryData = new Salary({ _id: user.id });
    }

    // Maaş engelini aktif et
    salaryData.salaryBlocked = true;

    await salaryData.save();

    message.channel.send(`${user} kullanıcısının maaşı bu hafta için kesildi.`);
  }
};
