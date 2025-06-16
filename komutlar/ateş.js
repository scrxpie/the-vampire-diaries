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
  0: { isabet: 2, siyirdi: 2, kacirdi: 6 },
  1: { isabet: 3, siyirdi: 3, kacirdi: 4 },
  2: { isabet: 4, siyirdi: 3, kacirdi: 3 },
  3: { isabet: 5, siyirdi: 2, kacirdi: 3 },
  4: { isabet: 6, siyirdi: 1, kacirdi: 3 },
  5: { isabet: 7, siyirdi: 1, kacirdi: 2 }
};

// Bölge olasılıkları yüzdelik
const isabetBolgeOranlari = [
  { bolge: "Kafa", oran: 20 },
  { bolge: "Kol", oran: 15 },
  { bolge: "Gövde", oran: 40 },
  { bolge: "Bacak", oran: 25 },
];

const siyirdiBolgeOranlari = [
  { bolge: "Kafa", oran: 10 },
  { bolge: "Kol", oran: 25 },
  { bolge: "Gövde", oran: 40 },
  { bolge: "Bacak", oran: 25 },
];

// Yüzdeye göre bölge seçici
function bolgeSec(oranlar) {
  const rastgele = Math.random() * 100;
  let toplam = 0;
  for (const item of oranlar) {
    toplam += item.oran;
    if (rastgele <= toplam) return item.bolge;
  }
  return oranlar[oranlar.length - 1].bolge; // En son bölgeyi döner
}

// Rastgele sayı üretici
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

    if (!mermilerFiyatVeEtki.hasOwnProperty(mermi)) {
      return message.reply(`Geçersiz mermi tipi. Geçerli mermiler: ${Object.keys(mermilerFiyatVeEtki).join(", ")}`);
    }

    // Envanteri çek
    let envanter = await Inventory.findOne({ userId });
    if (!envanter || !Array.isArray(envanter.items) || envanter.items.length === 0) {
      return message.reply("Envanterin bulunamadı veya boş.");
    }

    // Envanterde mermi var mı kontrol et
    const envanterItemIndex = envanter.items.findIndex(item => {
      const regex = /^(\d+)x (.+)$/i;
      const match = item.match(regex);
      if (match) {
        return match[2].toLowerCase().trim() === mermiLower;
      } else {
        return item.toLowerCase().trim() === mermiLower;
      }
    });

    if (envanterItemIndex === -1) {
      return message.reply(`Envanterinde **${mermi}** bulunmuyor.`);
    }

    // Statları çek, yoksa 0 kabul et
    const statVerisi = await Stats.findById(userId);
    const odakStat = statVerisi?.odak ?? 0;
    const oranlar = atesOranlari[odakStat] || atesOranlari[0];

    // Olasılıkları hazırla
    let olaslikDizisi = [];
    for (let i = 0; i < oranlar.isabet; i++) olaslikDizisi.push("isabet");
    for (let i = 0; i < oranlar.siyirdi; i++) olaslikDizisi.push("siyirdi");
    for (let i = 0; i < oranlar.kacirdi; i++) olaslikDizisi.push("kacirdi");

    // Rastgele sonuç
    const sonuc = olaslikDizisi[randomInt(0, olaslikDizisi.length - 1)];

    // Mermiyi envanterden çıkar (miktar 1'den fazla ise miktarı azalt)
    const item = envanter.items[envanterItemIndex];
    const regex = /^(\d+)x (.+)$/i;
    const match = item.match(regex);

    if (match) {
      let miktar = parseInt(match[1]);
      let isim = match[2];
      if (miktar > 1) {
        miktar--;
        envanter.items[envanterItemIndex] = `${miktar}x ${isim}`;
      } else {
        envanter.items.splice(envanterItemIndex, 1);
      }
    } else {
      // Miktar bilgisi yoksa direkt çıkar
      envanter.items.splice(envanterItemIndex, 1);
    }
    await envanter.save();

    // Mesaj hazırla
    let mesaj;
    if (sonuc === "isabet") {
      const bolge = bolgeSec(isabetBolgeOranlari);
      mesaj = `🎯 **${mermi}** ile ateş ettin ve **isabet** ettin! Bölge: **${bolge}**`;
    } else if (sonuc === "siyirdi") {
      const bolge = bolgeSec(siyirdiBolgeOranlari);
      mesaj = `⚡ **${mermi}** ile ateş ettin, **sıyırdı**! Bölge: **${bolge}**`;
    } else {
      mesaj = `❌ **${mermi}** ile ateş ettin ama **kaçırdın**.`;
    }

    return message.reply(mesaj);
  }
};
