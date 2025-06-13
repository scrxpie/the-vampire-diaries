const AllowedChannel = require('../../models/AllowedChannel');

module.exports = {
  name: 'kategorisil',
  description: 'Belirtilen kategori kanalını kelime sayım listesinden çıkarır.',
  usage: '.kategorisil <kategoriID>',
  async execute(message, args) {
    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Bu komutu kullanmak için `Sunucuyu Yönet` yetkisine sahip olmalısınız.');
    }

    const categoryId = args[0];
    if (!categoryId) {
      return message.reply('Lütfen silmek istediğiniz kategori ID\'sini girin.');
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== 'GUILD_CATEGORY') {
      return message.reply('Geçerli bir kategori ID\'si girin.');
    }

    try {
      const deleted = await AllowedChannel.findOneAndDelete({ channelId: categoryId, type: 'category' });
      if (!deleted) {
        return message.reply('Bu kategori listede bulunmuyor.');
      }

      message.reply(`🗑️ \`${category.name}\` adlı kategori başarıyla listeden silindi.`);
    } catch (err) {
      console.error('Kategori silinirken hata:', err);
      message.reply('Kategori silinirken bir hata oluştu.');
    }
  }
};
