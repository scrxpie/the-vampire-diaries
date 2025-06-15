const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'hava',
  description: 'Belirttiğin şehrin güncel hava durumunu gösterir.',
  async execute(message, args) {
    const şehir = args.join(' ');
    const API_KEY = '286c4d58955214d3b4f1e34b4ef918cb'; // ← Buraya OpenWeatherMap API anahtarını yaz

    if (!şehir) {
      return message.reply('Lütfen bir şehir adı gir: `.hava İstanbul` gibi.');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(şehir)}&appid=${API_KEY}&units=metric&lang=tr`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      const durum = data.weather[0].description;
      const sıcaklık = data.main.temp;
      const hissedilen = data.main.feels_like;
      const nem = data.main.humidity;
      const rüzgar = data.wind.speed;
      const ikon = data.weather[0].icon;

      const embed = new MessageEmbed()
        .setTitle(`🌤️ ${şehir} - Güncel Hava Durumu`)
        .setDescription(`**${durum.toUpperCase()}**`)
        .addFields(
          { name: '🌡️ Sıcaklık', value: `${sıcaklık}°C (Hissedilen: ${hissedilen}°C)`, inline: true },
          { name: '💧 Nem', value: `${nem}%`, inline: true },
          { name: '💨 Rüzgar', value: `${rüzgar} m/s`, inline: true }
        )
        .setThumbnail(`http://openweathermap.org/img/wn/${ikon}@2x.png`)
        .setColor('#1E90FF')
        .setFooter({ text: 'OpenWeatherMap üzerinden alınmıştır.', iconURL: 'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png' })
        .setTimestamp();

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error.message);
      message.reply('❌ Hava durumu alınamadı. Şehir adını doğru yazdığından emin misin?');
    }
  }
};
