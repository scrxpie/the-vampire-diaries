const { MessageEmbed } = require('discord.js');
const Salary = require('../models/Salary');
const Balance = require('../models/Balance');

const roles = {
  "1374114798790508754": 12000, // Şerif
  "1374116265958047824": 11000, // Başhekim
  "1374116335700807751": 10000, // İşletme Sahibi
  "1374113121966227659": 9000,  // Okul Müdürü
  "1374113063086723133": 8000,  // Şerif Yardımcısı
  "1374113003053781193": 8000,  // Polis
  "1383106137028825088": 7000,  // İşletme Asistanı
  "1374112956824158229": 6000,  // Doktor/Hemşire
  "1374112902897995877": 6000,  // Lise Öğretmeni
  "1374112849072226385": 5000,  // Psikolog
  "1383056201104887928": 5000,  // Resepsiyon
  "1374112778213916672": 5000,  // Barmen
  "1374113182087381112": 5000,  // Garson
  "1374118012751450244": 4500,  // Veteriner
  "1374112382468624394": 4000,  // Tamirci
  "1374112495777747039": 4000,  // Güvenlik
  "1374113095038931034": 2500,  // Antrenman Asistanı
  "1374112994623099002": 2500,  // Mağaza Çalışanı
  "1374112644105109564": 3000,  // Öğrenci
  "1374112559954792598": 1000   // İşsiz
};

module.exports = {
  name: 'maaş',
  description: 'Haftalık maaşını alırsın.',
  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Maaş verisini bul ya da yeni oluştur
    let salaryData = await Salary.findOne({ userId });
    if (!salaryData) {
      salaryData = new Salary({
        userId,
        lastClaim: null,
        salaryBlocked: false
      });
      await salaryData.save();
    }

    if (salaryData.salaryBlocked) {
      return message.reply('RolePlay’de aktif olmadığınız için bu hafta maaş alamazsınız.');
    }

    const lastClaim = salaryData.lastClaim ? salaryData.lastClaim.getTime() : 0;
    if (now - lastClaim < oneWeek) {
      const remaining = oneWeek - (now - lastClaim);
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return message.reply(`Zaten maaş aldın. Yeni maaşı tekrar almak için **${days} gün, ${hours} saat, ${minutes} dakika** beklemelisin.`);
    }

    const member = message.member;
    const salaryAmount = Object.keys(roles).reduce((maxSalary, roleId) => {
      return member.roles.cache.has(roleId) ? Math.max(maxSalary, roles[roleId]) : maxSalary;
    }, 0);

    if (salaryAmount === 0) {
      return message.reply('Maaş alabileceğiniz bir rolünüz bulunmuyor.');
    }

    // Kullanıcının bakiyesini güncelle
    await Balance.findOneAndUpdate(
      { userId },
      { $inc: { balance: salaryAmount } },
      { upsert: true }
    );

    salaryData.lastClaim = new Date();
    await salaryData.save();

    const embed = new MessageEmbed()
      .setTitle('༒ Maaş Ödendi')
      .setDescription(`**${salaryAmount} $** maaş hesabınıza yatırıldı.`)
      .setFooter({ text: '༒ | Haftalık maaş sistemi' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
