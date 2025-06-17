const Inventory = require('../models/Inventory');

module.exports = {
  name: 'sil',
  description: 'Kullanıcının envanterinden bir ürünü siler.',
  async execute(message, args) {
    // Yetki kontrolü
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanmak için yeterli yetkiniz yok.');
    }

    // Kullanıcı ve ürün parametrelerini al
    const kullanıcı = message.mentions.users.first();
    const ürün = args.slice(1).join(' ').trim();

    if (!kullanıcı || !ürün) {
      return message.reply('Lütfen bir kullanıcı ve ürün belirtin. Örnek: `.sil @kullanıcı Malikane`');
    }

    try {
      // Kullanıcının envanterini bul
      const userInventory = await Inventory.findOne({ userId: kullanıcı.id });
      if (!userInventory || !userInventory.items || userInventory.items.length === 0) {
        return message.reply(`${kullanıcı.username} kullanıcısının envanteri bulunmuyor.`);
      }

      // Ürün envanterde var mı kontrol et
      const productIndex = userInventory.items.indexOf(ürün);
      if (productIndex === -1) {
        return message.reply(`${kullanıcı.username} kullanıcısının envanterinde ${ürün} ürünü bulunmuyor.`);
      }

      // Ürünü diziden çıkar
      userInventory.items.splice(productIndex, 1);

      // Kaydet
      await userInventory.save();

      return message.reply(`${kullanıcı.username} kullanıcısının envanterinden ${ürün} ürünü başarıyla silindi.`);
    } catch (error) {
      console.error(error);
      return message.reply('Bir hata oluştu, ürün silinemedi.');
    }
  }
};
