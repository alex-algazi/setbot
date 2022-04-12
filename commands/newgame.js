// NUM one two thr
// SHD sol str opn
// COL red grn blu
// SHP ovl sqg dmd

const { SlashCommandBuilder } = require('@discordjs/builders');
const images = require('images');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

function getRand(d) {
  let rand = Math.floor(Math.random()*d.length);
  let card = d[rand];
  d.splice(rand,1);
  return card;
}

function newBoard(b, d, id) {
  for (let i = 0; i < 4; i++) {
    b.push(getRand(d));
    b.push(getRand(d));
    b.push(getRand(d));
    images(910,225)
      .draw(images(`images/${b[i*3]}.jpeg`),0,0)
      .draw(images(`images/${b[i*3+1]}.jpeg`),305,0)
      .draw(images(`images/${b[i*3+2]}.jpeg`),610,0)
      .save(`temp/${id}row${i+1}.jpeg`);
  }
  return b;
}

function checkBoardBruteForce(b) {
  for (let i = 0; i < b.length; i++) {
    for (let j = i+1; j < b.length; j++) {
      for (let k = j+1; k < b.length; k++) {
        if (isSet(b[i],b[j],b[k])) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkBoardBetterBruteForce(b) {
  for (let i = 0; i < b.length; i++) {
    for (let j = i+1; j < b.length; j++) {
      if (isSet(b[i],b[j],thirdCard(b[i],b[j]))) {
        return true;
      }
    }
  }
  return false;
}

function checkBoardOptimum(b) {
  let half = Math.ceil(b.length/2);
  let b1 = b.slice(0, half);
  let b2 = b.slice(-half);
  for (let i = 0; i < b1.length; i++) {
    for (let j = i+1; j < b1.length; j++) {
      if (b.includes(thirdCard(b1[i],b1[j]))) {
        return true;
      }
    }
  }
  for (let i = 0; i < b2.length; i++) {
    for (let j = i+1; j < b2.length; j++) {
      if (b.includes(thirdCard(b2[i],b2[j]))) {
        return true;
      }
    }
  }
  return false;
}

function thirdCard(c1, c2) {
  let total = c1+c2;
  let result = '';
  switch(Math.floor((total/1000)%10)%3) {
    case 0:
      result += '3';
      break;
    case 1:
      result += '2';
      break;
    case 2:
      result += '1';
      break;
  }
  switch(Math.floor((total/100)%10)%3) {
    case 0:
      result += '3';
      break;
    case 1:
      result += '2';
      break;
    case 2:
      result += '1';
      break;
  }
  switch(Math.floor((total/10)%10)%3) {
    case 0:
      result += '3';
      break;
    case 1:
      result += '2';
      break;
    case 2:
      result += '1';
      break;
  }
  switch(Math.floor((total/1)%10)%3) {
    case 0:
      result += '3';
      break;
    case 1:
      result += '2';
      break;
    case 2:
      result += '1';
      break;
  }
  return parseInt(result);
}

function addRow(b, d, id) {
  b.push(getRand(d));
  b.push(getRand(d));
  b.push(getRand(d));
  images(910,225)
    .draw(images(`images/${b[(b.length/3-1)*3]}.jpeg`),0,0)
    .draw(images(`images/${b[(b.length/3-1)*3+1]}.jpeg`),305,0)
    .draw(images(`images/${b[(b.length/3-1)*3+2]}.jpeg`),610,0)
    .save(`temp/${id}row${b.length/3}.jpeg`);
}

function emojiNum(e) {
  if (e === '1️⃣') return 1;
  if (e === '2️⃣') return 2;
  if (e === '3️⃣') return 3;
}

function isSet(c1, c2, c3) {
  let total = c1+c2+c3;
  if (Math.floor((total/1000)%10)%3===0 &&
      Math.floor((total/100)%10)%3===0 &&
      Math.floor((total/10)%10)%3===0 &&
      Math.floor((total/1)%10)%3===0)
    return true;
  else
    return false;
}

function printScores(d, int, can, startTime) {
  if (Object.keys(d).length !== 0) {
    let db = new sqlite3.Database('database/setbot.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        let ts = new Date();
        console.log(ts.toISOString()+' could not connect to database', err);
      }
      else {
        let ts = new Date();
        console.log(ts.toISOString()+' game in guild '+int.guild.id+' connected to database');
      }
    });

    let convertedTime = startTime.toISOString().slice(0,19).replace('T',' ');

    db.run('INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (?,?,?)', [int.guild.id, can, convertedTime], (err) => {
      if (err) {
        let ts = new Date();
        console.log(ts.toISOString(), err);
      }
      else {
        let ts = new Date();
        console.log(ts.toISOString()+` game in guild ${int.guild.id} added to database`);
      }
    });

    let sorted = Object.fromEntries(
      Object.entries(d).sort(([,a],[,b]) => b-a)
    );

    for (let i = 0; i < Object.keys(sorted).length; i++) {
      db.run('INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES ((SELECT PlayerUID FROM Players WHERE PlayerName=?),(SELECT GameUID FROM Games WHERE ServerID=? AND GameStart=?),?)', [Object.keys(sorted)[i], int.guild.id, convertedTime, sorted[Object.keys(sorted)[i]]], (err) => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString(), err);
        }
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${Object.keys(sorted)[i]} added to table "PlayersScores" with a score of ${sorted[Object.keys(sorted)[i]]}`);
        }
      });
    }

    let longestName = 0;
    for (const name in sorted) {
      if (name.length > longestName) {
        longestName = name.length;
      }
    }
    let scores = 'Scores:\n```User' + ' '.repeat(longestName-3) + '| Score' + '\n' + '-'.repeat(longestName+1) + '+------\n';
    for(let i = 0; i < Object.keys(sorted).length; i++) {
      scores += `${Object.keys(sorted)[i]}` + ' '.repeat(longestName-Object.keys(sorted)[i].length+1) + '| ' + ' '.repeat(2-sorted[Object.keys(sorted)[i]].toString().length) +  `${sorted[Object.keys(sorted)[i]]}\n`;
    }
    scores += '```';
    int.channel.send(scores);

    db.close();
  }
}

async function continueGame(board, curDeck, interaction, startTime) {
  while (!checkBoardOptimum(board)) {
    addRow(board, curDeck, interaction.guild.id);
  }

  if (fs.existsSync(`temp/${interaction.guild.id}set.jpeg`)) {
    await interaction.channel.send({files: [`temp/${interaction.guild.id}set.jpeg`]});
  }

  let stopsign = await interaction.channel.send(`${curDeck.length} cards remaining. To cancel current game, press the stop sign. (Only the user who started the game can cancel it)`);
  stopsign.react('🛑');

  let db = new sqlite3.Database('database/setbot.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' could not connect to database', err);
    }
    else {
      let ts = new Date();
      console.log(ts.toISOString()+' game in guild '+interaction.guild.id+' connected to database');
    }
  });

  let row1;
  let row2;
  let row3;
  let row4;
  let row5;
  let row6;
  let collector1;
  let collector2;
  let collector3;
  let collector4;
  let collector5;
  let collector6;
  let filter = (reaction, user) => {
    return ['1️⃣','2️⃣','3️⃣'].includes(reaction.emoji.name) && user.id != 917630979659685908;
  };
  let playerInputs = {}
  let setFound = false;

  row1 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row1.jpeg`]});
  try {
    await row1.react('1️⃣');
    await row1.react('2️⃣');
    await row1.react('3️⃣');
  } catch (err) {
    let ts = new Date();
    console.log(ts.toISOString()+' one of the emojis failed to react:', err);
  }
  collector1 = row1.createReactionCollector({filter});
  collector1.on('collect', (reaction, user) => {
    reaction.users.remove(user.id);
    db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
      if (err) {}
      else {
        let ts = new Date();
        console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
      }
    });
    db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
      if (err) {}
      else {
        let ts = new Date();
        console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
      }
    });
    if (!setFound) {
      if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
        playerInputs[`${user.tag}`] = [];
      }
      let slot = emojiNum(reaction.emoji.name)-1;
      let ts = new Date();
      console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
      if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
        playerInputs[`${user.tag}`].push(slot);
      }
      let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
      let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
      let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
      if (playerInputs[`${user.tag}`].length >= 3) {
        if (isSet(board[select1],board[select2],board[select3])) {
          setFound = true;
          let ts = new Date();
          console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
          stopsign.reactions.removeAll();
          row1.reactions.removeAll();
          if (board.length >= 6) {
            row2.reactions.removeAll();
          }
          if (board.length >= 9) {
            row3.reactions.removeAll();
          }
          if (board.length >= 12) {
            row4.reactions.removeAll();
          }
          if (board.length >= 15) {
            row5.reactions.removeAll();
          }
          if (board.length >= 18) {
            row6.reactions.removeAll();
          }
          images(910,225)
            .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
            .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
            .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
            .save(`temp/${interaction.guild.id}set.jpeg`);
          let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
          let data = JSON.parse(raw);
          if (!data.hasOwnProperty(`${user.tag}`)) {
            data[`${user.tag}`] = 1;
          }
          else {
            data[`${user.tag}`] += 1;
          }
          let str = JSON.stringify(data);
          fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
            if (err) {
              let ts = new Date();
              console.log(ts.toISOString()+' error writing file', err);
            }
          });
          interaction.channel.send(`User ${user.tag} found a set!`);
          if (curDeck.length !== 0) {
            if (board.length < 15) {
              board[select1] = getRand(curDeck);
              board[select2] = getRand(curDeck);
              board[select3] = getRand(curDeck);
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              for (let i = 0; i < 3; i++) {
                if (cards[i] >= 12) {
                  board.splice(cards[i],1);
                }
                else {
                  board[cards[i]] = board[board.length-1];
                  board.splice(board.length-1,1);
                }
              }
            }
            for (let i = 0; i < 4; i++) {
              images(910,225)
                .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
            }
          }
          else {
            let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
            board.splice(cards[0],1);
            board.splice(cards[1],1);
            board.splice(cards[2],1);
            for (let i = 0; i < board.length/3; i++) {
              images(910,225)
                .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
            }
          }
          if (curDeck.length === 0 && !checkBoardOptimum(board)) {
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
              fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
            }
            let ts = new Date();
            console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
            interaction.channel.send('Game over!');
            printScores(data, interaction, 0, startTime);
          }
          else {
            db.close();
            continueGame(board, curDeck, interaction, startTime);
          }
        }
      }
    }
  });

  if (board.length >= 6) {
    row2 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row2.jpeg`]});
    try {
      await row2.react('1️⃣');
      await row2.react('2️⃣');
      await row2.react('3️⃣');
    } catch (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' one of the emojis failed to react:', err);
    }
    collector2 = row2.createReactionCollector({filter});
    collector2.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
        }
      });
      db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
        }
      });
      if (!setFound) {
        if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
          playerInputs[`${user.tag}`] = [];
        }
        let slot = emojiNum(reaction.emoji.name)+2;
        let ts = new Date();
        console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
        if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
          playerInputs[`${user.tag}`].push(slot);
        }
        let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
        let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
        let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
        if (playerInputs[`${user.tag}`].length >= 3) {
          if (isSet(board[select1],board[select2],board[select3])) {
            setFound = true;
            let ts = new Date();
            console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
            stopsign.reactions.removeAll();
            row1.reactions.removeAll();
            if (board.length >= 6) {
              row2.reactions.removeAll();
            }
            if (board.length >= 9) {
              row3.reactions.removeAll();
            }
            if (board.length >= 12) {
              row4.reactions.removeAll();
            }
            if (board.length >= 15) {
              row5.reactions.removeAll();
            }
            if (board.length >= 18) {
              row6.reactions.removeAll();
            }
            images(910,225)
              .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
              .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
              .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
              .save(`temp/${interaction.guild.id}set.jpeg`);
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if (!data.hasOwnProperty(`${user.tag}`)) {
              data[`${user.tag}`] = 1;
            }
            else {
              data[`${user.tag}`] += 1;
            }
            let str = JSON.stringify(data);
            fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
              if (err) {
                let ts = new Date();
                console.log(ts.toISOString()+' error writing file', err);
              }
            });
            interaction.channel.send(`User ${user.tag} found a set!`);
            if (curDeck.length !== 0) {
              if (board.length < 15) {
                board[select1] = getRand(curDeck);
                board[select2] = getRand(curDeck);
                board[select3] = getRand(curDeck);
              }
              else {
                let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
                for (let i = 0; i < 3; i++) {
                  if (cards[i] >= 12) {
                    board.splice(cards[i],1);
                  }
                  else {
                    board[cards[i]] = board[board.length-1];
                    board.splice(board.length-1,1);
                  }
                }
              }
              for (let i = 0; i < 4; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            if (curDeck.length === 0 && !checkBoardOptimum(board)) {
              let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
              let data = JSON.parse(raw);
              if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
                fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
              }
              let ts = new Date();
              console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
              interaction.channel.send('Game over!');
              printScores(data, interaction, 0, startTime);
            }
            else {
              db.close();
              continueGame(board, curDeck, interaction, startTime);
            }
          }
        }
      }
    });
  }

  if (board.length >= 9) {
    row3 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row3.jpeg`]});
    try {
      await row3.react('1️⃣');
      await row3.react('2️⃣');
      await row3.react('3️⃣');
    } catch (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' one of the emojis failed to react:', err);
    }
    collector3 = row3.createReactionCollector({filter});
    collector3.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
        }
      });
      db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
        }
      });
      if (!setFound) {
        if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
          playerInputs[`${user.tag}`] = [];
        }
        let slot = emojiNum(reaction.emoji.name)+5;
        let ts = new Date();
        console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
        if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
          playerInputs[`${user.tag}`].push(slot);
        }
        let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
        let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
        let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
        if (playerInputs[`${user.tag}`].length >= 3) {
          if (isSet(board[select1],board[select2],board[select3])) {
            setFound = true;
            let ts = new Date();
            console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
            stopsign.reactions.removeAll();
            row1.reactions.removeAll();
            if (board.length >= 6) {
              row2.reactions.removeAll();
            }
            if (board.length >= 9) {
              row3.reactions.removeAll();
            }
            if (board.length >= 12) {
              row4.reactions.removeAll();
            }
            if (board.length >= 15) {
              row5.reactions.removeAll();
            }
            if (board.length >= 18) {
              row6.reactions.removeAll();
            }
            images(910,225)
              .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
              .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
              .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
              .save(`temp/${interaction.guild.id}set.jpeg`);
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if (!data.hasOwnProperty(`${user.tag}`)) {
              data[`${user.tag}`] = 1;
            }
            else {
              data[`${user.tag}`] += 1;
            }
            let str = JSON.stringify(data);
            fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
              if (err) {
                let ts = new Date();
                console.log(ts.toISOString()+' error writing file', err);
              }
            });
            interaction.channel.send(`User ${user.tag} found a set!`);
            if (curDeck.length !== 0) {
              if (board.length < 15) {
                board[select1] = getRand(curDeck);
                board[select2] = getRand(curDeck);
                board[select3] = getRand(curDeck);
              }
              else {
                let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
                for (let i = 0; i < 3; i++) {
                  if (cards[i] >= 12) {
                    board.splice(cards[i],1);
                  }
                  else {
                    board[cards[i]] = board[board.length-1];
                    board.splice(board.length-1,1);
                  }
                }
              }
              for (let i = 0; i < 4; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            if (curDeck.length === 0 && !checkBoardOptimum(board)) {
              let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
              let data = JSON.parse(raw);
              if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
                fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
              }
              let ts = new Date();
              console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
              interaction.channel.send('Game over!');
              printScores(data, interaction, 0, startTime);
            }
            else {
              db.close();
              continueGame(board, curDeck, interaction, startTime);
            }
          }
        }
      }
    });
  }

  if (board.length >= 12) {
    row4 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row4.jpeg`]});
    try {
      await row4.react('1️⃣');
      await row4.react('2️⃣');
      await row4.react('3️⃣');
    } catch (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' one of the emojis failed to react:', err);
    }
    collector4 = row4.createReactionCollector({filter});
    collector4.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
        }
      });
      db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
        }
      });
      if (!setFound) {
        if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
          playerInputs[`${user.tag}`] = [];
        }
        let slot = emojiNum(reaction.emoji.name)+8;
        let ts = new Date();
        console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
        if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
          playerInputs[`${user.tag}`].push(slot);
        }
        let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
        let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
        let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
        if (playerInputs[`${user.tag}`].length >= 3) {
          if (isSet(board[select1],board[select2],board[select3])) {
            setFound = true;
            let ts = new Date();
            console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
            stopsign.reactions.removeAll();
            row1.reactions.removeAll();
            if (board.length >= 6) {
              row2.reactions.removeAll();
            }
            if (board.length >= 9) {
              row3.reactions.removeAll();
            }
            if (board.length >= 12) {
              row4.reactions.removeAll();
            }
            if (board.length >= 15) {
              row5.reactions.removeAll();
            }
            if (board.length >= 18) {
              row6.reactions.removeAll();
            }
            images(910,225)
              .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
              .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
              .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
              .save(`temp/${interaction.guild.id}set.jpeg`);
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if (!data.hasOwnProperty(`${user.tag}`)) {
              data[`${user.tag}`] = 1;
            }
            else {
              data[`${user.tag}`] += 1;
            }
            let str = JSON.stringify(data);
            fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
              if (err) {
                let ts = new Date();
                console.log(ts.toISOString()+' error writing file', err);
              }
            });
            interaction.channel.send(`User ${user.tag} found a set!`);
            if (curDeck.length !== 0) {
              if (board.length < 15) {
                board[select1] = getRand(curDeck);
                board[select2] = getRand(curDeck);
                board[select3] = getRand(curDeck);
              }
              else {
                let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
                for (let i = 0; i < 3; i++) {
                  if (cards[i] >= 12) {
                    board.splice(cards[i],1);
                  }
                  else {
                    board[cards[i]] = board[board.length-1];
                    board.splice(board.length-1,1);
                  }
                }
              }
              for (let i = 0; i < 4; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            if (curDeck.length === 0 && !checkBoardOptimum(board)) {
              let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
              let data = JSON.parse(raw);
              if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
                fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
              }
              let ts = new Date();
              console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
              interaction.channel.send('Game over!');
              printScores(data, interaction, 0, startTime);
            }
            else {
              db.close();
              continueGame(board, curDeck, interaction, startTime);
            }
          }
        }
      }
    });
  }

  if (board.length >= 15) {
    row5 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row5.jpeg`]});
    try {
      await row5.react('1️⃣');
      await row5.react('2️⃣');
      await row5.react('3️⃣');
    } catch (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' one of the emojis failed to react:', err);
    }
    collector5 = row5.createReactionCollector({filter});
    collector5.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
        }
      });
      db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
        }
      });
      if (!setFound) {
        if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
          playerInputs[`${user.tag}`] = [];
        }
        let slot = emojiNum(reaction.emoji.name)+11;
        let ts = new Date();
        console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
        if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
          playerInputs[`${user.tag}`].push(slot);
        }
        let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
        let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
        let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
        if (playerInputs[`${user.tag}`].length >= 3) {
          if (isSet(board[select1],board[select2],board[select3])) {
            setFound = true;
            let ts = new Date();
            console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
            stopsign.reactions.removeAll();
            row1.reactions.removeAll();
            if (board.length >= 6) {
              row2.reactions.removeAll();
            }
            if (board.length >= 9) {
              row3.reactions.removeAll();
            }
            if (board.length >= 12) {
              row4.reactions.removeAll();
            }
            if (board.length >= 15) {
              row5.reactions.removeAll();
            }
            if (board.length >= 18) {
              row6.reactions.removeAll();
            }
            images(910,225)
              .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
              .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
              .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
              .save(`temp/${interaction.guild.id}set.jpeg`);
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if (!data.hasOwnProperty(`${user.tag}`)) {
              data[`${user.tag}`] = 1;
            }
            else {
              data[`${user.tag}`] += 1;
            }
            let str = JSON.stringify(data);
            fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
              if (err) {
                let ts = new Date();
                console.log(ts.toISOString()+' error writing file', err);
              }
            });
            interaction.channel.send(`User ${user.tag} found a set!`);
            if (curDeck.length !== 0) {
              if (board.length < 15) {
                board[select1] = getRand(curDeck);
                board[select2] = getRand(curDeck);
                board[select3] = getRand(curDeck);
              }
              else {
                let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
                for (let i = 0; i < 3; i++) {
                  if (cards[i] >= 12) {
                    board.splice(cards[i],1);
                  }
                  else {
                    board[cards[i]] = board[board.length-1];
                    board.splice(board.length-1,1);
                  }
                }
              }
              for (let i = 0; i < 4; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            if (curDeck.length === 0 && !checkBoardOptimum(board)) {
              let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
              let data = JSON.parse(raw);
              if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
                fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
              }
              let ts = new Date();
              console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
              interaction.channel.send('Game over!');
              printScores(data, interaction, 0, startTime);
            }
            else {
              db.close();
              continueGame(board, curDeck, interaction, startTime);
            }
          }
        }
      }
    });
  }

  if (board.length >= 18) {
    row6 = await interaction.channel.send({files: [`temp/${interaction.guild.id}row6.jpeg`]});
    try {
      await row6.react('1️⃣');
      await row6.react('2️⃣');
      await row6.react('3️⃣');
    } catch (err) {
      let ts = new Date();
      console.log(ts.toISOString()+' one of the emojis failed to react:', err);
    }
    collector6 = row6.createReactionCollector({filter});
    collector6.on('collect', (reaction, user) => {
      reaction.users.remove(user.id);
      db.run('INSERT INTO Players(PlayerName) VALUES (?)', [user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} added to "Players" table`)
        }
      });
      db.run('INSERT INTO ServersPlayers(ServerID, PlayerUID) VALUES (?, (SELECT PlayerUID FROM Players WHERE PlayerName=?))', [interaction.guild.id, user.tag], (err) => {
        if (err) {}
        else {
          let ts = new Date();
          console.log(ts.toISOString()+` user ${user.tag} in guild ${interaction.guild.id} added to "ServersPlayers" table`)
        }
      });
      if (!setFound) {
        if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
          playerInputs[`${user.tag}`] = [];
        }
        let slot = emojiNum(reaction.emoji.name)+14;
        let ts = new Date();
        console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
        if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
          playerInputs[`${user.tag}`].push(slot);
        }
        let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
        let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
        let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
        if (playerInputs[`${user.tag}`].length >= 3) {
          if (isSet(board[select1],board[select2],board[select3])) {
            setFound = true;
            let ts = new Date();
            console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
            stopsign.reactions.removeAll();
            row1.reactions.removeAll();
            if (board.length >= 6) {
              row2.reactions.removeAll();
            }
            if (board.length >= 9) {
              row3.reactions.removeAll();
            }
            if (board.length >= 12) {
              row4.reactions.removeAll();
            }
            if (board.length >= 15) {
              row5.reactions.removeAll();
            }
            if (board.length >= 18) {
              row6.reactions.removeAll();
            }
            images(910,225)
              .draw(images(`images/borders/${board[select3]}.jpeg`),0,0)
              .draw(images(`images/borders/${board[select2]}.jpeg`),305,0)
              .draw(images(`images/borders/${board[select1]}.jpeg`),610,0)
              .save(`temp/${interaction.guild.id}set.jpeg`);
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if (!data.hasOwnProperty(`${user.tag}`)) {
              data[`${user.tag}`] = 1;
            }
            else {
              data[`${user.tag}`] += 1;
            }
            let str = JSON.stringify(data);
            fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
              if (err) {
                let ts = new Date();
                console.log(ts.toISOString()+' error writing file', err);
              }
            });
            interaction.channel.send(`User ${user.tag} found a set!`);
            if (curDeck.length !== 0) {
              if (board.length < 15) {
                board[select1] = getRand(curDeck);
                board[select2] = getRand(curDeck);
                board[select3] = getRand(curDeck);
              }
              else {
                let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
                for (let i = 0; i < 3; i++) {
                  if (cards[i] >= 12) {
                    board.splice(cards[i],1);
                  }
                  else {
                    board[cards[i]] = board[board.length-1];
                    board.splice(board.length-1,1);
                  }
                }
              }
              for (let i = 0; i < 4; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                images(910,225)
                  .draw(images(`images/${board[i*3]}.jpeg`),0,0)
                  .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
                  .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
                  .save(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              }
            }
            if (curDeck.length === 0 && !checkBoardOptimum(board)) {
              let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
              let data = JSON.parse(raw);
              if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
                fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
              }
              let ts = new Date();
              console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
              interaction.channel.send('Game over!');
              printScores(data, interaction, 0, startTime);
            }
            else {
              db.close();
              continueGame(board, curDeck, interaction, startTime);
            }
          }
        }
      }
    });
  }

  const gFilter = (reaction, user) => {
    return reaction.emoji.name === '🛑' && user.id === interaction.user.id;
  };
  const gCollector = stopsign.createReactionCollector({filter: gFilter});
  gCollector.on('collect', (reaction, user) => {
    let ts = new Date();
    console.log(ts.toISOString()+' '+interaction.user.tag+' canceled a game in guild '+interaction.guild.id);

    stopsign.reactions.removeAll()
    row1.reactions.removeAll()
    if (board.length >= 6) {
      row2.reactions.removeAll()
    }
    if (board.length >= 9) {
      row3.reactions.removeAll()
    }
    if (board.length >= 12) {
      row4.reactions.removeAll()
    }
    if (board.length >= 15) {
      row5.reactions.removeAll()
    }
    if (board.length >= 18) {
      row6.reactions.removeAll()
    }
    if (fs.existsSync(`temp/${interaction.guild.id}set.jpeg`)) {
      fs.unlinkSync(`temp/${interaction.guild.id}set.jpeg`);
    }
    let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
    let data = JSON.parse(raw);
    if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
      fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
    }
    interaction.channel.send('Game canceled.');
    printScores(data, interaction, 1, startTime);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newgame')
    .setDescription('Starts a new game of SET'),
  async execute(interaction) {
    if (!fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
      let ts = new Date();
      console.log(ts.toISOString()+' '+interaction.user.tag+' started a game in guild '+interaction.guild.id);

      //let curDeck = [1111,1112,1113,1121,1122,1123,1131,1132,1133,1211,1212,1213,1221,1222,1223,1231,1232,1233,1311,1312,1313,1321,1322,1323,1331,1332,1333];
      let curDeck = [1111,1112,1113,1121,1122,1123,1131,1132,1133,1211,1212,1213,1221,1222,1223,1231,1232,1233,1311,1312,1313,1321,1322,1323,1331,1332,1333,2111,2112,2113,2121,2122,2123,2131,2132,2133,2211,2212,2213,2221,2222,2223,2231,2232,2233,2311,2312,2313,2321,2322,2323,2331,2332,2333,3111,3112,3113,3121,3122,3123,3131,3132,3133,3211,3212,3213,3221,3222,3223,3231,3232,3233,3311,3312,3313,3321,3322,3323,3331,3332,3333];
      let board = newBoard([], curDeck, interaction.guild.id);

      await interaction.reply('New game! For help, use the "/howtoplay" command.');

      let gameData = {}
      let str = JSON.stringify(gameData);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });

      let startTime = new Date();
      continueGame(board, curDeck, interaction, startTime);
    }
    else {
      await interaction.reply('Game is already active');
    }
  }
};
