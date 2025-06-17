const moment = require('moment-timezone');
const { getAyEvresi } = require('./dolunay'); // Bu fonksiyon dışa aktarılıyor olmalı

const SES_KANALI_ID = '1383822441750724669'; // Ses kanalının ID'si

async function updateVoiceChannelName(client) {
  try {
    const channel = await client.channels.fetch(SES_KANALI_ID);

    // ✅ v13 için doğru kanal tipi kontrolü
    if (!channel || channel.type !== 'GUILD_VOICE') {
      console.error("Ses kanalı bulunamadı veya tipi GUILD_VOICE değil.");
      return;
    }

    const ayDurumu = getAyEvresi(); 
    const yeniIsim = `🌕 Dolunay %${ayDurumu.ışık}`;

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
