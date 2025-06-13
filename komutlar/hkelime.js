const { MessageEmbed } = require('discord.js');
const WeeklyWords = require('../models/WeeklyWords');
const AllowedChannel = require('../models/AllowedChannel');

async function trackWords(message) {
  if (message.author.bot) return;

  let channel = message.channel;

  // Thread ise ana kanalı al
  if (channel.isThread()) {
    channel = channel.parent;
  }

  // İzin verilen kanalları ve kategorileri çek
  let docs;
  try {
    docs = await AllowedChannel.find({});
  } catch (error) {
    console.error('Kanal ve kategori ID\'leri veritabanından alınamadı:', error);
    return;
  }

  const allowedChannels = docs.filter(d => d.type === 'channel').map(d => d.channelId);
  const allowedCategories = docs.filter(d => d.type === 'category').map(d => d.channelId);

  const isChannelAllowed = allowedChannels.includes(channel.id);
  const isCategoryAllowed = channel.parentId && allowedCategories.includes(channel.parentId);

  if (!isChannelAllowed && !isCategoryAllowed) return;

  const userId = message.author.id;
  const content = message.content.trim();
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  if (wordCount === 0) return;

  // Kullanıcının haftalık verisini al veya oluştur
  let weeklyData = await WeeklyWords.findById(userId);
  if (!weeklyData) {
    weeklyData = new WeeklyWords({
      _id: userId,
      words: wordCount
    });
  } else {
    weeklyData.words += wordCount;
  }

  try {
    await weeklyData.save();
    console.log(`Kullanıcı ${message.author.username} (${userId}) ${wordCount} kelime yazdı. Haftalık: ${weeklyData.words}`);
  } catch (error) {
    console.error('Veritabanına yazılırken hata oluştu:', error);
  }
}

async function showWeeklyWords(message) {
  let userId = message.author.id;
  let username = message.author.username;

  const mentionedUser = message.mentions.users.first();
  if (mentionedUser) {
    userId = mentionedUser.id;
    username = mentionedUser.username;
  }

  let weeklyData;
  try {
    weeklyData = await WeeklyWords.findById(userId);
  } catch (error) {
    console.error('MongoDB verisi okunamadı:', error);
    return message.reply('Haftalık kelime veritabanı okunurken bir hata oluştu.');
  }

  const totalWeeklyWords = weeklyData?.words || 0;

  const embed = new MessageEmbed()
    .setColor('#ffffff')
    .setTitle('༒ Haftalık Kelime Sayısı')
    .setDescription(`${username} adlı kullanıcının haftalık kelime sayısı: **${totalWeeklyWords}**`)
    .setFooter({ text: '༒ | Kelime sistemi' })
    .setTimestamp()
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

  message.reply({ embeds: [embed] });
}

module.exports = {
  name: 'hkelime',
  description: 'Kullanıcının haftalık kelime sayısını gösterir.',
  async execute(message) {
    await showWeeklyWords(message);
  },
  messageCreate: async (message) => {
    await trackWords(message);
  }
};
