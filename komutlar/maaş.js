const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment/locale/tr'); // Türkçe için
moment.locale('tr');

const Salary = require('../models/Salary');
const Balance = require('../models/Balance');

const roles = [
  { id: '1374114798790508754', amount: 12000 }, // Şerif
  { id: '1374116265958047824', amount: 11000 },
  { id: '1374116335700807751', amount: 10000 },
  { id: '1374113121966227659', amount: 9000 },
  { id: '1374113063086723133', amount: 8000 },
  { id: '1374113003053781193', amount: 8000 },
  { id: '1383106137028825088', amount: 7000 },
  { id: '1374112956824158229', amount: 6000 },
  { id: '1374112902897995877', amount: 6000 },
  { id: '1374112849072226385', amount: 5000 },
  { id: '1383056201104887928', amount: 5000 },
  { id: '1374112778213916672', amount: 5000 },
  { id: '1374113182087381112', amount: 5000 },
  { id: '1374118012751450244', amount: 4500 },
  { id: '1374112382468624394', amount: 4000 },
  { id: '1374112495777747039', amount: 4000 },
  { id: '1374113095038931034', amount: 2500 },
  { id: '1374112994623099002', amount: 2500 },
  { id: '1374112644105109564', amount: 3000 },
  { id: '1374112559954792598', amount: 1000 },
];

module.exports = {
  name: 'maaş',
  description: 'Haftalık maaşını alırsın.',
  async execute(message) {
    const userId = message.author.id;
    const userRoles = message.member.roles.cache;

    let maxSalary = 0;
    for (const role of roles) {
      if (userRoles.has(role.id) && role.amount > maxSalary) {
        maxSalary = role.amount;
      }
    }

    if (maxSalary === 0) {
      return message.reply('Maaş alabileceğin bir mesleğin yok.');
    }

    let salaryData = await Salary.findOne({ userId });
    const now = new Date();

    if (salaryData) {
      const last = salaryData.lastClaimed || new Date(0);
      const diff = now - last;

      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const nextClaim = moment(last).add(7, 'days').calendar();
        return message.reply(`Zaten maaş aldın. Yeni maaş **${nextClaim}** tarihinde alınabilir.`);
      }

      salaryData.lastClaimed = now;
      await salaryData.save();
    } else {
      await Salary.create({ userId, lastClaimed: now });
    }

    // 💰 Bakiye'ye maaşı ekle
    await Balance.findByIdAndUpdate(
      userId,
      { $inc: { balance: maxSalary } },
      { upsert: true, new: true }
    );

    const embed = new MessageEmbed()
     
      .setTitle('📥 Maaş Alındı')
      .setDescription(`**${message.author.username}**, haftalık maaşını aldı: **${maxSalary.toLocaleString()}$**`)
      .setFooter({ text: '༒ | Maaş sistemi' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
