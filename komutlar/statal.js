const { MessageEmbed } = require("discord.js");
const Word = require("../models/Words"); // Kelime verisi modeli
const Stat = require("../models/Stat"); // Stat modeli

module.exports = {
  name: "statal",
  description: "Kelime sayına göre stat hakkı kazanırsın.",
  async execute(message) {
    const userId = message.author.id;

    const kelimeVerisi = await Word.findOne({ userId });
    const kelimeSayisi = kelimeVerisi?.kelime || 0;

    if (kelimeSayisi < 3000) {
      const embed = new MessageEmbed()
        .setTitle("📉 Yetersiz Kelime Sayısı")
        .setDescription(`Stat hakkı kazanmak için **en az 3000 kelime** yazmalısın.\nŞu an: **${kelimeSayisi}** kelimen var.`)
        .setColor("#ff0000");

      return message.reply({ embeds: [embed] });
    }

    let statVerisi = await Stat.findById(userId);
    if (!statVerisi) {
      statVerisi = new Stat({
        _id: userId,
        hak: 0,
        kazanilanHak: 0
      });
    }

    const toplamKazanilabilir = Math.floor(kelimeSayisi / 3000);
    const zatenAlinan = statVerisi.kazanilanHak || 0;
    const verilecekHak = toplamKazanilabilir - zatenAlinan;

    if (verilecekHak <= 0) {
      const embed = new MessageEmbed()
        .setTitle("⚠️ Yeni Stat Hakkı Yok")
        .setDescription(`Tüm stat haklarını almışsın.\nYeni hak için daha fazla kelime yazmalısın! ✍️`)
        .setColor("#ffff00");

      return message.reply({ embeds: [embed] });
    }

    statVerisi.hak += verilecekHak;
    statVerisi.kazanilanHak = toplamKazanilabilir;
    await statVerisi.save();

    const embed = new MessageEmbed()
      .setTitle("🧬 Stat Hakkı Kazanıldı!")
      .setDescription(`Toplam **${kelimeSayisi}** kelimen var.\n\n🎁 **${verilecekHak}** yeni stat hakkı kazandın!\n📦 Kullanılabilir toplam hak: **${statVerisi.hak}**`)
      .setColor("#00ff00");

    return message.reply({ embeds: [embed] });
  }
};
