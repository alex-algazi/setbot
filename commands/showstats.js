const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showstats')
    .setDescription('Displays game statistics and metrics'),
  async execute(interaction) {
    let db = new sqlite3.Database('database/setbot.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        let ts = new Date();
        console.log(ts.toISOString()+' could not connect to database', err);
      }
      else {
        let ts = new Date();
        console.log(ts.toISOString()+' showstats in guild '+interaction.guild.id+' connected to database');
      }
    });

    let stats = '';

    // do stuff

    db.close();

    await interaction.reply(stats);
  }
};
