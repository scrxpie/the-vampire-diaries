const { MessageEmbed } = require('discord.js');
const Inventory = require('../models/Inventory');

const allProducts = [
  // Buraya mağazadaki tüm ürünleri tam isimleriyle ekleyebilirsin
  "Eski Model Araba - 30000$",
  "Standart Araba - 40000$",
  "Motosiklet - 20000$",
  "Spor Araba - 50000$",
  "1+0 Apartman - 50000$",
  "1+1 Apartman - 60000$",
  "2+1 Apartman - 70000$",
  "3+1 Apartman - 80000$",
  "Müstakil Ev - 100000$",
  "Dublex Ev - 150000$",
  "Orman Evi - 125000$",
  "Dağ Evi - 100000$",
  "Villa - 200000$",
  "Normal Mermi - 500$",
  "Gümüş Mermi - 7500$",
  "Sarı Kurtboğanlı Mermi - 70000$",
  "Kurtboğanlı Mermi - 7500$",
  "Ok - 500$",
  "Elektrikli Şok Cihazı - 5000$",
  "Kurşun Tuzakları - 2500$",
  "Zincirler - 1500$",
  "Işıklı Tuzak - 2500$",
  "Kurtboğanlı Gaz Bombası - 7500$",
  "Banshee Günlüğü - 5000$",
  "Bestiary - 8000$",
  "Druid Ritüel Kitabı - 10000$",
  "Triskelion - 12000$",
  "Kurtboğanlı İğne - 3000$",
  "Zayıf Noktalar Kitabı - 15000$",
  "Üvez Tozu - 10000$",
  "Kurtboğan - 1500$",
  "Sarı Kurtboğan - 50000$",
  "Tabanca - 10000$",
  "Yay - 30000$",
  "Arbalet - 30000$",
  "Kılıç/Katana - 12000$",
  "Tüfek - 40000$",
  "Pompalı Tüfek - 40000$",
  "Makineli - 50000$"
];

module.exports = {
  name: 'ekle',
  description: 'Kullanıcıya mağazadan ürün ekler.',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yeterli yetkiniz yok.');
    }

    const kullanıcı = message.mentions.users.first();
    if (!kullanıcı) return message.reply('Lütfen ürün eklemek istediğiniz kullanıcıyı etiketleyin.');

    const ürün = args.slice(1).join(' ').trim();
    if (!ürün) return message.reply('Lütfen eklemek istediğiniz ürünün tam adını yazın.');

    // Ürün mağazada var mı kontrolü
    if (!allProducts.includes(ürün)) {
      return message.reply('Bu ürün mağazada mevcut değil. Lütfen geçerli bir ürün adı yazın.');
    }

    // Kullanıcının envanterini veritabanından al
    let userInventory = await Inventory.findOne({ userId: kullanıcı.id });

    if (!userInventory) {
      // Kullanıcının envanteri yoksa yeni oluştur
      userInventory = new Inventory({
        userId: kullanıcı.id,
        items: [ürün]
      });
    } else {
      // Envanteri varsa, items dizisi olup olmadığını kontrol et
      if (!Array.isArray(userInventory.items)) {
        userInventory.items = [];
      }
      userInventory.items.push(ürün);
    }

    // Değişiklikleri kaydet
    await userInventory.save();

    return message.reply(`${kullanıcı.username} kullanıcısına **${ürün}** başarıyla eklendi.`);
  }
};
