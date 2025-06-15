const moment = require('moment-timezone');
const { getAyEvresi } = require('./utils/dolunay');

const SES_KANALI_ID = '1383819827075879075'; // Ses kanalının ID'si

async function updateVoiceChannelName(client) {
  try {
    const channel = await client.channels.fetch(SES_KANALI_ID);
    if (!channel || channel.type !== 'voice') {
      console.error("Ses kanalı bulunamadı veya tip hatası.");
      return;
    }

    // getAyEvresi fonksiyonun saat bazlı dolunay yüzdesini içermeli
    const ayDurumu = getAyEvresi(); 

    // ayDurumu.ışık değeri saat bazlı %0-100 arası tam sayı olmalı
    const yeniIsim = `Dolunay %${ayDurumu.ışık}`; 

    if (channel.name !== yeniIsim) {
      await channel.setName(yeniIsim);
      console.log(`Ses kanalı ismi güncellendi: ${yeniIsim}`);
    }
  } catch (err) {
    console.error("Ses kanalı adı güncellenirken hata:", err);
  }
}

module.exports = {
  updateVoiceChannelName
};
