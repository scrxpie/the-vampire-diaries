const Stats = require("../models/Stat");

const validStats = [
  "guc",
  "direnc",
  "odak",
  "irade",
  "karizma",
  "zeka",
  "reflex"
];

module.exports = {
  name: "stat-sıfırla",
  description: "Yönetici komutu: Bir kullanıcının tüm statlarını veya belirli bir statını sıfırlar.",
  usage: ".stat-sifirla @kullanici [statAdi]",
  async execute(message, args) {
    // Yönetici kontrolü
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("Bu komutu sadece yöneticiler kullanabilir.");
    }

    // Kullanıcı etiket kontrolü
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Lütfen statlarını sıfırlamak istediğin kullanıcıyı etiketle.");
    }

    // Stat adı (opsiyonel)
    const statArg = args[1]?.toLowerCase();

    // Kullanıcı verisi çek
    const statVerisi = await Stats.findById(user.id);
    if (!statVerisi) {
      return message.reply("Bu kullanıcının stat verisi bulunamadı.");
    }

    if (statArg) {
      // Belirli stat sıfırlama
      if (!validStats.includes(statArg)) {
        return message.reply(`Geçersiz stat ismi. Geçerli statlar: ${validStats.join(", ")}`);
      }

      statVerisi[statArg] = 0;
      await statVerisi.save();

      return message.reply(`✅ ${user.tag} kullanıcısının **${statArg}** statı sıfırlandı.`);
    } else {
      // Tüm statları sıfırla
      validStats.forEach(stat => {
        statVerisi[stat] = 0;
      });
      // Stat hakkını da sıfırlamak istersen, aşağıdaki satırı açabilirsin:
      // statVerisi.hak = 0;
      await statVerisi.save();

      return message.reply(`✅ ${user.tag} kullanıcısının tüm statları sıfırlandı.`);
    }
  }
};
