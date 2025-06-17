const Inventory = require('../models/Inventory');

const products = {
  "Araçlar": [
    "Eski Model Araba",
    "Standart Araba",
    "Motosiklet",
    "Spor Araba"
  ],
  "Evler": [
    "1+0 Apartman",
    "1+1 Apartman",
    "2+1 Apartman",
    "3+1 Apartman",
    "Müstakil Ev",
    "Dublex Ev",
    "Orman Evi",
    "Dağ Evi",
    "Villa"
  ],
  "Mermiler": [
    "Normal Mermi",
    "Gümüş Mermi",
    "Sarı Kurtboğanlı Mermi",
    "Kurtboğanlı Mermi",
    "Ok"
  ],
  "Tuzaklar": [
    "Elektrikli Şok Cihazı",
    "Kurşun Tuzakları",
    "Zincirler",
    "Işıklı Tuzak",
    "Kurtboğanlı Gaz Bombası"
  ],
  "Aletler": [
    "Banshee Günlüğü",
    "Bestiary",
    "Druid Ritüel Kitabı",
    "Triskelion",
    "Kurtboğanlı İğne",
    "Zayıf Noktalar Kitabı",
    "Üvez Tozu",
    "Kurtboğan",
    "Sarı Kurtboğan"
  ],
  "Klasik ve Modern Silahlar": [
    "Tabanca",
    "Yay",
    "Arbalet",
    "Kılıç/Katana",
    "Tüfek",
    "Pompalı Tüfek",
    "Makineli"
  ]
};

const allProductsFlat = Object.values(products).flat();

module.exports = {
  name: 'ekle',
  description: 'Kullanıcıya mağazadan ürün ekler.',
  async execute(message, args) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply('Bu komutu kullanmak için yetkiniz yok.');
    }

    const kullanıcı = message.mentions.users.first();
    if (!kullanıcı) return message.reply('Lütfen ürünü eklemek istediğiniz kullanıcıyı etiketleyin.');

    const ürünArg = args.slice(1).join(' ').trim();
    if (!ürünArg) return message.reply('Lütfen eklemek istediğiniz ürünü yazın.');

    const ürünBulundu = allProductsFlat.find(p => p.toLowerCase() === ürünArg.toLowerCase());
    if (!ürünBulundu) {
      return message.reply('Bu ürün mağazada mevcut değil. Lütfen geçerli bir ürün belirtin.');
    }

    try {
      // Kullanıcının envanter kaydını bul veya oluştur
      let userInventory = await Inventory.findOne({ userId: kullanıcı.id });

      if (!userInventory) {
        userInventory = new Inventory({
          userId: kullanıcı.id,
          inventory: [ürünBulundu]
        });
      } else {
        userInventory.inventory.push(ürünBulundu);
      }

      await userInventory.save();

      message.reply(`${kullanıcı.username} kullanıcısına **${ürünBulundu}** ürünü başarıyla eklendi.`);
    } catch (error) {
      console.error(error);
      message.reply('Bir hata oluştu, ürün eklenemedi.');
    }
  }
};
