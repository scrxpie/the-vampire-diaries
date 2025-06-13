const AllowedChannel = require('../models/AllowedChannel');

module.exports = {
  name: 'kanalsil',
  description: 'Bir kanal veya kategori izin listesinden siler. Kullanım: .kanalsil #kanal veya .kanalsil kategori KategoriAdı',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanabilmek için yönetici iznine sahip olmalısınız.');
    }

    if (!args[0]) {
      return message.reply('Lütfen bir kanal veya kategori belirtin.');
    }

    if (args[0].toLowerCase() === 'kategori') {
      // Kategori silme
      const categoryName = args.slice(1).join(' ');
      if (!categoryName) {
        return message.reply('Lütfen silmek istediğiniz kategori adını yazın.');
      }

      const category = message.guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === categoryName.toLowerCase());
      if (!category) {
        return message.reply('Belirtilen isimde kategori bulunamadı.');
      }

      const deleted = await AllowedChannel.findOneAndDelete({ channelId: category.id, type: 'category' });
      if (!deleted) {
        return message.reply('Bu kategori izin verilenler listesinde bulunmamaktadır.');
      }

      return message.reply(`Kategori başarıyla silindi: **${category.name}**`);
    } else {
      // Kanal silme
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Lütfen silmek istediğiniz kanalı etiketleyin.');
      }

      const deleted = await AllowedChannel.findOneAndDelete({ channelId: channel.id, type: 'channel' });
      if (!deleted) {
        return message.reply('Bu kanal izin verilenler listesinde bulunmamaktadır.');
      }

      return message.reply(`Kanal başarıyla silindi: ${channel}`);
    }
  }
};
