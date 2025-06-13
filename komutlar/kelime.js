const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words');
const AllowedChannel = require('../models/AllowedChannel');

// Tüm izinli kanal ve kategori ID'lerini al
async function getAllowedChannelsAndCategories() {
  try {
    const data = await AllowedChannel.find({});
    const channelIds = data.filter(x => x.type === 'channel').map(x => x.channelId);
    const categoryIds = data.filter(x => x.type === 'category').map(x => x.channelId);
    return { channelIds, categoryIds };
  } catch (err) {
    console.error('İzinli kanal/kategori verisi alınamadı:', err);
    return { channelIds: [], categoryIds: [] };
  }
}

// Kelime sayımı fonksiyonu
async function trackWords(message) {
  if (message.author.bot) return;

  let channel = message.channel;
  let parentId = channel.parentId;

  if (channel.isThread()) {
    channel = channel.parent;
    parentId = channel.parentId;
  }

  const { channelIds, categoryIds } = await getAllowedChannelsAndCategories();

  const isAllowed =
    channelIds.includes(channel.id) ||
    (parentId && categoryIds.includes(parentId));

  if (!isAllowed) return;

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

// Embed ile toplam kelimeyi gösterir
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
