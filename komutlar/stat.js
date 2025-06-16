const { MessageEmbed } = require("discord.js");
const Stats = require("../models/Stat");

function statBarYuzde(sayi) {
  const max = 5;
  const totalBlocks = 10;

  const yuzde = Math.round((sayi / max) * 100);

  const doluBlocks = Math.floor((yuzde / 100) * totalBlocks);
  const yariBlocks = yuzde % 10 >= 5 ? 1 : 0;
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

    // 🔍 Kullanıcının rolüne göre tür belirleniyor:
    let tur;

    if (message.member.roles.cache.some(role => role.name === "Hunter")) {
      tur = "Avcı";
    } else if (message.member.roles.cache.some(role => role.name === "Human")) {
      tur = "İnsan";
    } else {
      return message.reply("Rolünü belirleyemedim. `Hunter` ya da `Human` rolün yok gibi görünüyor.");
    }

    const hak = statVerisi.hak ?? 0;

    const statsListesi = {
      Güc: statVerisi.guc ?? 0,
      Direnç : statVerisi.direnc ?? 0,
      Odak: statVerisi.odak ?? 0,
      İrade : statVerisi.irade ?? 0,
      Karizma: statVerisi.karizma ?? 0,
      Zeka: statVerisi.zeka ?? 0,
      Reflex : statVerisi.reflex ?? 0,
    };

    const emojiler = {
      Güc: "💪",
      Direnç: "🛡️",
      Odak: "🎯",
      İrade: "🔥",
      Karizma: "👑",
      Zeka: "🧠",
      Reflex: "⚡",
    };

    const embed = new MessageEmbed()
      
      .setTitle(`🧬 ${message.author.username} - Stat Bilgilerin`)
      .setDescription(`Karakter Türü: **${tur}**\n🎁 Kullanılabilir Stat Hakkın: **${hak}**\n\u200b`);

    let statSirasi = [];

    if (tur === "Avcı") {
      statSirasi = ["Güç", "Direnç", "Odak", "İrade", "Karizma", "Zeka", "Reflex"];
    } else if (tur === "İnsan") {
      statSirasi = ["Güç", "Direnç", "Odak",  "Karizma", "Zeka"];
    }

    for (const stat of statSirasi) {
      const isim = stat.charAt(0).toUpperCase() + stat.slice(1);
      embed.addField(`${emojiler[stat]} ${isim}`, statBarYuzde(statsListesi[stat]), true);
    }

    return message.reply({ embeds: [embed] });
  }
};
