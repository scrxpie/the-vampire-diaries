const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');
const cron = require('node-cron');

const KANAL_ID = '1383822193087086623';
let panoMesajId = null;

// Cumartesi saat 21:00 zamanlarını 14 günlük aralıklarla hesapla
function getSonrakiCumartesiSaat21(reference) {
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  while (cumartesi.isBefore(reference)) {
    cumartesi.add(14, 'days'); // 14 günlük aralık
  }
  return cumartesi;
}

function getOncekiCumartesiSaat21(reference) {
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  while (cumartesi.isAfter(reference)) {
    cumartesi.subtract(14, 'days'); // 14 günlük aralık
  }
  return cumartesi;
}

function getAyEvresi() {
  const now = moment().tz("Europe/Istanbul");

  const oncekiCumartesi = getOncekiCumartesiSaat21(now);
  const sonrakiCumartesi = getSonrakiCumartesiSaat21(now);
  
  // Dolunay 2 gün sürüyor, bu kısmı sabit bırakabiliriz
  const dolunayBitis = oncekiCumartesi.clone().add(2, 'days').hour(23).minute(59).second(59);

  let oran;
  if (now.isBetween(oncekiCumartesi, dolunayBitis, null, '[]')) {
    oran = 100;
  } else if (now.isAfter(dolunayBitis) && now.isBefore(sonrakiCumartesi)) {
    const toplamMs = sonrakiCumartesi.diff(dolunayBitis);
    const gecenMs = now.diff(dolunayBitis);
    oran = Math.floor(100 * (1 - gecenMs / toplamMs));
  } else if (now.isBefore(oncekiCumartesi)) {
    const oncekiDolunayBaslangic = oncekiCumartesi.clone().subtract(14, 'days');
    const toplamMs = oncekiCumartesi.diff(oncekiDolunayBaslangic);
    const gecenMs = now.diff(oncekiDolunayBaslangic);
    oran = Math.floor(100 * (gecenMs / toplamMs));
  } else {
    const dolunayBaslangic = sonrakiCumartesi.clone().subtract(14, 'days');
    const toplamMs = sonrakiCumartesi.diff(dolunayBaslangic);
    const gecenMs = now.diff(dolunayBaslangic);
    oran = Math.floor(100 * (gecenMs / toplamMs));
  }

  oran = Math.max(0, Math.min(100, oran));

  let kalanMs = sonrakiCumartesi.diff(now);
  if (kalanMs < 0) kalanMs = 0;

  const kalanGün = Math.floor(kalanMs / (1000 * 60 * 60 * 24));
  const kalanSaat = Math.floor((kalanMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const kalanText = `${kalanGün} gün ${kalanSaat} saat`;

  let yazı;
  if (oran === 100) yazı = "Dolunay 🌕";
  else if (oran === 0) yazı = "Yeni Ay 🌑";
  else yazı = `Ay Işığı: ${oran} / 100`;

  return {
    ışık: oran,
    yazı,
    kalan: `Bir sonraki dolunaya: ${kalanText}`
  };
}

module.exports = (client) => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const kanal = await client.channels.fetch(KANAL_ID);
      if (!kanal || kanal.type !== 'GUILD_TEXT') {
        console.error('Metin kanalı bulunamadı veya türü uyumsuz.');
        return;
      }

      const ay = getAyEvresi();
      const simdi = moment().tz("Europe/Istanbul").format("DD MMMM YYYY HH:mm");

      const embed = new MessageEmbed()
        .setTitle("🌙 Ay Durumu ve Pano Sistemi")
        .addField("Ay Evresi", ay.yazı, true)
        .addField("Dolunay Oranı", `%${ay.ışık}`, true)
        .addField("Süre", ay.kalan, true)
        .addField("Güncellendi", simdi, false)
        .setColor("#8e44ad");

      if (!panoMesajId) {
        const mesajlar = await kanal.messages.fetch({ limit: 20 });
        const onceki = mesajlar.find(m => m.embeds.length && m.embeds[0].title === "🌙 Ay Durumu ve Pano Sistemi");

        if (onceki) {
          panoMesajId = onceki.id;
          await onceki.edit({ embeds: [embed] });
        } else {
          const gonderilen = await kanal.send({ embeds: [embed] });
          panoMesajId = gonderilen.id;
        }
        return;
      }

      const eskiMesaj = await kanal.messages.fetch(panoMesajId).catch(() => null);
      if (eskiMesaj) {
        await eskiMesaj.edit({ embeds: [embed] });
      } else {
        const yeniMesaj = await kanal.send({ embeds: [embed] });
        panoMesajId = yeniMesaj.id;
      }

    } catch (err) {
      console.error('Pano mesajı gönderilirken hata:', err);
    }
  }, {
    timezone: "Europe/Istanbul"
  });
};
