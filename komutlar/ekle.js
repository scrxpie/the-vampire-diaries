const Inventory = require('../models/Inventory');

const allProducts = [
  "Eski Model Araba",
  "Standart Araba",
  "Motosiklet",
  "Spor Araba",
  "1+0 Apartman",
  "1+1 Apartman",
  "2+1 Apartman",
  "3+1 Apartman",
  "Müstakil Ev",
  "Dublex Ev",
  "Orman Evi",
  "Dağ Evi",
  "Villa",
  "Normal Mermi",
  "Gümüş Mermi",
  "Sarı Kurtboğanlı Mermi",
  "Kurtboğanlı Mermi",
  "Ok",
  "Elektrikli Şok Cihazı",
  "Kurşun Tuzakları",
  "Zincirler",
  "Işıklı Tuzak",
  "Kurtboğanlı Gaz Bombası",
  "Banshee Günlüğü",
  "Bestiary",
  "Druid Ritüel Kitabı",
  "Triskelion",
  "Kurtboğanlı İğne",
  "Zayıf Noktalar Kitabı",
  "Üvez Tozu",
  "Kurtboğan",
  "Sarı Kurtboğan",
  "Tabanca",
  "Yay",
  "Arbalet",
  "Kılıç/Katana",
  "Tüfek",
  "Pompalı Tüfek",
  "Makineli"
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

    const ürünGirilen = args.slice(1).join(' ').trim();
    if (!ürünGirilen) return message.reply('Lütfen eklemek istediğiniz ürünün tam adını yazın.');

    if (!allProducts.includes(ürünGirilen)) {
      return message.reply('Bu ürün mağazada mevcut değil. Lütfen geçerli bir ürün adı yazın.');
    }

    let userInventory = await Inventory.findOne({ userId: kullanıcı.id });

    if (!userInventory) {
      userInventory = new Inventory({
        userId: kullanıcı.id,
        items: [ürünGirilen]
      });
    } else {
      if (!Array.isArray(userInventory.items)) {
        userInventory.items = [];
      }
      userInventory.items.push(ürünGirilen);
    }

    await userInventory.save();

    return message.reply(`${kullanıcı.username} kullanıcısına **${ürünGirilen}** başarıyla eklendi.`);
  }
};
