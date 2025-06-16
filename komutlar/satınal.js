const { MessageEmbed } = require('discord.js');
const Balance = require('../../models/Balance');
const Inventory = require('../../models/Inventory');

module.exports = {
    name: 'satınal',
    description: 'Belirtilen ürünü satın alırsınız.',
    usage: '.satınal <ürün adı> <miktar>',
    async execute(message, args) {
        // Miktar argümanını al, yoksa 1 olsun
        const amountArg = args[args.length - 1];
        let amount = 1;
        if (!isNaN(amountArg)) {
            amount = Math.max(1, Math.min(parseInt(amountArg), 99));
            args.pop();
        }

        const itemName = args.join(' ');
        if (!itemName) {
            const embed = new MessageEmbed()
                .setTitle('Hata')
                .setDescription(" Satın almak istediğin ürünün adını yazmalısın. Örnek: `.satınal Spor Araba 2`")
                .setColor('#FF0000');
            return message.channel.send({ embeds: [embed] });
        }

        // Orijinal ürünler fiyatları ile
        const items = [
            { name: "Eski Model Araba", price: 20000 },
            { name: "Standart Araba", price: 30000 },
            { name: "Motosiklet", price: 18000 },
            { name: "Spor Araba", price: 45000 },

            { name: "1+0 Apartman", price: 50000 },
            { name: "1+1 Apartman", price: 60000 },
            { name: "2+1 Apartman", price: 70000 },
            { name: "3+1 Apartman", price: 80000 },
            { name: "Müstakil Ev", price: 100000 },
            { name: "Dublex Ev", price: 150000 },
            { name: "Orman Evi", price: 125000 },
            { name: "Dağ Evi", price: 100000 },
            { name: "Villa", price: 200000 },

            { name: "Normal Mermi", price: 500 },
            { name: "Gümüş Mermi", price: 7500 },
            { name: "Sarı Kurtboğanlı Mermi", price: 7500 },
            { name: "Kurtboğanlı Mermi", price: 7500 },
            { name: "Ok", price: 500 },

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
            { name: "Dağ Külü (5 kişilik)", price: 10000 },
            { name: "Kurtboğan", price: 1500 },
            { name: "Sarı Kurtboğan", price: 1500 },
            { name: "Kurtboğanlı Gaz Bombası", price: 7500 },

            { name: "Tabanca", price: 10000 },
            { name: "Yay", price: 30000 },
            { name: "Arbalet", price: 30000 },
            { name: "Kılıç/Katana", price: 12000 },
            { name: "Tüfek", price: 40000 },
            { name: "Pompalı Tüfek", price: 40000 },
            { name: "Makineli", price: 50000 },

            { name: "Gün Işığı Takıları", price: 1000 },
            { name: "Ay Işığı Takıları", price: 2000 },
            { name: "Gilbert Yüzüğü", price: 2500 }
        ];

        const foundItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (!foundItem) {
            const embed = new MessageEmbed()
                .setTitle('Ürün Bulunamadı')
                .setDescription("❌ Böyle bir ürün bulunamadı. Lütfen `.mağaza` komutuyla ürünleri kontrol et.")
                .setColor('#FF0000');
            return message.channel.send({ embeds: [embed] });
        }

        const price = foundItem.price;
        const pureName = foundItem.name;

        // Kullanıcı bakiyesi
        let userBalance = await Balance.findById(message.author.id);
        if (!userBalance) {
            const embed = new MessageEmbed()
                .setTitle('Bakiye Yok')
                .setDescription("❌ Henüz bir bakiyen yok.")
                .setColor('#FF0000');
            return message.channel.send({ embeds: [embed] });
        }

        const totalPrice = price * amount;
        if (userBalance.balance < totalPrice) {
            const embed = new MessageEmbed()
                .setTitle('Yetersiz Bakiye')
                .setDescription(` Bu ürünü almak için yeterli paran yok. Gerekli: **${totalPrice}$** (Adet: ${amount}), Senin bakiyen: **${userBalance.balance}$**`)
                .setColor('#FF0000');
            return message.channel.send({ embeds: [embed] });
        }

        // Para düş
        userBalance.balance -= totalPrice;
        await userBalance.save();

        // Envantere ekle (5x Spor Araba şeklinde tutacağız)
        let userInventory = await Inventory.findOne({ userId: message.author.id });
        if (!userInventory) {
            userInventory = new Inventory({ userId: message.author.id, items: [`${amount}x ${pureName}`] });
        } else {
            // Eğer aynı ürün varsa miktarı arttır
            let foundIndex = -1;
            for (let i = 0; i < userInventory.items.length; i++) {
                // items dizisindeki elemanlar "5x Spor Araba" veya "Spor Araba" şeklinde olabilir
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
                    // "Spor Araba" şeklindeyse 1 tane varsay ve miktarı arttır
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

        const embed = new MessageEmbed()
            .setTitle("Satın Alma Başarılı")
            .setDescription(` **${pureName}** adlı üründen **${amount}** adet başarıyla satın alındı.\n Toplam Ödeme: **${totalPrice}$**\n Kalan Bakiye: **${userBalance.balance}$**`)
            .setColor("#00FF00");
        return message.channel.send({ embeds: [embed] });
    }
};
