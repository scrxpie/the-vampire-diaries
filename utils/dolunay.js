const moment = require('moment-timezone');
const { MessageEmbed } = require('discord.js');

function getSonrakiCumartesiSaat21(reference) {
  // Verilen zamandan sonraki cumartesi 21:00'ı bul
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  if (cumartesi.isBefore(reference)) cumartesi.add(7, 'days');
  return cumartesi;
}

function getOncekiCumartesiSaat21(reference) {
  // Verilen zamandan önceki cumartesi 21:00
  const cumartesi = reference.clone().day(6).hour(21).minute(0).second(0).millisecond(0);
  if (cumartesi.isAfter(reference)) cumartesi.subtract(7, 'days');
  return cumartesi;
}

// Ay evresi oran hesaplama
function getAyEvresi() {
  const now = moment().tz("Europe/Istanbul");

  // Önceki ve sonraki cumartesi 21:00
  const oncekiCumartesi = getOncekiCumartesiSaat21(now);
  const sonrakiCumartesi = getSonrakiCumartesiSaat21(now);

  // Dolunay bitişi: Pazar 23:59 (onceki cumartesi + 2 gün + 2 saat 59 dakika)
  const dolunayBitis = oncekiCumartesi.clone().add(2, 'days').hour(23).minute(59).second(59);

  let oran;
  if (now.isBetween(oncekiCumartesi, dolunayBitis, null, '[]')) {
    // Dolunay zamanı: oran %100
    oran = 100;
  } else if (now.isAfter(dolunayBitis) && now.isBefore(sonrakiCumartesi)) {
    // Dolunay sonrası hızlı azalış:
    // Dolunay bitişi ile sonraki cumartesi 21:00 arası süre (ms)
    const toplamMs = sonrakiCumartesi.diff(dolunayBitis);
    const gecenMs = now.diff(dolunayBitis);

    // Oran hızlı azalıyor 100'den 0'a
    oran = Math.floor(100 * (1 - gecenMs / toplamMs));
  } else if (now.isBefore(oncekiCumartesi)) {
    // Önceki dolunaydan önceki hafta, oran artıyor sıfırdan 100'e (artış kısmı)
    // Önceki cumartesi - 14 gün (yani önceki dolunay başlangıcı)
    const oncekiDolunayBaslangic = oncekiCumartesi.clone().subtract(14, 'days');

    const toplamMs = oncekiCumartesi.diff(oncekiDolunayBaslangic);
    const gecenMs = now.diff(oncekiDolunayBaslangic);

    oran = Math.floor(100 * (gecenMs / toplamMs));
  } else {
    // Dolunay öncesi artış kısmı (dolunay öncesi son 14 gün)
    const dolunayBaslangic = sonrakiCumartesi.clone().subtract(14, 'days');

    const toplamMs = sonrakiCumartesi.diff(dolunayBaslangic);
    const gecenMs = now.diff(dolunayBaslangic);

    oran = Math.floor(100 * (gecenMs / toplamMs));
  }

  // Güvenlik için sınırla
  if (oran > 100) oran = 100;
  if (oran < 0) oran = 0;

  // Kalan süre bir sonraki dolunaya
  let kalanMs = sonrakiCumartesi.diff(now);
  if (kalanMs < 0) kalanMs = 0;

  const kalanGün = Math.floor(kalanMs / (1000 * 60 * 60 * 24));
  const kalanSaat = Math.floor((kalanMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const kalanText = `${kalanGün} gün ${kalanSaat} saat`;

  // Yazı oluştur
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

function createPanoEmbed() {
  const ayDurumu = getAyEvresi();

  const embed = new MessageEmbed()
    .setTitle("🌙 Ay Durumu ve Pano Sistemi")
    .addField("Ay Evresi", ayDurumu.yazı, true)
    .addField("Süre", ayDurumu.kalan, true)
    .setColor("#8e44ad")
    .setTimestamp();

  return embed;
}

module.exports = {
  getAyEvresi,
  createPanoEmbed
};
