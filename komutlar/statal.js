const { MessageEmbed } = require("discord.js");
const Word = require("../models/Words");
const Stat = require("../models/Stat");

module.exports = {
  name: "statal",
  description: "Kelime puanlarını stat hakkına dönüştürür.",
  async execute(message) {
    const userId = message.author.id;

    // Kelime verisini al
    const kelimeVerisi = await Word.findById(userId);
    if (!kelimeVerisi || kelimeVerisi.words < 3000) {
      return message.reply({
        embeds: [new MessageEmbed()
          .setTitle("📉 Yetersiz Kelime")
          .setDescription("Stat hakkı kazanmak için en az **3000 kelime** yazmış olmalısın.")
          .setColor("#ffcc00")]
      });
    }

    // Stat verisini al
    let statVerisi = await Stat.findById(userId);
    if (!statVerisi || !statVerisi.tur) {
      return message.reply({
        embeds: [new MessageEmbed()
          .setTitle("❌ Yanlış Tür")
          .setDescription("Stat hakkı kazanabilmek için önce **Hunter** veya **Human** olmalısın.")
          .setColor("#ff0000")]
      });
    }

    const toplamKelimeler = kelimeVerisi.words;
    const kazanilan = statVerisi.kazanilanHak || 0;

    const toplamKazanilabilir = Math.floor(toplamKelimeler / 3000);
    const verilecekHak = toplamKazanilabilir - kazanilan;

    if (verilecekHak <= 0) {
      return message.reply({
        embeds: [new MessageEmbed()
          .setTitle("📦 Tüm Statlar Alınmış!")
          .setDescription("Yazdığın tüm kelimeler için zaten stat haklarını almışsın.")
          .setColor("#3498db")]
      });
    }

    // Stat verisini güncelle
    statVerisi.hak += verilecekHak;
    statVerisi.kazanilanHak = toplamKazanilabilir;
    await statVerisi.save();

    return message.reply({
      embeds: [new MessageEmbed()
        .setTitle("✨ Stat Hakkı Kazanıldı!")
        .setDescription(
          `📝 Toplam kelimen: **${toplamKelimeler.toLocaleString()}**\n` +
          `📈 Yeni stat hakkı: **+${verilecekHak}**\n` +
          `🎁 Kullanılabilir toplam hak: **${statVerisi.hak}**`
        )
        .setColor("#00ff99")
        .setFooter({ text: "3000 kelime = 1 stat hakkı" })
      ]
    });
  }
};
