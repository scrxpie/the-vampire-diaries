module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    const kelimeKomutu = client.commands.get('kelime');
    if (kelimeKomutu && typeof kelimeKomutu.messageCreate === 'function') {
      kelimeKomutu.messageCreate(message);
    }
  }
};
