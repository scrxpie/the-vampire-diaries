const AdamAsmaca = require('../models/AdamAsmaca');

module.exports = {
  name: 'tahmin',
  description: 'Adam asmaca harfi ya da kelimeyi tahmin eder',
  async execute(message, args) {
    const tahmin = args.join(" ")?.toLowerCase();
    if (!tahmin) return message.reply("Bir harf ya da kelime tahmini gir!");

    const oyun = await AdamAsmaca.findOne({ channelId: message.channel.id });
    if (!oyun) return message.reply("Bu kanalda aktif bir oyun yok.");

    // ✅ KELİME DOĞRUDAN DOĞRUYSA
    if (tahmin === oyun.kelime) {
      await AdamAsmaca.deleteOne({ channelId: message.channel.id });
      return message.channel.send(`🎉 Tebrikler! Doğru kelimeydi: \`${oyun.kelime}\``);
    }

    // 🔤 EĞER SADECE 1 HARFSE
    if (tahmin.length === 1) {
      if (!/[a-zçğıöşü]/.test(tahmin)) return message.reply("Geçerli bir harf gir!");
      if (oyun.gösterilen.includes(tahmin) || oyun.yanlışlar.includes(tahmin)) {
        return message.reply("Bu harfi zaten denedin.");
      }

      if (oyun.kelime.includes(tahmin)) {
        for (let i = 0; i < oyun.kelime.length; i++) {
          if (oyun.kelime[i] === tahmin) oyun.gösterilen[i] = tahmin;
        }

        if (!oyun.gösterilen.includes("_")) {
          await AdamAsmaca.deleteOne({ channelId: message.channel.id });
          return message.channel.send(`🎉 Tebrikler! Kelime tamamlandı: \`${oyun.kelime}\``);
        } else {
          await oyun.save();
          return message.channel.send(`✅ Doğru harf! Kelime: \`${oyun.gösterilen.join(" ")}\``);
        }
      } else {
        oyun.yanlışlar.push(tahmin);
        oyun.deneme++;

        if (oyun.deneme >= 6) {
          await AdamAsmaca.deleteOne({ channelId: message.channel.id });
          return message.channel.send(`😵 Adam asıldı! Kelime: \`${oyun.kelime}\``);
        } else {
          await oyun.save();
          return message.channel.send(`❌ Yanlış harf! (${oyun.deneme}/6)\nKelime: \`${oyun.gösterilen.join(" ")}\`\nYanlışlar: \`${oyun.yanlışlar.join(", ")}\``);
        }
      }
    } else {
      // ❌ KELİME YANLIŞSA CEZA VER
      oyun.deneme++;
      if (oyun.deneme >= 6) {
        await AdamAsmaca.deleteOne({ channelId: message.channel.id });
        return message.channel.send(`😵 Yanlış tahmin! Adam asıldı.\nDoğru kelime: \`${oyun.kelime}\``);
      } else {
        await oyun.save();
        return message.channel.send(`❌ Yanlış kelime tahmini! (${oyun.deneme}/6 hakkın gitti)`);
      }
    }
  }
};
