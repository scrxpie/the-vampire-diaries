
const fs = require('fs');

const path = require('path');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
// Eğer ortam değişkenleri kullanıyorsanız


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});
const commandsDir = path.join(__dirname, "komutlar");
// Giveaway Manager'ı başlat
fs.readdirSync(commandsDir).forEach(file => {
    if (file.endsWith(".js")) {
        const command = require(`./komutlar/${file}`);
        if (!command.execute || typeof command.execute !== "function") {
            console.log(`Eksik execute fonksiyonu: ${file}`);
        }
    }
});
require('./komutlar/activityWatcher');


async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB'ye başarıyla bağlandı!");

   
const kelime = require('./komutlar/kelime');
const hkelime = require('./komutlar/hkelime');

const guildId = process.env.GUILD_ID;
// Veri dosyalarının yolları
const wordDataPath = path.join(__dirname, 'data', 'kelimeVerisi.json');
const balanceDataPath = path.join(__dirname, 'data', 'balances.json');

// Ayarlar
const excludedChannels = ['1327621148606988349','1327625994411970560']; // Hariç tutulacak kanallar
const requiredRoleId = '1327981428805210204'; // Kelime sayımı için gerekli rol
const arcaneBotId = '437808476106784770'; // Arcane botunun ID'si
const notificationChannelId = '1368539004823408719'; // Para bildirimi yapılacak kanal ID'si

// Komut koleksiyonu
client.commands = new Collection();
const slashCommands = [];
// Komutları yükleme
const commandsPath = path.join(__dirname, 'komutlar');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        client.commands.set(command.name, command);
        if (command.data) {
            slashCommands.push(command.data.toJSON());
        }
        console.log(`Komut yüklendi: ${command.name}`);
    }
}
const cron = require('node-cron');

// Kelime verisini dosyadan oku
let kelimeVerisi = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/kelimeVerisi.json'), 'utf-8'));

    
const db= require ('./database')

// Haftalık sıralama komutuna tetik

// Slash komutlarını deploy etme fonksiyonu
async function deploySlashCommands() {
    try {
        await client.application.commands.set(slashCommands);
        console.log('Slash komutları başarıyla deploy edildi!');
    } catch (error) {
        console.error('Slash komutları deploy edilirken hata oluştu:', error);
    }
}

// Para ekleme fonksiyonu

// JSON dosyasının yolu
const filePath = './data/kelimeVerisi.json';
const rewardAmount = 3000;
// Kullanıcının kelimelerini takip etme fonksiyonu

    



// 📌 PARA EKLEME FONKSİYONU 📌

      

// Slash komutlarını işleme
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Komut çalıştırılırken bir hata oluştu:', error);
        await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu!', ephemeral: true });
    }
});
client.on('messageCreate', message => require('./events/messagecreate')(client, message));
// Mesaj event'i
client.on('messageCreate', (message) => {
    if (message.author.bot || excludedChannels.includes(message.channel.id)) return;

    // Mesaj içeriğini logla
    console.log(`Mesaj algılandı: ${message.content}`);

 

    // Komut kontrolü
    const prefix = '.';
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(message, args);
        } catch (error) {
            console.error(`Komut çalıştırılırken bir hata oluştu: ${error.message}`);
            message.reply('Komut çalıştırılırken bir hata oluştu.');
        }
        return;
    }
});
// Bakiye ekleme fonksiyonu

    const Balance = require('./models/Balance');


async function addBalance(userId, amount) {
  try {
    // Kullanıcının bakiyesini bul veya yeni oluştur
    let userBalance = await Balance.findById(userId);

    if (!userBalance) {
      userBalance = new Balance({
        _id: userId,
        balance: amount, // doğrudan amount kadar başlat
        bank: 0
      });
    } else {
      userBalance.balance += amount;
    }

    await userBalance.save();
    console.log(`✅ ${userId} kullanıcısına ${amount}$ eklendi.`);
  } catch (err) {
    console.error('❌ Bakiye eklenirken hata oluştu:', err);
  }
}

