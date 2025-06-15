const axios = require('axios');
const cron = require('node-cron');
const { MessageEmbed } = require('discord.js');

const API_KEY = '286c4d58955214d3b4f1e34b4ef918cb'; // ← OpenWeatherMap API anahtarını buraya yaz
const ŞEHİR = 'Los Angeles';    // Beacon Hills yerine gerçek şehir
const KANAL_ID = '1383755559144132638';    // Hava durumunun gönderileceği kanalın ID'si

function havaDurumuEmbed(data) {
  const durum = data.weather[0].description;
  const sıcaklık = data.main.temp;
  const hissedilen = data.main.feels_like;
  const nem = data.main.humidity;
  const rüzgar = data.wind.speed;
  const ikon = data.weather[0].icon;

  return new MessageEmbed()
    .setTitle(`🌤️ Beacon Hills - Günlük Hava Durumu`)
    .setDescription(`**${durum.toUpperCase()}**`)
    .addFields(
      { name: '🌡️ Sıcaklık', value: `${sıcaklık}°C (Hissedilen: ${hissedilen}°C)`, inline: true },
      { name: '💧 Nem', value: `${nem}%`, inline: true },
      { name: '💨 Rüzgar', value: `${rüzgar} m/s`, inline: true }
    )
    .setThumbnail(`http://openweathermap.org/img/wn/${ikon}@2x.png`)
    .setColor('#1E90FF')
    .setFooter({ text: 'OpenWeatherMap API kullanılarak güncellenmiştir.', iconURL: 'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png' })
    .setTimestamp();
}

module.exports = (client) => {
  cron.schedule('0 10 * * *', async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ŞEHİR)}&appid=${API_KEY}&units=metric&lang=tr`;
      const response = await axios.get(url);
      const embed = havaDurumuEmbed(response.data);

      const kanal = client.channels.cache.get(KANAL_ID);
      if (kanal) kanal.send({ embeds: [embed] });
      else console.error("Kanal bulunamadı.");

    } catch (err) {
      console.error("Hava durumu alınamadı:", err.message);
    }
  }, {
    timezone: "Europe/Istanbul"
  });
};
