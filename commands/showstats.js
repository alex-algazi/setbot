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
        reject(err);
      }
      else {
        resolve(rows);
      }
    });
  });
}

function timeFromSeconds(s, short) {
  const mins = Math.floor(s/60);
  if (mins == 0) {
    if (short) return '<1 min';
    return 'less than one minute';
  }
  else if (mins < 60) {
    if (short) return mins + ' mins';
    return mins + ' minutes';
  }
  else if (mins < 1440) {
    if (short) return Math.floor(mins/60) + ' hrs';
    return Math.floor(mins/60) + ' hours';
  }
  else if (mins < 10080) {
    if (short) return Math.floor(mins/1440) + ' days';
    return Math.floor(mins/1440) + ' days';
  }
  else if (mins < 43800) {
    if (short) return Math.floor(mins/10080) + ' wks';
    return Math.floor(mins/10080) + ' weeks';
  }
  else if (mins < 525600) {
    if (short) return Math.floor(mins/43800) + ' mnths';
    return Math.floor(mins/43800) + ' months';
  }
  else {
    if (short) return Math.floor(mins/525600) + ' yrs';
    return Math.floor(mins/525600) + ' years';
  }
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
      const game = await getPromise(db, 'SELECT Cancelled, STRFTIME("%s", GameStart) AS Start, STRFTIME("%s", GameEnd) AS End FROM Games WHERE GameUID = ? AND ServerID = ?', [gameuid, interaction.guild.id]);
      if (game) {
        stats += 'Game #'+gameuid;
        if (game.Cancelled) {
          stats += '(cancelled)';
        }
        stats += ': lasted '+timeFromSeconds(game.End-game.Start,0)+', ';
        const winners = await allPromise(db, 'SELECT Players.PlayerName FROM (SELECT a.PlayerUID FROM PlayersGames AS a LEFT OUTER JOIN PlayersGames AS b ON a.GameUID = b.GameUID AND a.Score < b.Score WHERE b.GameUID IS NULL AND a.GameUID = ?) AS t1 INNER JOIN Players ON t1.PlayerUID = Players.PlayerUID', [gameuid]);
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
        for (let i = 0; i < scores.length; i++) {
          stats += `${scores[i].PlayerName}` + ' '.repeat(longestName-scores[i].PlayerName.length+1) + '| ' + ' '.repeat(2-scores[i].Score.toString().length) +  `${scores[i].Score}\n`;
        }
        stats += '```';
      }
      else {
        stats += 'No record of game #'+gameuid+' in this server';
      }
    }
    else {


      const completed = await getPromise(db, 'SELECT COUNT(*) AS c FROM Games WHERE ServerID = ? AND Cancelled = 0', [interaction.guild.id]);
      stats += 'Number of games completed: '+completed.c+'\n';

      const cancelled = await getPromise(db, 'SELECT COUNT(*) AS c FROM Games WHERE ServerID = ? AND Cancelled = 1', [interaction.guild.id]);
      const total = await getPromise(db, 'SELECT COUNT(*) AS c FROM Games WHERE ServerID = ?', [interaction.guild.id], interaction.guild.id);
      stats += 'Percentage of games cancelled: '+Math.round((cancelled.c/total.c+Number.EPSILON)*100)+'%\n';
      
      const average = await getPromise(db, 'SELECT AVG(STRFTIME("%s", GameEnd) - STRFTIME("%s", GameStart)) AS a FROM Games WHERE ServerID = ?', [interaction.guild.id]);
      stats += 'Average game length: '+timeFromSeconds(average.a, 0)+'\n';

      const players = await allPromise(db, 'SELECT Players.PlayerName, CAST(AVG(PlayersGames.Score) AS INT) AS avg FROM (SELECT GameUID FROM Games WHERE ServerID = ? AND Cancelled = 0) AS a INNER JOIN PlayersGames ON a.GameUID = PlayersGames.GameUID INNER JOIN Players ON PlayersGames.PlayerUID = Players.PlayerUID GROUP BY Players.PlayerUID ORDER BY avg DESC LIMIT 5', [interaction.guild.id]);
      let longestName = 0;
      for (let i = 0; i < players.length; i++) {
        if (players[i].PlayerName.length > longestName) {
          longestName = players[i].PlayerName.length;
        }
      }
      stats += 'Top players:\n```User' + ' '.repeat(longestName-3) + '| Avg score' + '\n' + '-'.repeat(longestName+1) + '+----------\n';
      for (let i = 0; i < players.length; i++) {
        stats += `${players[i].PlayerName}` + ' '.repeat(longestName-players[i].PlayerName.length+1) + '| ' + ' '.repeat(2-players[i].avg.toString().length) +  `${players[i].avg}\n`;
      }
      stats += '```';

      const games = await allPromise(db, 'SELECT Games.GameUID, Games.Cancelled, (STRFTIME("%s", Games.GameEnd) - STRFTIME("%s", Games.GameStart)) AS t, a.c, a.PlayerName FROM Games INNER JOIN (SELECT t1.GameUID, Players.PlayerName, t1.c FROM (SELECT a.PlayerUID, a.GameUID, COUNT(*) as c FROM PlayersGames AS a LEFT OUTER JOIN PlayersGames AS b ON a.GameUID = b.GameUID AND a.Score < b.Score WHERE b.GameUID IS NULL GROUP BY a.GameUID) AS t1 INNER JOIN Players ON t1.PlayerUID = Players.PlayerUID) AS a ON Games.GameUID = a.GameUID WHERE Games.ServerID = ? GROUP BY Games.GameUID ORDER BY Games.GameUID DESC LIMIT 10', [interaction.guild.id]);
      longestName = 0;
      longestID = 0;
      for (let i = 0; i < games.length; i++) {
        if (games[i].PlayerName.length > longestName) {
          longestName = games[i].PlayerName.length;
        }
        if (games[i].GameUID.toString().length > longestID) {
          longestID = games[i].GameUID.toString().length;
        }
      }
      stats += 'Recent games: (X = cancelled)\n```# | X | Length   | Winner' + '\n' + '--+---+----------+' + '-'.repeat(longestName+1) + '\n';
      for (let i = 0; i < games.length; i++) {
        stats += ' '.repeat(longestID-games[i].GameUID.toString().length) + games[i].GameUID + ' | ';
        if (games[i].Cancelled) {
          stats += '* | ';
        }
        else {
          stats += '  | ';
        }
        let time = timeFromSeconds(games[i].t, 1);
        let c = time.charAt(1);
        let timeLength = time.length;
        if (c < '0' || c > '9') {
          stats += ' ';
          timeLength++;
        }
        stats += time + ' '.repeat(8-timeLength) + ' | ';
        if (games[i].c === 1) {
          stats += games[i].PlayerName;
        }
        else {
          stats += '[Tie]';
        }
        stats += '\n';
      }
      stats += '```You can use the "/showstats" command to show data on a particular game! Just type the Game ID after the command, like this: "/showstats <GameID>"';
    }

    db.close();
    await interaction.reply(stats);
  }
};