module.exports = { addBalance };

    // Eski seviye (kaydedilmiş)
    const Words = require('./models/Words');

async function calculateLevelAndReward(userId, client, notificationChannelId, guildId) {
  try {
    // Kullanıcının rolünü kontrol et
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    if (!member.roles.cache.has(requiredRoleId)) return; // 🔒 Rolü yoksa çık

    // Kelime verisini al
    let wordData = await Words.findById(userId);
    if (!wordData) {
      wordData = new Words({ _id: userId, words: 0, lastLevel: 0 });
    }

    const currentLevel = Math.floor(wordData.words / 1000);

    // Zaten bu seviyede ödül almışsa tekrar verme
    if (currentLevel <= (wordData.lastLevel || 0)) return;

    const reward = 3000;
    await addBalance(userId, reward);

    // Güncel seviye kaydedilsin
    wordData.lastLevel = currentLevel;
    await wordData.save();

    const channel = client.channels.cache.get(notificationChannelId);
    if (channel) {
      const embed = new MessageEmbed()
        .setTitle('Seviye Atladınız!')
        .setDescription(`🎉 Tebrikler <@${userId}>! **Seviye ${currentLevel}** oldunuz ve **${reward}$** kazandınız!`)
        .setColor('#FFD700')
        .setTimestamp();

      channel.send({ content: `<@${userId}>`, embeds: [embed] });
    }
  } catch (error) {
    console.error('Seviye ve ödül hesaplama hatası:', error);
  }
}


// Mesaj oluşturulduğunda kelime sayma ve ödül hesaplam

// Arcane botu seviyesini kontrol e


// Arcane botunun mesajlarını kontrol et
const arcaneRewardTable = {
    '5-10': 300,
    '10-25': 500,
    '25-200': 1000,
};
const trackPartnerMessage = require('./utils/partner');

const fiboBotId = '735147814878969968';

 // Ödül verilecek rolün ID'si
// botu seviyesini kontrol et



