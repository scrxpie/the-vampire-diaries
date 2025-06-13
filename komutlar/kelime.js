const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words'); // kelime verisi modeli
const AllowedChannel = require('../models/AllowedChannel'); // yeni kanal modeli

// Kanalları MongoDB'den çeken yardımcı fonksiyon
async function getAllowedChannels() {
  try {
    const channels = await AllowedChannel.find({});
    return channels.map(c => c.channelId);
  } catch (err) {
    console.error('İzinli kanallar verisi alınamadı:', err);
    return [];
  }
}

// Mesaj geldiğinde çağrılır
async function trackWords(message) {
  if (message.author.bot) return;

  const allAllowed = await getAllowedChannels();

  let channelId = message.channel.id;
  if (message.channel.isThread()) {
    channelId = message.channel.parentId;
  }

  if (!allAllowed.includes(channelId)) return;

  await countWordsInChannel(message);
}

// MongoDB ile kelime verisini kaydeden fonksiyon
async function countWordsInChannel(message) {
  const userId = message.author.id;
  const content = message.content.trim();
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) return;

  try {
    const userData = await Words.findByIdAndUpdate(
      userId,
      {
        $inc: {
          words: wordCount,
          weeklyWords: wordCount,
          dailyWords: wordCount,
        },
        $max: {
          longestEmote: wordCount,
        },
        $set: {
          lastUpdate: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`Kullanıcı ${message.author.username} (${userId}) ${wordCount} kelime yazdı. Toplam: ${userData.words}`);
  } catch (err) {
    console.error('Kelime verisi MongoDB\'ye yazılırken hata:', err);
  }
}

// Toplam kelime sayısını gösteren embed fonksiyonu
async function showWords(message, targetUser) {
  const userId = targetUser ? targetUser.id : message.author.id;

  try {
    const userData = await Words.findById(userId);
    const totalWords = userData?.words || 0;

    const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setTitle('༒ Toplam Kelime Sayısı')
      .setDescription(`${targetUser ? targetUser.username : message.author.username} adlı kullanıcının toplam kelime sayısı: **${totalWords}**`)
      .setFooter({ text: '༒ | Kelime sistemi' })
      .setTimestamp()
      .setThumbnail((targetUser || message.author).displayAvatarURL({ dynamic: true }));

    message.reply({ embeds: [embed] });
  } catch (err) {
    console.error('MongoDB kelime verisi okunamadı:', err);
    message.reply('Kelime verisi okunurken bir hata oluştu.');
  }
}

module.exports = {
  name: 'kelime',
  description: 'Kullanıcının veya belirtilen bir kişinin toplam kelime sayısını gösterir.',
  async execute(message, args) {
    const requiredRole = 'RolePlay Üye';

    if (!message.member.roles.cache.some(role => role.name === requiredRole)) {
      return message.reply('Bu komutu kullanmak için RolePlaye katılın.');
    }

    const targetUser = message.mentions.users.first();
    if (targetUser && !message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('Başka bir kullanıcının kelime sayısını görmek için yetkiye sahip olmalısınız.');
    }

    await showWords(message, targetUser);
  },
  async messageCreate(message) {
    await trackWords(message);
  },
};
