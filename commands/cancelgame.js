const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cancelgame')
    .setDescription('ends the current game'),
  async execute(interaction) {
    if(fs.existsSync('./temp/gameData.json')) {
      fs.unlinkSync('./temp/gameData.json');
    }
    await interaction.reply('Game canceled');
  }
}
