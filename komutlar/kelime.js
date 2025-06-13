const { MessageEmbed } = require('discord.js');
const Words = require('../models/Words');
const AllowedCategory = require('../models/AllowedCategory');

// Kategorileri MongoDB'den çek
async function getAllowedCategories() {
  try {
    const categories = await AllowedCategory.find({});
    return categories.map(c => c.categoryId);
  } catch (err) {
    console.error('İzinli kategoriler alınamadı:', err);
    return [];
  }
}

async function trackWords(message) {
  if (message.author.bot) return;

  let channel = message.channel;
  let parentId = channel.parentId; // Kategorisi

  // Thread ise ana kanalını al
  if (channel.isThread()) {
    channel = channel.parent;
    parentId = channel.parentId;
  }

  const allowedCategories = await getAllowedCategories();
  if (!parentId || !allowedCategories.includes(parentId)) return;

  const userId = message.author.id;
  const content = message.content.trim();
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) return;

  try {
    await Words.findByIdAndUpdate(
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
  } catch (err) {
    console.error('Kelime verisi MongoDB\'ye yazılırken hata:', err);
  }
}

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
    console.error('Veri okunamadı:', err);
    message.reply('Veri okunurken bir hata oluştu.');
  }
}

module.exports = {
  name: 'kelime',
  description: 'Kullanıcının veya bir başkasının toplam kelime sayısını gösterir.',
  async execute(message, args) {
    const targetUser = message.mentions.users.first();
    await showWords(message, targetUser);
  },
  async messageCreate(message) {
    await trackWords(message);
  },
};
