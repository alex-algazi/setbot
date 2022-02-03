const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newgame')
    .setDescription('Starts a new game of SET'),
  async execute(interaction) {
    await interaction.reply('board');
  }
};
