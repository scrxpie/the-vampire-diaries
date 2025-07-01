const { checkAndUpdateRole } = require('../utils/tagRoleManager');
const GUILD_ID = '1327541284646293504'
const ROLE_ID = '1389547560682782731';

module.exports = {
  name: 'presenceUpdate',
  async execute(oldPresence, newPresence, client) {
    if (!newPresence || !newPresence.user) return;

    // Sunucuda mı kontrol et
    if (!newPresence.guild || newPresence.guild.id !== GUILD_ID) return;

    // Kullanıcı id'si
    const userId = newPresence.user.id;

    await checkAndUpdateRole(client, GUILD_ID, ROLE_ID, userId);
  }
};