// messageCreate olayında kontrol
client.on('messageCreate', async (message) => {
  trackPartnerMessage(message);

  if (message.author.id !== arcaneBotId) return;
  if (!message.content.includes('Yeni levelin')) return;

  // ✅ 1. Kullanıcıyı mesajdan çek
  const userIdMatch = message.content.match(/<@!?(\d+)>/);
  const userId = userIdMatch ? userIdMatch[1] : null;
  if (!userId) return;

  const member = await message.guild.members.fetch(userId).catch(() => null);
  if (!member) return;

  // 🔒 Rol kontrolü
  if (!member.roles.cache.has(requiredRoleId)) return;

  // ✅ 2. Level bilgisini mesajdan çek
  const levelMatch = message.content.match(/Yeni levelin \*\*(\d+)\*\*/i);
  if (!levelMatch) return;

  const level = parseInt(levelMatch[1], 10);

  // ✅ 3. Seviye aralığına göre ödül belirle
  const arcaneRewardTable = {
    '5-10': 200,
    '10-25': 300,
    '25-200': 500,
  };

  let reward = 0;
  for (const [range, amount] of Object.entries(arcaneRewardTable)) {
    const [min, max] = range.split('-').map(Number);
    if (level >= min && level <= max) {
      reward = amount;
      break;
    }
  }

  if (reward > 0) {
    await addBalance(userId, reward);

    const embed = new MessageEmbed()
      .setTitle('Arcane Seviye Ödülü!')
      .setDescription(`Tebrikler <@${userId}>! Arcane'de seviye **${level}** oldun ve **${reward}$** kazandın!`)
      .setColor('#00ff00')
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
});


// fiboBotId'yi tanımlayacağınız yer:
// Botunuzun ana dosyasının en başında, diğer sabitlerinizle birlikte.
                                      // Lütfen bu değeri kendiniz bulun ve buraya yapıştırın.
                                           // (Örn: Bir Fibo mesajına sağ tıklayıp "ID Kopyala")

// client.on('messageCreate', ...)'in içeriği:
client.on('messageCreate', async (message) => {
    // Mesajı gönderen Fibo botu değilse veya bir bot ise, veya mesajda "Thanks for bumping our Server!" ifadesi yoksa işlem yapma
    // Not: Discord.js v13'te mesajda etiketlenen bir kullanıcı varsa, message.author.bot kontrolü hala gerekli olabilir.
    if (message.author.id !== fiboBotId || message.author.bot || !message.content.includes('Thx for bumping our Server! We will remind you in 2 hours!')) {
        return;
    }

    // Mesajda etiketlenen kullanıcıyı bul
    // Mesajınızdaki <@533727549625204747> gibi bir etiket varsa, bu kısım doğru çalışacaktır.
    const bumpedUser = message.mentions.users.first();

    // Eğer etiketlenen bir kullanıcı varsa ve bu kullanıcı mesajı atan Fibo botu değilse
    if (bumpedUser && bumpedUser.id !== fiboBotId) {
        const rewardAmount = 100; // Verilecek para miktarı

        // Kullanıcıya para ekle
        addBalance(bumpedUser.id, rewardAmount);

        // Başarı bildirimi gönder
        const embed = new MessageEmbed()
            .setTitle('Sunucu Bump Ödülü!')
            .setDescription(`🎉 Tebrikler ${bumpedUser.username}! Sunucuyu bump'ladığınız için **${rewardAmount}$** ödül kazandınız!`)
            
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
});

module.exports = (client) => {
    client.on('guildUpdate', async (oldGuild, newGuild) => {
        // Eğer boost seviyesi yükselmişse
        if (oldGuild.premiumSubscriptionCount < newGuild.premiumSubscriptionCount) {
            // Son boost atan kullanıcıyı bulmak için sunucudaki booster rolüne sahip kişileri al
            const boosterRoleID = "1370821728778846328"; // Booster rolünün ID'si
            const boosterMembers = newGuild.members.cache.filter(member => member.roles.cache.has(boosterRoleID));
            
            // Yeni boost atan kişiyi belirlemek zor olabilir, en son boost atan kişiyi almak için bir tahminde bulunabiliriz
            const latestBooster = boosterMembers.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp).first();

            if (!latestBooster) return;

            const channel = newGuild.channels.cache.get("1327984835603468319"); // Teşekkür mesajının gideceği kanal ID'sini buraya girin.
            if (!channel) return;

            const embed = new MessageEmbed()
                .setColor("#8B0000") // Kan kırmızısı
                .setTitle("➝ 𝗝𝗢𝗜𝗡.𝗚𝗚/𝗧𝗛𝗘𝗢𝗧𝗛𝗘𝗥𝗦𝗜𝗗𝗘")
                .setDescription(`
                    **𝐓𝐄𝐒̧𝐄𝐊𝐊𝐔̈𝐑𝐋𝐄𝐑, 𝐁𝐎𝐎𝐒𝐓𝐄𝐑!** <@${latestBooster.id}>  
                    *The Other Side'a takviye yaptığın için teşekkür ederiz!  
                    Özel ayrıcalıklar ve ödüllerr kazandın!*  
                    **🎁 𝐀𝐘𝐑𝐈𝐂𝐀𝐋𝐈𝐊 𝐁𝐈𝐋𝐆𝐈𝐋𝐄𝐑𝐈:**  
                    - <#1368538996631670868>  
                `)
                .setImage("https://cdn.discordapp.com/attachments/1368538992257273993/1383067720601440320/IMG_5285.gif")
                .setFooter(`Şu anki boost sayısı: ${newGuild.premiumSubscriptionCount}`);

            channel.send({ content: `<@${latestBooster.id}>`, embeds: [embed] });
        }
    });
};
                           
const gonderilerPath = path.join(__dirname, 'data', 'gonderiler.json');
const kullanicilar = require('./data/kullanicilar.json'); // Eğer kullanılıyorsa

const BEGENI_EMOJI = '❤️';
const BEGENI_BILDIRIM_KANALI_ID = '1329560487175917701'; // Beğeni bildirimlerinin gideceği kanal ID'si

function readGonderiler(callback) {
    fs.readFile(gonderilerPath, 'utf8', (err, data) => {
        if (err) {
            console.error('[beğeni-fonksiyonu] gonderiler.json okunurken bir hata oluştu:', err);
            callback({});
            return;
        }
        try {
            const gonderiler = JSON.parse(data);
            callback(gonderiler);
        } catch (parseErr) {
            console.error('[beğeni-fonksiyonu] gonderiler.json parse edilirken bir hata oluştu:', parseErr);
            callback({});
        }
    });
}

function writeGonderiler(gonderiler, callback) {
    fs.writeFile(gonderilerPath, JSON.stringify(gonderiler, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('[beğeni-fonksiyonu] gonderiler.json yazılırken bir hata oluştu:', err);
            callback(err);
            return;
        }
        callback(null);
    });
}

