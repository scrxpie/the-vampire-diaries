const AllowedChannel = require('../../models/AllowedChannel');

module.exports = {
  name: 'kategoriekle',
  description: 'Belirtilen kategori kanalını kelime sayımı için izinli hale getirir.',
  usage: '.kategoriekle <kategoriID>',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Bu komutu kullanmak için `Sunucuyu Yönet` yetkisine sahip olmalısınız.');
    }

    const categoryId = args[0];
    if (!categoryId) {
      return message.reply('Lütfen bir kategori ID\'si girin.');
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== 'GUILD_CATEGORY') {
      return message.reply('Geçerli bir kategori ID\'si girin.');
    }

    try {
      const existing = await AllowedChannel.findOne({ channelId: categoryId });
      if (existing) {
        return message.reply('Bu kategori zaten izinli olarak eklenmiş.');
      }

      await AllowedChannel.create({ channelId: categoryId, type: 'category' });
      message.reply(`✅ \`${category.name}\` adlı kategori başarıyla kelime takibi için eklendi.`);
    } catch (err) {
      console.error('Kategori eklenirken hata:', err);
      message.reply('Kategori eklenirken bir hata oluştu.');
    }
  }
};
