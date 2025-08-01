const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'mağaza',
    description: 'Mağaza kategorilerini gösterir.',
    execute(message) {
        const categories = {
            "Evler・🏠": [
                "**Müstakil Ev – 50.000$**\nBağımsız yapısı sayesinde mahremiyet sunan, şehir merkezine yakın, sade bir yaşam alanıdır.",
                "**Dublex Ev – 60.000$**\nAlt ve üst kat olarak ikiye ayrılmış, aile yaşamına uygun geniş ve kullanışlı bir konuttur.",
                "**Orman Evi – 70.000$**\nDoğanın kalbinde, sessizlik ve huzur arayanlar için izole, rustik yapıda bir evdir.",
                "**Dağ Evi – 80.000$**\nYüksek bölgelerde, sert hava koşullarına dayanıklı, manzaralı ve korunaklı bir yaşam alanıdır.",
                "**Villa – 200.000$**\nLüks yaşam sunan, havuzlu ve geniş bahçeli, özel tasarımlı prestijli bir konuttur.",
                "**Malikane – 500.000$**\nTarihi ve soylu atmosfer taşıyan devasa mülktür."
            ],
            "Araçlar・🚗": [
                "**Motosiklet – 20.000$**\nHızlı manevra kabiliyetiyle kısa mesafe için ideal.",
                "**Eski Model Araba – 30.000$**\nKlasik tasarımlı nostaljik bir otomobil.",
                "**Standart Araba – 40.000$**\nKonforlu, yakıt verimli günlük araç.",
                "**Spor Araba – 50.000$**\nHız ve lüksü birleştiren performans aracı."
            ],
            "Ritüel ve Büyü Malzemeleri・✨": [
                "**Ritüel Paketi (Kan, Mum, Bitki) - 5.000$**\nİblis mühürleme, kutsama gibi ritüellerde kullanılır.",
                "**Muska - 1.000$**\nKoruma sağlar, etkisi türüne göre değişir.",
                "**Haç veya Tesbih - 1.000$**\nKutsal su ve olaylarda kullanılır."
            ],
            "Ateşli Silahlar ve Mühimmat・⚠️": [
                "**Tabanca - 15.000$**\nYakın mesafede etkili, temel savunma silahı.",
                "**Tüfek - 30.000$**\nZırhlı hedeflere karşı etkili, uzun menzilli.",
                "**Pompalı Tüfek - 40.000$**\nYakın alanda yıkıcı etki sağlar.",
                "**Normal Mermi - 300$**\nİnsanlar ve zayıf varlıklar için etkili.",
                "**Tahta Mermi - 500$**\nVampirlere karşı özel etkili mühimmat.",
                "**Gümüş Mermi - 750$**\nKurtadam ve şekil değiştiricilere karşı."
            ],
            "Uzaktan Atış Silahları ve Oklar・🏹": [
                "**Normal Yay - 10.000$**\nGizli görevler için sessiz silah.",
                "**Gümüş Uçlu Ok - 1000$**\nKurtadamları içten zayıflatır.",
                "**Tahta Uçlu Ok - 750$**\nVampirleri geçici felç eder.",
                "**Normal Ok - 500$**\nDikkat dağıtmak için kullanılır."
            ],
            "Yakın Dövüş Silahları・🗡️": [
                "**Gümüş Bıçak - 5.000$**\nKurtadamlar ve lanetlilere karşı yakın dövüşte etkilidir.",
                "**Gümüş Kazık - 7.000$**\nVampir ve hybridleri yok etmek için kullanılır.",
                "**Tahta Kazık - 3.000$**\nVampirlerin kalbine saplandığında öldürür."
            ],
            "Doğa Temelli Silahlar ve Maddeler・🌿": [
                "**Mine Otu - 500$**\nVampirleri zayıflatır, çeşitli yollarla verilebilir.",
                "**Mine Bombası - 1500$**\nEtki alanına mine otu yayar.",
                "**Mine Şırıngası - 1000$**\nVampirlere enjekte edilir, bayıltır.",
                "**Kurtboğan - 500$**\nKurtadamların sinir sistemini etkiler.",
                "**Kurtboğan Bombası - 1500$**\nOrtamı etkisizleştirir.",
                "**Kurtboğan Şırıngası - 1000$**\nAğır yaralanma ve bayılma etkisi yaratır."
            ],
            "Diğer Ekipmanlar ve Araçlar・🛠️": [
                "**EMF Ölçer - 1.750$**\nPsişik aktiviteleri tespit eder.",
                "**Tuz Paketi - 250$**\nRuhlara ve iblislere karşı savunma sağlar.",
                "**Gümüş Zincirler - 700$**\nKurtadamları ve iblisleri bağlamak için kullanılır.",
                "**Kürek - 1.250$**\nMezar, kutsal mühür kazımı için kullanılır.",
                "**Benzin Bidonu - 500$**\nRitüel alanlarını yakmak için kullanılır."
            ],
            "Takılar・💍": [
                "**Gün Işığı Takıları - 5.000$**\nBazı varlıklara karşı savunma sağlar.",
                "**Ay Işığı Takıları - 10.000$**\nGece avcılığı için güçlendiricidir.",
                "**Gilbert Yüzüğü - 50.000$**\nNesiller boyunca korunmuş efsanevi yüzük."
            ]
        };

        const categoryImages = {
            "Evler・🏠": "https://i.imgur.com/IUuEEnH.jpeg",
            "Araçlar・🚗": "https://i.imgur.com/5NjHuR0.gif",
            "Takılar・💍": "https://i.imgur.com/d84DYvI.jpeg",
            "Ateşli Silahlar ve Mühimmat・⚠️": "https://i.imgur.com/sTq6YqW.jpeg",
            "Ritüel ve Büyü Malzemeleri・✨": "https://i.imgur.com/Cltn30O.jpeg",
            "Doğa Temelli Silahlar ve Maddeler・🌿": "https://i.imgur.com/WyOa2pa.jpeg",
            "Uzaktan Atış Silahları ve Oklar・🏹": "https://i.imgur.com/MKH9LRd.jpeg",
            "Yakın Dövüş Silahları・🗡️": "https://i.imgur.com/W6RTET4.jpeg",
            "Diğer Ekipmanlar ve Araçlar・🛠️": "https://i.imgur.com/1S9RMCe.jpeg"
        };

        const options = Object.keys(categories).map(category => ({
            label: category,
            description: `${category.split("・")[0]} kategorisini görüntüle.`,
            value: category
        }));

        const embed = new MessageEmbed()
            .setTitle("🛒 Mağaza Menüsü")
            .setDescription("Bir kategori seçerek o kategoriye ait ürünleri görebilirsiniz.")
            .setColor("BLUE")
            .setFooter({ text: "Mağaza | Seçim yapmak için menüyü kullanın." });

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('mağaza_menu')
                .setPlaceholder('Bir kategori seç...')
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
                .setColor("GREEN");

            if (categoryImages[category]) {
                categoryEmbed.setImage(categoryImages[category]);
            }

            interaction.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            message.channel.send("🕒 Mağaza menüsü süresi doldu. Tekrar kullanmak için `.mağaza` yaz.");
        });
    }
};