client.on('messageReactionAdd', (reaction, user) => {
    console.log('[beğeni-fonksiyonu] messageReactionAdd olayı tetiklendi.'); // Kontrol için
    console.log(`[beğeni-fonksiyonu] Kullanıcı: ${user.tag} (${user.id}), Emoji: ${reaction.emoji.name} (${reaction.emoji.id}), Mesaj ID: ${reaction.message.id}`);

    if (reaction.partial) {
        console.log('[beğeni-fonksiyonu] Kısmi reaksiyon algılandı, veri çekiliyor...');
        reaction.fetch()
            .then(fetchedReaction => {
                console.log('[beğeni-fonksiyonu] Reaksiyon verisi çekildi.');
                processReaction(fetchedReaction, user);
            })
            .catch(error => {
                console.error('[beğeni-fonksiyonu] Reaksiyon verisi çekilirken hata:', error);
            });
        return;
    }

    processReaction(reaction, user);
});

function processReaction(reaction, user) {
    if (user.bot) {
        console.log('[beğeni-fonksiyonu] Botun reaksiyonu, işleme alınmıyor.');
        return;
    }

    if (reaction.emoji.name === BEGENI_EMOJI) {
        const gonderiId = reaction.message.embeds[0]?.footer?.text?.split(' | ')[0]?.split(': ')[1];
        console.log(`[beğeni-fonksiyonu] Beğeni emojisi algılandı. Gönderi ID (ham): ${gonderiId}`);

        if (gonderiId) {
            readGonderiler((gonderiler) => {
                const gonderiIdStr = gonderiId.toString();

                if (gonderiler[gonderiIdStr]) {
                    if (!gonderiler[gonderiIdStr].begenenler.includes(user.id)) {
                        gonderiler[gonderiIdStr].begeniSayisi++;
                        gonderiler[gonderiIdStr].begenenler.push(user.id);
                        writeGonderiler(gonderiler, (err) => {
                            if (err) {
                                console.error('[beğeni-fonksiyonu] Gönderi beğenisi kaydedilirken hata:', err);
                                return;
                            }
                            console.log(`[beğeni-fonksiyonu] Gönderi ${gonderiIdStr} beğenildi. Yeni beğeni sayısı: ${gonderiler[gonderiIdStr].begeniSayisi}`);

                            // Beğeni bildirimi gönderme (Yeni Format)
                            const gonderiSahibiId = gonderiler[gonderiIdStr].yazarId;
                            if (gonderiSahibiId !== user.id) {
                                client.users.fetch(gonderiSahibiId)
                                    .then(gonderiSahibi => {
                                        const begenenKullaniciAdi = kullanicilar[user.id]?.kullaniciAdi || user.tag;
                                        const gonderiSayisi = gonderiler[gonderiIdStr].sayi;
                                        const begeniBildirimKanal = client.channels.cache.get(BEGENI_BILDIRIM_KANALI_ID);
// ... (beğeni bildirimi gönderme bloğunun hemen altına)


                                        if (begeniBildirimKanal) {
                                            const bildirimEmbed = new Discord.MessageEmbed()
                                                .setColor('#F00075')
                                                .setAuthor({ name: begenenKullaniciAdi, iconURL: user.displayAvatarURL({ dynamic: true }) })
                                                .setDescription(`Gönderinizi beğendi! (Gönderi #${gonderiSayisi})`)
                                                .setTimestamp();

                                            begeniBildirimKanal.send({ content: `<@${gonderiSahibiId}>`, embeds: [bildirimEmbed] })
                                                .then(() => console.log(`[beğeni-fonksiyonu] Beğeni bildirimi (eski fs) gönderildi: ${gonderiIdStr} -> ${gonderiSahibi.tag}`))
                                                .catch(error => console.error('[beğeni-fonksiyonu] Beğeni bildirimi (eski fs) gönderilirken bir hata oluştu:', error));
                                        } else {
                                            console.warn(`[beğeni-fonksiyonu] Beğeni bildirim kanalı bulunamadı: ${BEGENI_BILDIRIM_KANALI_ID}`);
                                        }
                                    })
                                    .catch(error => console.error('[beğeni-fonksiyonu] Kullanıcı alınırken hata:', error));
                            }
                        });
                    } else {
                        console.log(`[beğeni-fonksiyonu] Kullanıcı ${user.id} zaten gönderi ${gonderiIdStr}'yi beğenmiş.`);
                    }
                } else {
                    console.warn(`[beğeni-fonksiyonu] Beğeni için gönderi bulunamadı (eski fs): ${gonderiIdStr}`);
                }
            });
        }
    }
}


