const { SlashCommandBuilder } = require('@discordjs/builders');
const sqlite3 = require('sqlite3').verbose();

function getPromise(db, query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(rows);
      }
    });
  });
}

function allPromise(db, query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        //stuff
        reject(err);
      }
      else {
        //stuff
        resolve(rows);
      }
    });
  });
}

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
      const game = await getPromise(db, 'SELECT Cancelled, STRFTIME("%s", GameStart) AS Start, STRFTIME("%s", GameEnd) AS End FROM Games WHERE GameUID = ?', [gameuid]);
      if (game) {
        stats += 'Game #'+gameuid;
        if (game.Cancelled) {
          stats += '(cancelled)';
        }
        stats += ': lasted ';

        const mins = Math.floor((game.End-game.Start)/60);
        if (mins == 0) {
          stats += 'less than a minute, ';
        }
        else if (mins < 60) {
          stats += mins + ' minutes, ';
        }
        else if (mins < 1440) {
          stats += Math.floor(mins/60) + ' hours, ';
        }
        else if (mins < 10080) {
          stats += Math.floor(mins/1440) + ' days, ';
        }
        else if (mins < 43800) {
          stats += Math.floor(mins/10080) + ' weeks, ';
        }
        else if (mins < 525600) {
          stats += Math.floor(mins/43800) + ' months, ';
        }
        else {
          stats += Math.floor(mins/525600) + ' years, ';
        }

        const winners = await allPromise(db, 'SELECT t2.PlayerName FROM (SELECT a.PlayerUID FROM PlayersGames AS a LEFT OUTER JOIN PlayersGames AS b ON a.GameUID = b.GameUID AND a.Score < b.Score WHERE b.GameUID IS NULL AND a.GameUID = ?) AS t1 INNER JOIN (SELECT PlayerName, PlayerUID FROM Players) AS t2 ON t1.PlayerUID = t2.PlayerUID', [gameuid]);
        if (winners.length === 1) {
          stats += 'won by '+winners[0].PlayerName;
        }
        else {
          stats += 'tie game';
        }
        stats += '\n';

        const scores = await allPromise(db, 'SELECT a.PlayerName, b.Score FROM Players AS a INNER JOIN PlayersGames AS b ON a.PlayerUID = b.PlayerUID WHERE b.GameUID = ? ORDER BY b.Score DESC', [gameuid]);
        console.log(scores.length);
        let longestName = 0;
        for (let i = 0; i < scores.length; i++) {
          if (scores[i].PlayerName.length > longestName) {
            longestName = scores[i].PlayerName.length;
          }
        }
        stats += 'Scores:\n```User' + ' '.repeat(longestName-3) + '| Score' + '\n' + '-'.repeat(longestName+1) + '+------\n';
        for(let i = 0; i < scores.length; i++) {
          stats += `${scores[i].PlayerName}` + ' '.repeat(longestName-scores[i].PlayerName.length+1) + '| ' + ' '.repeat(2-scores[i].Score.toString().length) +  `${scores[i].Score}\n`;
        }
        stats += '```';
      }
      else {
        stats += 'Game #'+gameuid+' does not exist';
      }
    }
    else {
      stats += 'GENERAL STATS'; //TODO
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
*/
