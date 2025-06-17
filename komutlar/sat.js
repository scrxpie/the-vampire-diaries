const { MessageEmbed } = require('discord.js');
const Inventory = require('../models/Inventory');
const Balance = require('../models/Balance');

module.exports = {
    name: 'sat',
    description: 'Envanterinizdeki bir eşyayı satarsınız.',
    usage: '.sat <ürün adı> <miktar>',
    async execute(message, args) {
        if (args.length < 1) {
            return message.reply("❌ Lütfen satmak istediğin ürünün adını gir. Örnek: `.sat Spor Araba 1`");
        }

        const amountArg = args[args.length - 1];
        let amount = 1;
        if (!isNaN(amountArg)) {
            amount = Math.max(1, Math.min(parseInt(amountArg), 99));
            args.pop();
        }

        const itemName = args.join(' ').toLowerCase();

        const unsellableItems = [
            "normal mermi", "gümüş mermi", "sarı kurtboğanlı mermi", "kurtboğanlı mermi", "ok",
            "tabanca", "yay", "arbalet", "kılıç/katana", "tüfek", "pompalı tüfek", "makineli"
        ];

        if (unsellableItems.includes(itemName)) {
            const embed = new MessageEmbed()
                .setTitle("❌ Satılamaz Ürün")
                .setDescription("Bu ürün satılamaz. Mermi ve silahlar ikinci el olarak satılamaz.")
                .setColor("#FF0000");
            return message.channel.send({ embeds: [embed] });
        }

        const items = [
            { name: "Eski Model Araba", price: 30000 },
            { name: "Standart Araba", price: 40000 },
            { name: "Motosiklet", price: 20000 },
            { name: "Spor Araba", price: 50000 },
            { name: "1+0 Apartman", price: 50000 },
            { name: "1+1 Apartman", price: 60000 },
            { name: "2+1 Apartman", price: 70000 },
            { name: "3+1 Apartman", price: 80000 },
            { name: "Müstakil Ev", price: 100000 },
            { name: "Dublex Ev", price: 150000 },
            { name: "Orman Evi", price: 125000 },
            { name: "Dağ Evi", price: 100000 },
            { name: "Villa", price: 200000 },
            { name: "Elektrikli Şok Cihazı", price: 5000 },
            { name: "Kurşun Tuzakları", price: 2500 },
            { name: "Zincirler", price: 1500 },
            { name: "Işıklı Tuzak", price: 2500 },
            { name: "Banshee Günlüğü", price: 5000 },
            { name: "Bestiary", price: 8000 },
            { name: "Druid Ritüel Kitabı", price: 10000 },
            { name: "Triskelion", price: 12000 },
            { name: "Kurtboğanlı İğne", price: 3000 },
            { name: "Zayıf Noktalar Kitabı", price: 15000 },
            { name: "Üvez Tozu", price: 10000 },
            { name: "Kurtboğan", price: 1500 },
            { name: "Sarı Kurtboğan", price: 50000 },
            { name: "Kurtboğanlı Gaz Bombası", price: 7500 },
            { name: "Gün Işığı Takıları", price: 1000 },
            { name: "Ay Işığı Takıları", price: 2000 },
            { name: "Gilbert Yüzüğü", price: 2500 }
        ];

        const foundItem = items.find(i => i.name.toLowerCase() === itemName);
        if (!foundItem) {
            return message.reply("❌ Bu ürün bulunamadı veya satılamaz.");
        }

        const userInventory = await Inventory.findOne({ userId: message.author.id });
        if (!userInventory || !userInventory.items || userInventory.items.length === 0) {
            return message.reply("📦 Envanterin boş.");
        }

        let itemIndex = -1;
        for (let i = 0; i < userInventory.items.length; i++) {
            const item = userInventory.items[i];
            const regex = /^(\d+)x (.+)$/;
            const match = item.match(regex);
            if (match) {
                const itemAmount = parseInt(match[1]);
                const itemNameInInventory = match[2];
                if (itemNameInInventory.toLowerCase() === foundItem.name.toLowerCase()) {
                    if (itemAmount < amount) {
                        return message.reply(`❌ Envanterinde sadece **${itemAmount} adet** var.`);
                    }
                    if (itemAmount === amount) {
                        userInventory.items.splice(i, 1); // Tümü sil
                    } else {
                        userInventory.items[i] = `${itemAmount - amount}x ${foundItem.name}`;
                    }
                    itemIndex = i;
                    break;
                }
            } else if (item.toLowerCase() === foundItem.name.toLowerCase()) {
                if (amount > 1) {
                    return message.reply("❌ Bu üründen sadece 1 adet var.");
                }
                userInventory.items.splice(i, 1); // Tekil item
                itemIndex = i;
                break;
            }
        }

        if (itemIndex === -1) {
            return message.reply("❌ Bu ürün envanterinde bulunmuyor.");
        }

        await userInventory.save();

        const moneyToAdd = Math.floor((foundItem.price / 2) * amount);
        const balance = await Balance.findById(message.author.id);
        balance.balance += moneyToAdd;
        await balance.save();

        const embed = new MessageEmbed()
            .setTitle("🛒 Satış Başarılı")
            .setDescription(`✔️ **${foundItem.name}** adlı üründen **${amount} adet** başarıyla satıldı.\n💵 Kazanılan Para: **${moneyToAdd}$**\n🪙 Güncel Bakiye: **${balance.balance}$**`)
            .setColor("#00AAFF");
        return message.channel.send({ embeds: [embed] });
    }
};