const { Routes } = require('discord-api-types/v9');

  const { REST } = require('@discordjs/rest');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);


// Bot hazır olduğunda
client.once('ready', async () => {
    console.log(`${client.user.tag} başarıyla giriş yaptı!`);
    client.user.setActivity('The Vampire Diaries', { type: 'STREAMING', url:'https://www.twitch.tv/theotherrside', status: 'idle' } );
  

  try {
    console.log('Slash komutları yükleniyor...');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: client.commands.map(command => command.data.toJSON()) },
    );

    console.log('Slash komutları başarıyla yüklendi!');
  } catch (error) {
    console.error(error);
  }
});


  client.on('messageReactionAdd', (reaction, user) => {
  if (!user.bot) {
    console.log(`${user.tag} şu emojiye bastı: ${reaction.emoji.name}`);
  }
});

    
 // Eventleri yükle
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Event yüklendi: ${event.name}`);
    }
} else {
    console.error('Events klasörü bulunamadı.');
}
module.exports = (client) => {
    
};

// messageReactionAdd OLAY DİNLEYİCİSİ (Eğer ayrı bir dosyanız yoksa buraya ekleyin)
// Glitch otomatik olarak bir port atayacaktır, onu process.env.PORT'tan alıyoruz
// ... diğer importlar ...
// Komutları deploy etmek istediğiniz sunucunun ID'si

// ... client.login(token); ...


const express = require('express');
const app = express();
const port = process.env.PORT || 3001;


app.get('/', (req, res) => {
  res.send('Discord Bot Kontrol Paneli (Basit)');
});

app.listen(port, () => {
  console.log(`Web sunucusu ${port} portunda çalışıyor!`);
});

const { updateVoiceChannelName } = require('./utils/dolunayses');


  
client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);

cron.schedule('*/5 * * * *', () => {
    updateVoiceChannelName(client);
  });

 
});
const partnerResetScheduler = require('./utils/PartnerReset');

// Bot hazır olduğunda cron sistemi başlasın

    partnerResetScheduler(); // reset sistemi başlatılıyor





// Botu başlat
client.login(process.env.TOKEN);
module.exports = { client }; // client'ı export ediyoruz
      
 } catch (err) {
    console.error('MongoDB bağlantı hatası veya import hatası:', err);
  }
}

start();
