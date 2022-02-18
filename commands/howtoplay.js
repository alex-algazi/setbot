const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('howtoplay')
    .setDescription('Displays the rules of the game'),
  async execute(interaction) {
    await interaction.reply({
      content: 'Start a game using the "/newgame" command, and cards will be dealt onto the "board" for all players to see.\n\nIn SET, the deck consists of cards with four attributes: shape, number of shapes, color, and shading. Each attribute has three possibilites:\nShape: ovals, squiggles, diamonds\nNumber: one, two, three\nColor: red, green, blue\nShading: open, shaded, solid\n\nThe goal of the game is to find "sets", or groups of three cards where each attribute is either the same for all three cards or different for all three cards.\n\nBelow are some examples of sets (each row is a set).',
      files: ['./images/sets/1.jpeg','./images/sets/2.jpeg','./images/sets/3.jpeg'],
      ephemeral: true
    });
  }
};
