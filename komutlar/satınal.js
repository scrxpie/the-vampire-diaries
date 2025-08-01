const { MessageEmbed } = require('discord.js');
const Balance = require('../models/Balance');
const Inventory = require('../models/Inventory');

module.exports = {
    name: 'satınal',
    description: 'Belirtilen ürünü satın alırsınız.',
    usage: '.satınal <ürün adı> <miktar>',
    async execute(message, args) {
        const amountArg = args[args.length - 1];
        let amount = 1;
        if (!isNaN(amountArg)) {
            amount = Math.max(1, Math.min(parseInt(amountArg), 99));
            args.pop();
        }

        const itemName = args.join(' ');
        if (!itemName) {
            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('Hata')
                    .setDescription(" Satın almak istediğin ürünün adını yazmalısın. Örnek: `.satınal Spor Araba 2`")
                    .setColor('#FF0000')]
            });
        }

        const items = [
            // 🚗 Araçlar
            { name: "Motorlar", price: 20000 },
            { name: "Eski Model Araba", price: 30000 },
            { name: "Standart Araba", price: 40000 },
            { name: "Spor Araba", price: 50000 },

            // 🏠 Evler
            { name: "Müstakil Ev", price: 50000 },
            { name: "Dublex Ev", price: 60000 },
            { name: "Orman Evi", price: 70000 },
            { name: "Dağ Evi", price: 80000 },
            { name: "Villa", price: 200000 },
            { name: "Malikane", price: 500000 },

            // ⚠️ Ateşli Silahlar & Mühimmat
            { name: "Tabanca", price: 15000 },
            { name: "Tüfek", price: 30000 },
            { name: "Pompalı Tüfek", price: 40000 },
            { name: "Normal Mermi", price: 300 },
            { name: "Tahta Mermi", price: 500 },
            { name: "Gümüş Mermi", price: 750 },

            // 🏹 Uzaktan Silahlar & Oklar
            { name: "Normal Yay", price: 10000 },
            { name: "Gümüş Uçlu Ok", price: 1000 },
            { name: "Tahta Uçlu Ok", price: 750 },
            { name: "Normal Ok", price: 500 },

            // 🗡️ Yakın Dövüş
            { name: "Gümüş Bıçak", price: 5000 },
            { name: "Gümüş Kazık", price: 7000 },
            { name: "Tahta Kazık", price: 3000 },
            { name: "İblis Bıçağı", price: 100000 },

            // 🌿 Doğa Temelli
            { name: "Mine Otu", price: 500 },
            { name: "Mine Bombası", price: 1500 },
            { name: "Mine Şırıngası", price: 1000 },
            { name: "Kurtboğan", price: 500 },
            { name: "Kurtboğan Bombası", price: 1500 },
            { name: "Kurtboğan Şırıngası", price: 1000 },

            // 🛠️ Diğer Ekipmanlar
            { name: "EMF Ölçer", price: 1750 },
            { name: "Tuz Paketi", price: 250 },
            { name: "Gümüş Zincirler", price: 700 },
            { name: "Kürek", price: 1250 },
            { name: "Benzin Bidonu", price: 500 },

            // ✨ Ritüel & Büyü
            { name: "Ritüel Paketi", price: 5000 },
            { name: "Muska", price: 1000 },
            { name: "Haç", price: 1000 },
            { name: "Tesbih", price: 1000 },

            // 💍 Takılar
            { name: "Gün Işığı Takıları", price: 5000 },
            { name: "Ay Işığı Takıları", price: 10000 },
            { name: "Gilbert Yüzüğü", price: 50000 }
        ];

        const foundItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (!foundItem) {
            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('Ürün Bulunamadı')
                    .setDescription("❌ Böyle bir ürün bulunamadı. Lütfen `.mağaza` komutuyla ürünleri kontrol et.")
                    .setColor('#FF0000')]
            });
        }

        const price = foundItem.price;
        const pureName = foundItem.name;

        let userBalance = await Balance.findById(message.author.id);
        if (!userBalance) {
            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('Bakiye Yok')
                    .setDescription("❌ Henüz bir bakiyen yok.")
                    .setColor('#FF0000')]
            });
        }

        const totalPrice = price * amount;
        if (userBalance.balance < totalPrice) {
            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setTitle('Yetersiz Bakiye')
                    .setDescription(` Bu ürünü almak için yeterli paran yok.\nGerekli: **${totalPrice}$** (Adet: ${amount})\nSenin bakiyen: **${userBalance.balance}$**`)
                    .setColor('#FF0000')]
            });
        }

        userBalance.balance -= totalPrice;
        await userBalance.save();

        let userInventory = await Inventory.findOne({ userId: message.author.id });
        if (!userInventory) {
            userInventory = new Inventory({
                userId: message.author.id,
                items: [`${amount}x ${pureName}`]
            });
        } else {
            let foundIndex = -1;
            for (let i = 0; i < userInventory.items.length; i++) {
                const item = userInventory.items[i];
                const regex = /^(\d+)x (.+)$/;
                const match = item.match(regex);
                if (match) {
                    const existingAmount = parseInt(match[1]);
                    const existingName = match[2];
                    if (existingName.toLowerCase() === pureName.toLowerCase()) {
                        userInventory.items[i] = `${existingAmount + amount}x ${pureName}`;
                        foundIndex = i;
                        break;
                    }
                } else if (item.toLowerCase() === pureName.toLowerCase()) {
                    userInventory.items[i] = `${1 + amount}x ${pureName}`;
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex === -1) {
                userInventory.items.push(`${amount}x ${pureName}`);
            }
        }

        await userInventory.save();

        return message.channel.send({
            embeds: [new MessageEmbed()
                .setTitle("Satın Alma Başarılı")
                .setDescription(`**${pureName}** adlı üründen **${amount}** adet başarıyla satın alındı.\nToplam Ödeme: **${totalPrice}$**\nKalan Bakiye: **${userBalance.balance}$**`)
                .setColor("#00FF00")]
        });
    }
};
