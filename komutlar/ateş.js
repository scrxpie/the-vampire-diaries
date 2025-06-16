const { MessageEmbed } = require("discord.js");
const Stats = require("../models/Stat");
const Inventory = require("../models/Inventory");

const mermilerFiyatVeEtki = {
  "Normal Mermi": { fiyat: 500, aciklama: "Standart mühimmat. Doğaüstü varlıklara geçici etki." },
  "Gümüş Mermi": { fiyat: 7500, aciklama: "Kurtadamlar için ölümcül. Zehir etkili." },
  "Sarı Kurtboğanlı Mermi": { fiyat: 70000, aciklama: "Kurtadamları iyileşemez hale getirir." },
  "Kurtboğanlı Mermi": { fiyat: 7500, aciklama: "Kurtadamları iyileşemez hale getirir." },
  "Ok": { fiyat: 500, aciklama: "Zehirli/kutsal türleri mevcuttur." }
};

function odakBazliSonuc(odakStat) {
  // Toplam 10 ihtimal var:
  // isabet sayısı = odakStat (0-5)
  // sıyırdı = 3 (sabit)
  // kaçırdı = 10 - odakStat - 3
  // Toplam = 10

  const isabet = odakStat;
  const siyirdi = 3;
  const kacirdi = 10 - isabet - siyirdi;

  // Olabilirlik dizisi oluştur
  const olasiliklar = [];

  for (let i = 0; i < isabet; i++) olasiliklar.push("İsabet");
  for (let i = 0; i < siyirdi; i++) olasiliklar.push("Sıyırdı");
  for (let i = 0; i < kacirdi; i++) olasiliklar.push("Kaçırdı");

  // Rastgele bir sonuç seç
  const secim = olasiliklar[Math.floor(Math.random() * olasiliklar.length)];

  return secim;
}

module.exports = {
  name: "ateş",
  description: "Mermi seçerek ateş etmeni sağlar.",
  usage: ".ateş <mermi tipi>",
  async execute(message, args) {
    const userId = message.author.id;
    const mermi = args.join(" ");

    if (!mermi) {
      return message.reply("Lütfen hangi mermiyle ateş edeceğini yaz. Örnek: `.ates Normal Mermi`");
    }

    if (!mermilerFiyatVeEtki[mermi]) {
      return message.reply(`Geçersiz mermi tipi. Geçerli mermiler: ${Object.keys(mermilerFiyatVeEtki).join(", ")}`);
    }

    // Inventory'den kontrol et
    let envanter = await Inventory.findOne({ userId });
    if (!envanter || !envanter.items.includes(mermi)) {
      return message.reply(`Envanterinde **${mermi}** bulunmuyor.`);
    }

    // Envanterden 1 adet düşür
    const index = envanter.items.indexOf(mermi);
    if (index > -1) {
      envanter.items.splice(index, 1);
    }
    await envanter.save();

    // Kullanıcının odak statını al
    const statVerisi = await Stats.findById(userId);
    if (!statVerisi) {
      return message.reply("Stat bilgilerini bulamadım. Önce `.statal` ile stat hakkı kazanmalısın.");
    }
    const odak = statVerisi.odak ?? 0;

    const sonuc = odakBazliSonuc(odak);

    const embed = new MessageEmbed()
      .setTitle(`${message.author.username} ateş etti! 🔫`)
      .setDescription(`**Mermi:** ${mermi}\n**Odak Statın:** ${odak}\n\n` +
        `Atış sonucu: **${sonuc}**`);

    message.reply({ embeds: [embed] });
  }
};
