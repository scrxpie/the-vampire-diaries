const AdamAsmaca = require('../models/AdamAsmaca');

const kelimeler = [
  // Doğa
  "orman", "nehir", "göl", "fırtına", "rüzgar", "yağmur", "kar", "çöl", "gökkuşağı", "ay", "güneş", "toprak", "deniz", "yıldırım",

  // Eşyalar
  "kalem", "defter", "bilgisayar", "çanta", "telefon", "gözlük", "klavye", "bardak", "ayna", "şemsiye", "kitaplık", "koltuk", "yastık", "masa", "sandalye",

  // Yiyecekler
  "pizza", "hamburger", "dondurma", "çikolata", "pasta", "armut", "elma", "muz", "karpuz", "kavun", "portakal", "zeytin", "simit", "kek", "kurabiye",

  // Hayvanlar
  "kedi", "köpek", "tavşan", "aslan", "kaplan", "zürafa", "penguen", "balina", "yunus", "ayı", "fil", "tilki", "kartal", "karga", "ördek",

  // Meslekler
  "doktor", "öğretmen", "mimar", "avukat", "polis", "şoför", "hemşire", "aşçı", "garson", "itfaiyeci", "çiftçi", "pilot", "hakim", "eczacı", "müzisyen",

  // Fantastik
  "büyücü", "zombi", "vampir", "ejderha", "kurtadam", "trol", "elf", "goblin", "cadı", "ruh", "lanet", "kılıç", "iksir", "zindan", "krallık",

  // Soyut/Karmaşık
  "özgürlük", "karanlık", "yalnızlık", "umut", "gerçek", "hayal", "zaman", "sonsuzluk", "gizem", "ölüm", "başlangıç", "kader", "rüya", "kaos", "sessizlik",

  // Diğer
  "şehir", "köy", "bina", "otobüs", "tren", "uçak", "kule", "asansör", "televizyon", "kamera", "internet", "robot", "uydu", "radyo", "oyuncak"
];

module.exports = {
  name: 'adamasmaca',
  description: 'Adam asmaca oyununu başlatır',
  async execute(message) {
    const kontrol = await AdamAsmaca.findOne({ channelId: message.channel.id });

if (kontrol) {
  // Oyunun gerçekten aktif olup olmadığını kontrol et
  if (kontrol.kelime && kontrol.gösterilen.includes("_")) {
    return message.reply("Bu kanalda zaten aktif bir oyun var.");
  } else {
    // Oyun tamamlanmış ama silinmemişse, yine de sil
    await AdamAsmaca.deleteOne({ channelId: message.channel.id });
  }
}
    const kelime = kelimeler[Math.floor(Math.random() * kelimeler.length)].toLowerCase();
    const gösterilen = kelime.split('').map(() => "_");

    const oyun = new AdamAsmaca({
      channelId: message.channel.id,
      kelime: kelime,
      gösterilen: gösterilen,
      yanlışlar: [],
      deneme: 0
    });

    await oyun.save();

    return message.channel.send(
      `🎮 **Adam Asmaca Başladı!**\nKelime: \`${gösterilen.join(" ")}\`\nTahmin etmek için \`.tahmin <harf>\` yaz!`
    );
  }
};
