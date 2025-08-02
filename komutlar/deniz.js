const { MessageEmbed } = require('discord.js');
const musicIcons = require('../icons.js');  // icons.js dosyasını import ettik

module.exports = {
  name: "deniz",  // Komut ismi
  description: "",  // Komut açıklaması
  execute(message) {
    const embed = new MessageEmbed()
      .setColor('#ffffff') // Koyu kırmızı renk
      .setTitle('Leader of the Wolves ')  // Başlık
      .setDescription('')  // Açıklama
      .setFooter('Deniz.', musicIcons.heartIcon)  // Footer metni ve iconu
      .setTimestamp()  // Zaman damgası
      .setImage('https://cdn.discordapp.com/attachments/1288593663802343434/1376605559494807676/2d3fdd09ff0f301940a8e958fd580376.gif')
    return message.channel.send({ embeds: [embed] });  // Embed mesajı gönder
  }
};
