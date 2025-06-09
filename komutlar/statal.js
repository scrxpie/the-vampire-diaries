const Words = require('../models/Words');
const Stats = require('../models/Stat');

module.exports = {
  name: "statal",
  description: "Kelimelerini belirtilen sayıda stat hakkına çevirir. Örn: .statal 2",
  async execute(message, args) {
    const userId = message.author.id;

    const isAvci = message.member.roles.cache.some(r => r.name.toLowerCase() === "hunter");
    const isInsan = message.member.roles.cache.some(r => r.name.toLowerCase() === "human");

    if (!isAvci && !isInsan) {
      return message.reply("Stat sistemi için 'Avcı' veya 'İnsan' rolüne sahip olman gerekiyor.");
    }

    const tur = isAvci ? "Hunter" : "Human";

    const statAlinacak = parseInt(args[0]);
    if (!statAlinacak || statAlinacak <= 0) {
      return message.reply("Lütfen alacağın stat hakkı miktarını belirt (.statal 2 gibi).");
    }

    const kelimeVerisi = await Words.findById(userId);
    if (!kelimeVerisi) return message.reply("Henüz hiç kelime verin yok!");

    const hakEdilen = Math.floor(kelimeVerisi.words / 3000);
    let statVerisi = await Stats.findById(userId);

    if (!statVerisi) {
      statVerisi = new Stats({ _id: userId, tur });
    }

    const toplamKullanilmis = (statVerisi.verilenStat || 0) + (statVerisi.hak || 0);
    const kullanılabilir = hakEdilen - toplamKullanilmis;

    if (kullanılabilir <= 0) {
      return message.reply("Kelime sayına göre yeni stat hakkın bulunmuyor.");
    }

    if (statAlinacak > kullanılabilir) {
      return message.reply(`En fazla ${kullanılabilir} stat hakkı alabilirsin.`);
    }

    statVerisi.hak = (statVerisi.hak || 0) + statAlinacak;
    await statVerisi.save();

    return message.reply(`✅ Başarıyla **${statAlinacak}** stat hakkı kazandın! Şu an toplam **${statVerisi.hak}** kullanılabilir stat hakkın var.`);
  }
};
