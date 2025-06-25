const { getAyEvresi } = require('./dolunay');

const SES_KANALI_ID = '1387508398123122727';

async function updateVoiceChannelName(client) {
  try {
    const channel = await client.channels.fetch(SES_KANALI_ID);
    if (!channel || channel.type !== 'GUILD_VOICE') {
      console.error("Ses kanalı bulunamadı veya tip hatası.");
      return;
    }

    const ayDurumu = getAyEvresi();
    const yeniIsim = `🌙 Ay %${ayDurumu.ışık}`;

    if (channel.name !== yeniIsim) {
      await channel.setName(yeniIsim);
      console.log(`Ses kanalı adı güncellendi: ${yeniIsim}`);
    }
  } catch (err) {
    console.error("Ses kanalı adı güncellenirken hata:", err);
  }
}

module.exports = { updateVoiceChannelName };
