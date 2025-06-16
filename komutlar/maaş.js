const { MessageEmbed } = require('discord.js');
const Salary = require('../models/Salary');
const Balance = require('../models/Balance');

const roles = {
  "1374114798790508754": 12000,
  "1374116265958047824": 11000,
  "1374116335700807751": 10000,
  "1374113121966227659": 9000,
  "1374113063086723133": 8000,
  "1374113003053781193": 8000,
  "1383106137028825088": 7000,
  "1374112956824158229": 6000,
  "1374112902897995877": 6000,
  "1374112849072226385": 5000,
  "1383056201104887928": 5000,
  "1374112778213916672": 5000,
  "1374113182087381112": 5000,
  "1374118012751450244": 4500,
  "1374112382468624394": 4000,
  "1374112495777747039": 4000,
  "1374113095038931034": 2500,
  "1374112994623099002": 2500,
  "1374112644105109564": 3000,
  "1374112559954792598": 1000
};

module.exports = {
  name: 'maaş',
  description: 'Haftalık maaşını alırsın.',
  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    let salaryData = await Salary.findById(userId);
    if (!salaryData) {
      salaryData = new Salary({ _id: userId });
    }

    // Eğer maaş kesildiyse
    if (salaryData.salaryBlocked) {
      salaryData.salaryBlocked = false;
      salaryData.lastClaimed = now;
      await salaryData.save();

      return message.reply('Bu hafta RolePlay yapmadığınız için maaş alamadınız. Yeni hafta için beklemeniz gerekiyor.');
    }

    // Eğer son maaş alınmasından 1 hafta geçmediyse
    if (salaryData.lastClaimed && (now - salaryData.lastClaimed < oneWeek)) {
      const remaining = oneWeek - (now - salaryData.lastClaimed);
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return message.reply(`Zaten maaş aldın. Yeni maaş için **${days} gün, ${hours} saat, ${minutes} dakika** beklemelisin.`);
    }

    // Rol kontrolü
    const member = message.member;
    const salaryAmount = Object.keys(roles).reduce((acc, roleId) => {
      return member.roles.cache.has(roleId) ? Math.max(acc, roles[roleId]) : acc;
    }, 0);

    if (salaryAmount === 0) {
      return message.reply('Maaş alabileceğiniz bir rolünüz bulunmuyor.');
    }

    await Balance.findByIdAndUpdate(
      userId,
      { $inc: { balance: salaryAmount } },
      { upsert: true }
    );

    salaryData.lastClaimed = now;
    await salaryData.save();

    const embed = new MessageEmbed()
      .setTitle('༒ Maaş Ödendi')
      .setDescription(`**${salaryAmount} $** maaş hesabınıza yatırıldı.`)
      .setFooter({ text: '༒ | Haftalık maaş sistemi' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
