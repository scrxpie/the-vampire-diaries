const Inventory = require("../models/Inventory");

module.exports = {
  name: "kullan",
  description: "Envanterinden bir ürün kullanır (silinir).",
  usage: ".kullan <Ürün adı>",
  async execute(message, args) {
    if (args.length === 0) {
      return message.reply("Lütfen kullanmak istediğin ürünü yaz. Örnek: `.kullan Kurtboğan`");
    }

    const userId = message.author.id;
    const urunAdi = args.join(" ").trim().toLowerCase();

    // Envanteri çek
    let envanter = await Inventory.findOne({ userId });
    if (!envanter || !Array.isArray(envanter.items) || envanter.items.length === 0) {
      return message.reply("Envanterin bulunamadı ya da boş.");
    }

    // Ürün envanterde var mı bul
    const index = envanter.items.findIndex(item => {
      const regex = /^(\d+)x (.+)$/i;
      const match = item.match(regex);
      if (match) {
        return match[2].toLowerCase().trim() === urunAdi;
      } else {
        return item.toLowerCase().trim() === urunAdi;
      }
    });

    if (index === -1) {
      return message.reply(`Envanterinde **${args.join(" ")}** bulunmuyor.`);
    }

    // Miktar varsa azalt yoksa sil
    const item = envanter.items[index];
    const regex = /^(\d+)x (.+)$/i;
    const match = item.match(regex);

    if (match) {
      let miktar = parseInt(match[1]);
      let isim = match[2];
      if (miktar > 1) {
        miktar--;
        envanter.items[index] = `${miktar}x ${isim}`;
      } else {
        envanter.items.splice(index, 1);
      }
    } else {
      envanter.items.splice(index, 1);
    }

    await envanter.save();

    return message.reply(`**${args.join(" ")}** envanterinden kullanıldı ve silindi.`);
  }
};
