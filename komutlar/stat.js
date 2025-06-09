const Stats = require('../models/Stat');
const generateStatCard = require('../utils/statCard');

module.exports = {
  name: "stat",
  description: "Statlarını görsel kart olarak gösterir.",
  async execute(message) {
    const statVerisi = await Stats.findById(message.author.id);
    if (!statVerisi) {
      return message.reply("Stat verin yok. `.statal` komutuyla kelimelerini stata çevirebilirsin.");
    }

    const cardBuffer = await generateStatCard(message.author, statVerisi);
    return message.channel.send({ files: [{ attachment: cardBuffer, name: "stat.png" }] });
  }
}
