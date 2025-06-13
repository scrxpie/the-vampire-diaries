const AllowedChannel = require('../models/AllowedChannel');

module.exports = {
  name: 'kanalekle',
  description: 'Bir kanal veya kategori ekler. Kullanım: !kanalekle #kanal veya !kanalekle kategori KategoriAdı',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Bu komutu kullanabilmek için yönetici iznine sahip olmalısınız.');
    }

    if (!args[0]) {
      return message.reply('Lütfen bir kanal, kategori belirtin veya "kategori" komutunu kullanın.');
    }

    if (args[0].toLowerCase() === 'kategori') {
      // Kategori ekleme
      const categoryName = args.slice(1).join(' ');
      if (!categoryName) {
        return message.reply('Lütfen eklemek istediğiniz kategori adını yazın.');
      }

      const category = message.guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === categoryName.toLowerCase());
      if (!category) {
        return message.reply('Belirtilen isimde kategori bulunamadı.');
      }

      const exists = await AllowedChannel.findOne({ channelId: category.id, type: 'category' });
      if (exists) {
        return message.reply('Bu kategori zaten izin verilenler listesinde.');
      }

      await AllowedChannel.create({ channelId: category.id, type: 'category' });
      return message.reply(`Kategori başarıyla eklendi: **${category.name}**`);
    } else {
      // Kanal ekleme
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Lütfen eklemek istediğiniz kanalı etiketleyin.');
      }

      const exists = await AllowedChannel.findOne({ channelId: channel.id, type: 'channel' });
      if (exists) {
        return message.reply('Bu kanal zaten izin verilenler listesinde.');
      }

      await AllowedChannel.create({ channelId: channel.id, type: 'channel' });
      return message.reply(`Kanal başarıyla eklendi: ${channel}`);
    }
  }
};
