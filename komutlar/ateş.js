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

// İsabet vurulan bölgeler ve ağırlıkları (örnek)
const isabetBolgeleri = [
  { bolge: "Kafa", agirlik: 1 },   // %10 ihtimal
  { bolge: "Gövde", agirlik: 4 }, // %40 ihtimal
  { bolge: "Kol", agirlik: 3 },    // %30 ihtimal
  { bolge: "Bacak", agirlik: 2 }   // %20 ihtimal
];

// Sıyırma bölgeleri ve ağırlıkları (benzer ama biraz farklı olabilir)
const siyirdiBolgeleri = [
  { bolge: "Kafa", agirlik: 1 },
  { bolge: "Gövde", agirlik: 3 },
  { bolge: "Kol", agirlik: 4 },
  { bolge: "Bacak", agirlik: 2 }
];

// Ağırlıklı rastgele seçim fonksiyonu
function weightedRandom(arr) {
  const toplamAgirlik = arr.reduce((acc, cur) => acc + cur.agirlik, 0);
  let rnd = Math.random() * toplamAgirlik;
  for (const item of arr) {
    if (rnd < item.agirlik) return item.bolge;
    rnd -= item.agirlik;
  }
  return arr[0].bolge; // default fallback
}

// Rastgele sayı üret
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "ateş",
  description: "Envanterindeki mermiyle ateş eder, isabet veya kaçırma sonucu alırsın.",
  usage: ".ates <Mermi tipi>",
  async execute(message, args) {
    const userId = message.author.id;

    if (args.length === 0) {
      return message.reply(`Lütfen ateş etmek istediğin mermi tipini yaz. Örnek: \`.ates Normal Mermi\``);
    }

    const mermi = args.join(" ").trim();
    const mermiLower = mermi.toLowerCase();

    if (!mermilerFiyatVeEtki[mermi]) {
      return message.reply(`Geçersiz mermi tipi. Geçerli mermiler: ${Object.keys(mermilerFiyatVeEtki).join(", ")}`);
    }

    let envanter = await Inventory.findOne({ userId });
    if (!envanter) {
      return message.reply("Envanterin bulunamadı.");
    }

    const envanterItemIndex = envanter.items.findIndex(item => item.toLowerCase().trim() === mermiLower);
    if (envanterItemIndex === -1) {
      return message.reply(`Envanterinde **${mermi}** bulunmuyor.`);
    }

    const statVerisi = await Stats.findById(userId);
    const odakStat = statVerisi ? statVerisi.odak ?? 0 : 0;

    const oranlar = atesOranlari[odakStat];

    let olaslikDizisi = [];
    for (let i = 0; i < oranlar.isabet; i++) olaslikDizisi.push("isabet");
    for (let i = 0; i < oranlar.siyirdi; i++) olaslikDizisi.push("siyirdi");
    for (let i = 0; i < oranlar.kacirdi; i++) olaslikDizisi.push("kacirdi");

    const sonuc = olaslikDizisi[randomInt(0, olaslikDizisi.length - 1)];

    envanter.items.splice(envanterItemIndex, 1);
    await envanter.save();

    let mesaj = "";

    if (sonuc === "isabet") {
      const vurulanBolge = weightedRandom(isabetBolgeleri);
      mesaj = `🎯 **${mermi}** ile ateş ettin ve **isabet** ettin! Vurulan bölge: **${vurulanBolge}**.`;
    } else if (sonuc === "siyirdi") {
      const siyirdiBolge = weightedRandom(siyirdiBolgeleri);
      mesaj = `⚡ **${mermi}** ile ateş ettin, **sıyırdı** ama isabet etmedi. Sıyırdığı bölge: **${siyirdiBolge}**.`;
    } else {
      mesaj = `❌ **${mermi}** ile ateş ettin ama **kaçırdın**.`;
    }

    return message.reply(mesaj);
  }
};
