const Balance = require('../models/Balance');

module.exports = {
  name: 'para-gönder',
  description: 'Başka bir kullanıcıya para gönderirsiniz.',
  async execute(message, args) {
    const senderId = message.author.id;
    const receiver = message.mentions.users.first();
    const amount = parseInt(args[1], 10);

    if (!receiver) return message.reply('Lütfen para göndermek istediğiniz kullanıcıyı etiketleyin.');
    if (receiver.id === senderId) return message.reply('Kendinize para gönderemezsiniz.');
    if (isNaN(amount) || amount <= 0) return message.reply('Lütfen geçerli bir para miktarı girin.');

    try {
      // Gönderen bakiye verisini bul veya oluştur
      let senderData = await Balance.findById(senderId);
      if (!senderData) {
        senderData = new Balance({ _id: senderId, balance: 0, bank: 0 });
        await senderData.save();
      }

      // Alıcı bakiye verisini bul veya oluştur
      let receiverData = await Balance.findById(receiver.id);
      if (!receiverData) {
        receiverData = new Balance({ _id: receiver.id, balance: 0, bank: 0 });
        await receiverData.save();
      }

      if (senderData.balance < amount) {
        return message.reply('Yeterli bakiyeniz yok.');
      }

      // Bakiyeleri güncelle
      senderData.balance -= amount;
      receiverData.balance += amount;

      await senderData.save();
      await receiverData.save();

      return message.reply(`${receiver.username} kullanıcısına başarıyla ${amount} para gönderildi.`);
    } catch (error) {
      console.error(error);
      return message.reply('Bir hata oluştu, para gönderilemedi.');
    }
  }
};
