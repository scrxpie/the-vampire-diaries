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
    "normal mermi", "gümüş mermi", "tahta mermi", "sarı kurtboğanlı mermi", "kurtboğanlı mermi", "ok",
    "gümüş uçlu ok", "tahta uçlu ok", "normal ok",
    "mine otu", "mine bombası", "mine şırıngası",
    "kurtboğan", "kurtboğan bombası", "kurtboğan şırıngası",
    "ritüel paketi", "muska", "haç", "tesbih",
    "benzin bidonu",
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
            // Araçlar
            { name: "Motorlar", price: 20000 },
            { name: "Eski Model Araba", price: 30000 },
            { name: "Standart Araba", price: 40000 },
            { name: "Spor Araba", price: 50000 },

            // Evler
            { name: "Müstakil Ev", price: 50000 },
            { name: "Dublex Ev", price: 60000 },
            { name: "Orman Evi", price: 70000 },
            { name: "Dağ Evi", price: 80000 },
            { name: "Villa", price: 200000 },
            { name: "Malikane", price: 500000 },

            // Ateşli silahlar & mühimmat
            { name: "Tabanca", price: 15000 },
            { name: "Tüfek", price: 30000 },
            { name: "Pompalı Tüfek", price: 40000 },
            { name: "Normal Mermi", price: 300 },
            { name: "Tahta Mermi", price: 500 },
            { name: "Gümüş Mermi", price: 750 },

            // Uzaktan atış
            { name: "Normal Yay", price: 10000 },
            { name: "Gümüş Uçlu Ok", price: 1000 },
            { name: "Tahta Uçlu Ok", price: 750 },
            { name: "Normal Ok", price: 500 },

            // Yakın dövüş
            { name: "Gümüş Bıçak", price: 5000 },
            { name: "Gümüş Kazık", price: 7000 },
            { name: "Tahta Kazık", price: 3000 },
            { name: "İblis Bıçağı", price: 100000 },
            // Doğa temelli
            { name: "Mine Otu", price: 500 },
            { name: "Mine Bombası", price: 1500 },
            { name: "Mine Şırıngası", price: 1000 },
            { name: "Kurtboğan", price: 500 },
            { name: "Kurtboğan Bombası", price: 1500 },
            { name: "Kurtboğan Şırıngası", price: 1000 },

            // Diğer ekipmanlar
            { name: "EMF Ölçer", price: 1750 },
            { name: "Tuz Paketi", price: 250 },
            { name: "Gümüş Zincirler", price: 700 },
            { name: "Kürek", price: 1250 },
            { name: "Benzin Bidonu", price: 500 },

            // Ritüel ve büyü
            { name: "Ritüel Paketi", price: 5000 },
            { name: "Muska", price: 1000 },
            { name: "Haç", price: 1000 },
            { name: "Tesbih", price: 1000 },

            // Takılar
            { name: "Gün Işığı Takıları", price: 5000 },
            { name: "Ay Işığı Takıları", price: 10000 },
            { name: "Gilbert Yüzüğü", price: 50000 }
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

        const moneyToAdd = foundItem.price * amount;
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
