const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'mağaza',
    description: 'Mağaza kategorilerini gösterir.',
    execute(message) {
        const categories = {
    "Araçlar": [
        "Eski Model Araba - 30000$",
        "Standart Araba - 40000$",
        "Motosiklet - 20000$",
        "Spor Araba - 50000$"
    ],
    "Evler": [
        "**Müstakil Ev - 50000$**",
        "**Dublex Ev - 60000$**",
        "**Orman Evi - 70000$**",
        "**Dağ Evi - 80000$**",
        "**Villa - 200000$**",
         "**Malikane - 500000$** "
    ],
  
   "Teçhizatlar": [
                "**Tabanca - 15000**",
                "**Sonsuz Tahta Mermi - 10000**",
                "**Arbalet - 10000$**",
                "**Mine Çiçeği - 2000$**",
                "**Mine Bombası - 5000$**",
                "**Mine Şırıngası - 4000$**", 
                "**Kurtboğan - 2000**",
                "**Kurtboğan Bombası - 5000$**",
                "**Kurtboğan Şırıngası - 4000$**"
            ],
            "Takılar": [
                "**Gün Işığı Takıları - 5000$**",
                "**Ay Işığı Takıları - 10000$**",
                "**Gilbert Yüzüğü - 50000$**"
            ]
};

        const categoryImages = {
            "Araçlar": "https://i.imgur.com/5NjHuR0.gif",
            "Evler": "https://link-to-your-image.com/evler.jpg",
        
            "Takılar": "https://link-to-your-image.com/takilar.jpg"
        };

        const options = Object.keys(categories).map(category => ({
            label: category,
            description: `${category} ürünlerini görüntüle.`,
            value: category
        }));

        const embed = new MessageEmbed()
            .setTitle("Mağaza Menüsü")
            .setDescription("Bir kategori seçerek o kategoriye ait ürünleri görebilirsiniz.")
            .setColor("BLUE")
            .setFooter("Mağaza | Seçim yapmak için menüyü kullanın.");

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('mağaza_menu')
                .setPlaceholder('Kategori seçin...')
                .addOptions(options)
        );

        message.channel.send({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.customId === 'mağaza_menu' && interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', interaction => {
            const category = interaction.values[0];
            const products = categories[category].join('\n\n');

            const categoryEmbed = new MessageEmbed()
                .setTitle(category)
                .setDescription(products || "Bu kategoride ürün bulunmuyor.")
                .setColor("GREEN")
                .setImage(categoryImages[category] || null);

            interaction.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            message.channel.send("🕒 Mağaza menüsü süresi doldu. Tekrar kullanmak için `.mağaza` yazın.");
        });
    }
};
