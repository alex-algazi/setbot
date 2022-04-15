const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('showstats')
    .setDescription('Displays server-wide statistics and the results of the last 10 games')
    .addIntegerOption(option => 
      option.setName('gameid')
        .setDescription('Use Game ID for stats about a specific game')
        .setRequired(false)
    ),
  async execute(interaction) {
    let db = new sqlite3.Database('database/setbot.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        let ts = new Date();
        console.log(ts.toISOString()+' could not connect to database', err);
      }
      else {
        let ts = new Date();
        console.log(ts.toISOString()+' serverstats in guild '+interaction.guild.id+' connected to database');
      }
    });

    let stats = '';

    const gameuid = interaction.options.getInteger('gameid');

    if (gameuid) {
      stats += gameuid;
    }
    else {
      stats += 'DNE';
    }

    db.close();

    await interaction.reply(stats);
  }
};

/*
SERVER:
# of games completed
% of games cancelled
average game length
top 3 players
last 10 games (gameuid, length, winner/tie)

GAME:
gameuid
length
winner/tie
users (playername, score)


WINNER:
SELECT a.PlayerUID FROM PlayersGames AS a LEFT OUTER JOIN PlayersGames AS b ON a.GameUID = b.GameUID AND a.Score < b.Score WHERE b.GameUID IS NULL AND a.GameUID = 3;
*/
