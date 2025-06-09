const Stats = require('../models/Stat');

function statBarYuzde(sayi) {
  const max = 5;
  const totalBlocks = 10;

  // yüzdeyi hesapla
  const yuzde = Math.round((sayi / max) * 100);

  const doluBlocks = Math.floor((yuzde / 100) * totalBlocks);
  const yariBlocks = (yuzde % 10 >= 5) ? 1 : 0;
  const bosBlocks = totalBlocks - doluBlocks - yariBlocks;

  const dolu = "█".repeat(doluBlocks);
  const yari = yariBlocks ? "▒" : "";
  const bos = "▒".repeat(bosBlocks);

  return `${dolu}${yari}${bos} ${yuzde}%`;
}

module.exports = {
  name: "stat",
  description: "Tüm statlarını ve kalan stat hakkını gösterir.",
  async execute(message) {
    const userId = message.author.id;

    const statVerisi = await Stats.findById(userId);

    if (!statVerisi) {
      return message.reply("Henüz hiç stat hakkın veya stat verin yok. `.statal` komutuyla kelimelerini stata çevirebilirsin.");
    }

    const tur = statVerisi.tur;
    const hak = statVerisi.hak ?? 0;

    // küçük harfli key'ler olduğunu varsayıyorum
    const statsListesi = {
      guc: statVerisi.guc ?? 0,
      direnc: statVerisi.direnc ?? 0,
      odak: statVerisi.odak ?? 0,
      irade: statVerisi.irade ?? 0,
      karizma: statVerisi.karizma ?? 0,
      zeka: statVerisi.zeka ?? 0,
      reflex: statVerisi.reflex ?? 0,
    };

    let cevap = `🧬 **Stat Bilgilerin (${tur})**\n\n`;

    if (tur === "Hunter") {
      const avciStats = ["guc", "direnc", "odak", "irade", "karizma", "zeka", "reflex"];
      const emojiler = {
        guc: "💪",
        direnc: "🛡️",
        odak: "🎯",
        irade: "🔥",
        karizma: "👑",
        zeka: "🧠",
        reflex: "⚡",
      };

      for (const stat of avciStats) {
        cevap += `${emojiler[stat]} ${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${statBarYuzde(statsListesi[stat])}\n`;
      }
    } else if (tur === "Human") {
      const insanStats = ["guc", "direnc", "odak", "karizma", "zeka"];
      const emojiler = {
        guc: "💪",
        direnc: "🛡️",
        odak: "🎯",
        karizma: "👑",
        zeka: "🧠",
      };

      for (const stat of insanStats) {
        cevap += `${emojiler[stat]} ${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${statBarYuzde(statsListesi[stat])}\n`;
      }
    } else {
      cevap += "Stat türü tanımlı değil.";
    }

    cevap += `\n🎁 **Kullanılabilir Stat Hakkın:** ${hak}`;

    message.reply(cevap);
  }
};
