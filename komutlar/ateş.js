const { MessageEmbed } = require("discord.js");
const Inventory = require("../models/Inventory");
const Stats = require("../models/Stat");

// Mermilerin fiyatları ve etkileri
const mermilerFiyatVeEtki = {
  "Normal Mermi": { fiyat: 500, etki: "Geçici etki (doğaüstü varlıklara)" },
  "Gümüş Mermi": { fiyat: 7500, etki: "Kurtadamlar için ölümcül, zehir etkili" },
  "Sarı Kurtboğanlı Mermi": { fiyat: 70000, etki: "Kurtadamları iyileşemez hale getirir" },
  "Kurtboğanlı Mermi": { fiyat: 7500, etki: "Kurtadamları iyileşemez hale getirir" },
  "Ok": { fiyat: 500, etki: "Zehirli/kutsal türleri mevcuttur" }
};

// İsabet, sıyırma, kaçırma oranları odak statına göre (0-5 arası)
const atesOranlari = {
  0: { isabet: 1, siyirdi: 3, kacirdi: 6 },
  1: { isabet: 2, siyirdi: 3, kacirdi: 5 },
  2: { isabet: 3, siyirdi: 2, kacirdi: 5 },
  3: { isabet: 4, siyirdi: 2, kacirdi: 4 },
  4: { isabet: 5, siyirdi: 2, kacirdi: 3 },
  5: { isabet: 6, siyirdi: 2, kacirdi: 2 }
};

// Rastgele sayı üret
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "ateş",
  description: "Envanterindeki mermiyle ateş eder, isabet veya kaçırma sonucu alırsın.",
  usage: ".ateş <Mermi tipi>",
  async execute(message, args) {
    const userId = message.author.id;

    if (args.length === 0) {
      return message.reply(`Lütfen ateş etmek istediğin mermi tipini yaz. Örnek: \`.ateş Normal Mermi\``);
    }

    const mermi = args.join(" ").trim();
    const mermiLower = mermi.toLowerCase();

    if (!mermilerFiyatVeEtki[mermi]) {
      return message.reply(`Geçersiz mermi tipi. Geçerli mermiler: ${Object.keys(mermilerFiyatVeEtki).join(", ")}`);
    }

    // Envanteri çek
    let envanter = await Inventory.findOne({ userId });
    if (!envanter || !envanter.items || envanter.items.length === 0) {
      return message.reply("Envanterin bulunamadı veya boş.");
    }

    // Mermiyi bul (items dizisi objelerden oluşuyor diye varsayıyoruz)
    const envanterItemIndex = envanter.items.findIndex(i => i.name.toLowerCase().trim() === mermiLower);
    if (envanterItemIndex === -1) {
      return message.reply(`Envanterinde **${mermi}** bulunmuyor.`);
    }

    // Statları çek, yoksa odak 0 al
    const statVerisi = await Stats.findById(userId);
    const odakStat = statVerisi?.odak ?? 0;
    const oranlar = atesOranlari[odakStat] || atesOranlari[0];

    // Olasılık dizisi hazırla
    let olaslikDizisi = [];
    for (let i = 0; i < oranlar.isabet; i++) olaslikDizisi.push("isabet");
    for (let i = 0; i < oranlar.siyirdi; i++) olaslikDizisi.push("siyirdi");
    for (let i = 0; i < oranlar.kacirdi; i++) olaslikDizisi.push("kacirdi");

    // Rastgele sonucu al
    const sonuc = olaslikDizisi[randomInt(0, olaslikDizisi.length - 1)];

    // Mermiyi envanterden çıkar
    if (envanter.items[envanterItemIndex].quantity > 1) {
      envanter.items[envanterItemIndex].quantity -= 1;
    } else {
      envanter.items.splice(envanterItemIndex, 1);
    }
    await envanter.save();

    // Mesaj oluştur
    let mesaj;
    let renk = "#FF0000";

    if (sonuc === "isabet") {
      mesaj = `🎯 **${mermi}** ile ateş ettin ve **isabet** ettin!`;
      renk = "#00FF00";
    } else if (sonuc === "siyirdi") {
      mesaj = `⚡ **${mermi}** ile ateş ettin, **sıyırdı** ama isabet etmedi.`;
      renk = "#FFFF00";
    } else {
      mesaj = `❌ **${mermi}** ile ateş ettin ama **kaçırdın**.`;
    }

    const embed = new MessageEmbed()
      .setTitle("Ateş Sonucu")
      .setDescription(mesaj)
      .setColor(renk);

    return message.channel.send({ embeds: [embed] });
  }
};
