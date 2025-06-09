const Stats = require("../models/Stat");

module.exports = {
  name: "stat-kullan",
  description: "Stat hakkını kullanarak bir stat'a puan ver.",
  usage: ".stat-kullan <statAdı> <miktar>",
  async execute(message, args) {
    const userId = message.author.id;

    const statVerisi = await Stats.findById(userId);

    if (!statVerisi) {
      return message.reply("Henüz hiç stat verin yok. `.statal` komutuyla kelime toplayıp stat hakkı kazanabilirsin.");
    }

    const [girdiStat, miktarStr] = args;
    if (!girdiStat || !miktarStr) {
      return message.reply("Kullanım: `.stat-kullan <statAdı> <miktar>` örnek: `.stat-kullan guc 2`");
    }

    const miktar = parseInt(miktarStr);
    if (isNaN(miktar) || miktar <= 0) {
      return message.reply("Geçerli bir sayı girmelisin.");
    }

    const statAdlari = ["guc", "direnc", "odak", "irade", "karizma", "zeka", "reflex"];
    const stat = girdiStat.toLowerCase();

    if (!statAdlari.includes(stat)) {
      return message.reply(`Geçerli statlar: ${statAdlari.join(", ")}`);
    }

    const mevcut = statVerisi[stat] || 0;
    const hak = statVerisi.hak || 0;

    if (mevcut >= 5) {
      return message.reply(`Bu stat zaten maksimumda (${mevcut}/5).`);
    }

    if (hak < miktar) {
      return message.reply(`Yeterli stat hakkın yok. Elindeki hak: ${hak}`);
    }

    if (mevcut + miktar > 5) {
      return message.reply(`Bu kadar puan verirsen ${stat} statı 5'i aşar. Şu anki: ${mevcut}, vermek istediğin: ${miktar}`);
    }

    // Stat güncelle
    statVerisi[stat] = mevcut + miktar;
    statVerisi.hak -= miktar;

    await statVerisi.save();

    return message.reply(`✅ Başarıyla **${stat}** statına **${miktar}** puan verdin! Yeni seviye: ${statVerisi[stat]}/5 | Kalan hak: ${statVerisi.hak}`);
  }
};
