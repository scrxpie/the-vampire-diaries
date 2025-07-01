const fetch = require('node-fetch');

const GUILD_ID = '1327541284646293504'; // Sunucu ID
const ROLE_ID = '1389547560682782731'; // Verilecek rol ID
const LOG_CHANNEL_ID = '1389549099443027979'; // Logların atılacağı kanal ID

// Lanyard API'den kullanıcı durumunu çek
async function fetchLanyardData(userId) {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    if (!res.ok) {
      console.error(`Lanyard API hatası: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error('Lanyard API çağrısı sırasında hata:', err);
    return null;
  }
}

// Kullanıcıda guild tag var mı kontrol et
function hasGuildTag(lanyardData) {
  if (!lanyardData || !lanyardData.activities) return false;

  const guildTag = 'SIDE'; // Buraya kendi sunucu tagını yaz

  for (const activity of lanyardData.activities) {
    if (activity.type === 4 && activity.state && activity.state.includes(guildTag)) {
      return true;
    }
  }
  return false;
}

// Kullanıcıya rol ver veya al, log da at
async function updateUserRole(guild, userId) {
  try {
    const member = await guild.members.fetch(userId);
    if (!member) return;

    const lanyardData = await fetchLanyardData(userId);
    if (!lanyardData) return;

    const hasTag = hasGuildTag(lanyardData);

    const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);

    if (hasTag && !member.roles.cache.has(ROLE_ID)) {
      await member.roles.add(ROLE_ID);
      console.log(`${member.user.tag} kullanıcısına rol verildi (Tag algılandı).`);
      if (logChannel) {
        logChannel.send(`✅ ${member.user.tag} kullanıcısına tag algılandığı için <@&${ROLE_ID}> rolü verildi.`);
      }
    } else if (!hasTag && member.roles.cache.has(ROLE_ID)) {
      await member.roles.remove(ROLE_ID);
      console.log(`${member.user.tag} kullanıcısından rol alındı (Tag yok).`);
      if (logChannel) {
        logChannel.send(`⚠️ ${member.user.tag} kullanıcısının tagı kalktığı için <@&${ROLE_ID}> rolü alındı.`);
      }
    }
  } catch (err) {
    console.error('Rol güncellenirken hata:', err);
  }
}

// Tüm üyeleri periyodik kontrol et
async function periodicCheck(client) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.members.fetch();

    for (const [userId, member] of guild.members.cache) {
      if (member.user.bot) continue;
      await updateUserRole(guild, userId);
      await new Promise(r => setTimeout(r, 1000)); // 1 saniye delay
    }
    console.log('Tüm üyeler kontrol edildi.');
  } catch (err) {
    console.error('Periyodik kontrol hatası:', err);
  }
}

// Kullanıcı aktivitesinde anlık kontrol
async function onUserActivity(client, message) {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.guild.id !== GUILD_ID) return;

  await updateUserRole(message.guild, message.author.id);
}

module.exports = {
  periodicCheck,
  onUserActivity,
};
