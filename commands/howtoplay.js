const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('howtoplay')
    .setDescription('Displays the rules of the game'),
  async execute(interaction) {
    await interaction.reply({
      content: 'Start a game using the "/newgame" command, and cards will be dealt onto the "board" for all players to see. The goal of the game is to find "sets", or groups of three cards where each property is either the same for all three cards or different for all three cards. Below are some examples of sets (each row is a set).',
      files: ['./images/sets/1.jpeg','./images/sets/2.jpeg','./images/sets/3.jpeg'],
      ephemeral: true
    });
  }
};
