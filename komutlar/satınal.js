const Balance = require('../models/Balance');
const Inventory = require('../models/Inventory');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'satınal',
    description: 'Belirtilen ürünü satın alırsınız.',
    usage: '.satınal <ürün adı> [adet]',
    async execute(message, args) {
        const itemCountArg = args[args.length - 1];
        let count = 1;
        let itemName;

        if (!isNaN(itemCountArg)) {
            count = parseInt(itemCountArg);
            itemName = args.slice(0, -1).join(' ');
        } else {
            itemName = args.join(' ');
        }

        if (!itemName) {
            return message.reply(" Satın almak istediğin ürünün adını yazmalısın. Örnek: `.satınal Spor Araba 2`");
        }

        // Tüm mağaza ürünleri
        const items = [
            "Eski Model Araba - 20000$",
            "Standart Araba - 30000$",
            "Motosiklet - 18000$",
            "Spor Araba - 45000$",
            "1+0 Apartman - 50000$",
            "1+1 Apartman - 60000$",
            "2+1 Apartman - 70000$",
            "3+1 Apartman - 80000$",
            "Müstakil Ev - 100000$",
            "Dublex Ev - 150000$",
            "Orman Evi - 125000$",
            "Dağ Evi - 100000$",
            "Villa - 200000$",
            "Normal Mermi - 500$",
            "Gümüş Mermi - 7500$",
            "Sarı Kurtboğanlı Mermi - 7500$",
            "Kurtboğanlı Mermi - 7500$",
            "Ok - 500$",
            "Elektrikli Şok Cihazı - 5000$",
            "Kurşun Tuzakları - 2500$",
            "Zincirler - 1500$",
            "Işıklı Tuzak - 2500$",
            "Banshee Günlüğü - 5000$",
            "Bestiary - 8000$",
            "Druid Ritüel Kitabı - 10000$",
            "Triskelion - 12000$",
            "Kurtboğanlı İğne - 3000$",
            "Zayıf Noktalar Kitabı - 15000$",
            "Dağ Külü (5 kişilik) - 10000$",
            "Kurtboğan - 1500$",
            "Sarı Kurtboğan - 1500$",
            "Kurtboğanlı Gaz Bombası - 7500$",
            "Tabanca - 10000$",
            "Yay - 30000$",
            "Arbalet - 30000$",
            "Kılıç/Katana - 12000$",
            "Tüfek - 40000$",
            "Pompalı Tüfek - 40000$",
            "Makineli - 50000$",
            "Gün Işığı Takıları - 1000$",
            "Ay Işığı Takıları - 2000$",
            "Gilbert Yüzüğü - 2500$"
        ];

        const foundItem = items.find(item => item.toLowerCase().startsWith(itemName.toLowerCase()));
        if (!foundItem) {
            const embed = new MessageEmbed()
                .setTitle("❌ Ürün Bulunamadı")
                .setDescription("Böyle bir ürün bulunamadı. Lütfen `.mağaza` komutuyla ürünleri kontrol et.")
                .setColor("#FF0000");
            return message.reply({ embeds: [embed] });
        }

        const priceMatch = foundItem.match(/- (\d+)\$/);
        if (!priceMatch) {
            const embed = new MessageEmbed()
                .setTitle("❌ Hata")
                .setDescription("Ürünün fiyatı okunamadı. Lütfen yöneticilere bildir.")
                .setColor("#FF0000");
            return message.reply({ embeds: [embed] });
        }

        const price = parseInt(priceMatch[1]);
        const pureName = foundItem.split(' - ')[0];

        let userBalance = await Balance.findById(message.author.id);
        if (!userBalance) {
            const embed = new MessageEmbed()
                .setTitle("❌ Bakiye Yok")
                .setDescription("Henüz bir bakiyen yok. Para kazanmak için görev yap veya maaş al.")
                .setColor("#FF0000");
            return message.reply({ embeds: [embed] });
        }

        const totalPrice = price * count;

        if (userBalance.balance < totalPrice) {
            const embed = new MessageEmbed()
                .setTitle(" Yetersiz Bakiye")
                .setDescription(`Bu ürünü **${count}** adet almak için yeterli paran yok.\nGerekli: **${totalPrice}$**, Senin bakiyen: **${userBalance.balance}$**`)
                .setColor("#FF0000");
            return message.reply({ embeds: [embed] });
        }

        userBalance.balance -= totalPrice;
        await userBalance.save();

        let userInventory = await Inventory.findOne({ userId: message.author.id });
        if (!userInventory) {
            userInventory = new Inventory({ userId: message.author.id, items: [`${count}x ${pureName}`] });
        } else {
            // Eğer envanterde aynı ürün varsa sayıyı artır
            let foundIndex = userInventory.items.findIndex(i => i.toLowerCase().includes(pureName.toLowerCase()));
            if (foundIndex !== -1) {
                // Örneğin: "2x Spor Araba" -> önceki sayıyı bulup artırıyoruz
                const oldEntry = userInventory.items[foundIndex];
                const matchCount = oldEntry.match(/^(\d+)x (.+)$/i);
                if (matchCount) {
                    let oldCount = parseInt(matchCount[1]);
                    userInventory.items[foundIndex] = `${oldCount + count}x ${pureName}`;
                } else {
                    // Eğer format farklıysa direkt yenisini ekle
                    userInventory.items[foundIndex] = `${count}x ${pureName}`;
                }
            } else {
                userInventory.items.push(`${count}x ${pureName}`);
            }
        }
        await userInventory.save();

        const embed = new MessageEmbed()
            .setTitle("✅ Satın Alma Başarılı")
            .setDescription(`**${pureName}** ürününden **${count}** adet başarıyla satın alındı!\nKalan bakiyen: **${userBalance.balance}$**`)
            .setColor("#00FF00");
        return message.reply({ embeds: [embed] });
    }
};
