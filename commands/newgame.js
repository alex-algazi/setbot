const { SlashCommandBuilder } = require('@discordjs/builders');
const joinImages = require('join-images');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

/**
 * Returns a random card code from the cards remaining in the deck
 * @param {number[]} d - the current decklist
 * @returns {number} the output card, randomly selected
 */
function getRand(d) {
  let rand = Math.floor(Math.random()*d.length);
  let card = d[rand];
  d.splice(rand,1);
  return card;
}

/**
 * Generates a new board of 12 cards and generates row images in the temp directory
 * @param {number[]} b - the current board
 * @param {number[]} d - the current decklist
 * @param {string} id - guild/server ID
 * @returns {number[]} the new board, without the removed cards
 */
function newBoard(b, d, id) {
  for (let i = 0; i < 4; i++) {
    b.push(getRand(d));
    b.push(getRand(d));
    b.push(getRand(d));
    joinImages.joinImages([`images/${b[i*3]}.jpeg`,`images/${b[i*3+1]}.jpeg`,`images/${b[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
      img.toFile(`temp/${id}row${i+1}.jpeg`);
    });
  }
  return b;
}

/**
 * Old check board algorithm, time complexity O(n^3)
 * @param {number[]} b - the current board
 * @returns {boolean} true if there is a set, false if no set
 */
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

/**
 * New check board algorithm, which utilizes Turán's Theorem (source: http://pbg.cs.illinois.edu/papers/set.pdf)
 * @param {number[]} b - the current board
 * @returns {boolean} true if there is a set, false if no set
 */
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

/**
 * Given two cards, finds the card code of the third card which would make a set
 * @param {number} c1 - first input card
 * @param {number} c2 - second input card
 * @returns {number} the third card that makes a set with c1 and c2
 */
function thirdCard(c1, c2) {
  let total = c1+c2;
  let result = '';
  switch(Math.floor((total/1000)%10)%3) { // isolates the 1st digit
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
  switch(Math.floor((total/100)%10)%3) {  // isolates the 2nd digit
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
  switch(Math.floor((total/10)%10)%3) {   // isolates the 3rd digit
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
  switch(Math.floor((total/1)%10)%3) {    // isolates the 4th digit
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

/**
 * Adds three cards to the board from the deck, generates a new row image
 * @param {number[]} b - the current board
 * @param {number[]} d - the current decklist
 * @param {string} id - guild/server ID
 */
function addRow(b, d, id) {
  b.push(getRand(d));
  b.push(getRand(d));
  b.push(getRand(d));
  joinImages.joinImages([`images/${b[(b.length/3-1)*3]}.jpeg`,`images/${b[(b.length/3-1)*3+1]}.jpeg`,`images/${b[(b.length/3-1)*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
    img.toFile(`temp/${id}row${b.length/3}.jpeg`);
  });
}

/**
 * Simply transforms the emojis 1️⃣ 2️⃣ and 3️⃣ into numbers
 * @param {string} e - the emoji to be translated
 * @returns {number} the number, translated from emoji
 */
function emojiNum(e) {
  if (e === '1️⃣') return 1;
  if (e === '2️⃣') return 2;
  if (e === '3️⃣') return 3;
}

/**
 * Using modulo arithmetic, checks to see if the three provided cards are a set
 * @param {number} c1 - first input card
 * @param {number} c2 - second input card
 * @param {number} c3 - third input card
 * @returns {boolean} true if c1, c2, and c3 are a set, false if no set
 */
function isSet(c1, c2, c3) {
  let total = c1+c2+c3;
  if (Math.floor((total/1000)%10)%3===0 &&  // isolates the 1st digit
      Math.floor((total/100)%10)%3===0 &&   // isolates the 2nd digit
      Math.floor((total/10)%10)%3===0 &&    // isolates the 3rd digit
      Math.floor((total/1)%10)%3===0)       // isolates the 4th digit
    return true;
  else
    return false;
}

/**
 * Prints and saves the scores recorded for a given game
 * @param {number[]} d - the current decklist
 * @param {Object} int - the discord interaction object
 * @param {number} can - boolean for cancellation. 1 for cancelled, 0 for not cancelled
 * @param {string} startTime - ISO string representing a timestamp of when the game started
 */
async function printScores(d, int, can, startTime) {
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
    });   // opens the database connction

    let convertedTime = startTime.toISOString().slice(0,19).replace('T',' ');

    await runPromise(db, `game in guild ${int.guild.id} added to database`, 'INSERT INTO Games(ServerID, Cancelled, GameStart) VALUES (?,?,?)', [int.guild.id, can, convertedTime]);

    let sorted = Object.fromEntries(
      Object.entries(d).sort(([,a],[,b]) => b-a)    // sorts the scores in descending order
    );

    for (let i = 0; i < Object.keys(sorted).length; i++) {
      await runPromise(db, `user ${Object.keys(sorted)[i]} added to table "PlayersScores" with a score of ${sorted[Object.keys(sorted)[i]]}`, 'INSERT INTO PlayersGames(PlayerUID, GameUID, Score) VALUES ((SELECT PlayerUID FROM Players WHERE PlayerName=?),(SELECT GameUID FROM Games WHERE ServerID=? ORDER BY GameUID DESC LIMIT 1),?)', [Object.keys(sorted)[i], int.guild.id, sorted[Object.keys(sorted)[i]]]);
    }

    let longestName = 0;
    for (const name in sorted) {        // determines the longest name for table formatting
      if (name.length > longestName) {
        longestName = name.length;
      }
    }
    let scores = 'Scores:\n```User' + ' '.repeat(longestName-3) + '| Score' + '\n' + '-'.repeat(longestName+1) + '+------\n';
    for (let i = 0; i < Object.keys(sorted).length; i++) {
      scores += `${Object.keys(sorted)[i]}` + ' '.repeat(longestName-Object.keys(sorted)[i].length+1) + '| ' + ' '.repeat(2-sorted[Object.keys(sorted)[i]].toString().length) +  `${sorted[Object.keys(sorted)[i]]}\n`;
    }
    scores += '```';
    int.channel.send(scores);     // message sent to channel

    db.close();
  }
}

/**
 * A promise-based run function for sqlite3
 * @param {Object} db - the database connection object
 * @param {string} str - the message to be logged upon completion
 * @param {string} query - the query string to be executed
 * @param {string[]} params - the input parameters of the query
 * @returns {Promise} the promise function for db.run
 */
function runPromise(db, str, query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err, rows) => {
      if (err) {
        reject(err);
      }
      else {
        let ts = new Date();
        console.log(ts.toISOString()+' '+str);
        resolve(rows);
      }
    });
  });
}

/**
 * The core game loop, which contains recirsive calls
 * @param {number[]} board - the current board
 * @param {number[]} curDeck - the current decklist
 * @param {number[]} interaction - the discord interaction object
 * @param {string} startTime - ISO string representing a timestamp of when the game started
 */
async function continueGame(board, curDeck, interaction, startTime) {
  while (!checkBoardOptimum(board)) {   // while no set on board, add rows
    addRow(board, curDeck, interaction.guild.id);
  }

  if (fs.existsSync(`temp/${interaction.guild.id}set.jpeg`)) {    // prints last found set if it exists
    await interaction.channel.send({files: [`temp/${interaction.guild.id}set.jpeg`]});
  }

  joinImages.joinImages(['images/borders/1111.jpeg','images/borders/1111.jpeg','images/borders/1111.jpeg'],{direction: 'horizontal', offset: 5}).then((img) => {
    img.toFile(`temp/${interaction.guild.id}set.jpeg`);
  });

  let stopsign = await interaction.channel.send(`${curDeck.length} cards remaining. To cancel current game, press the stop sign.\n(Only the user who started the game can cancel it)`);
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
  let filter = (reaction, user) => {    // filter used by all 6 reaction collectors
    return ['1️⃣','2️⃣','3️⃣'].includes(reaction.emoji.name) && user.id != 917630979659685908;
  };
  let playerInputs = {}
  let setFound = false;
  let cancelled = false;

  /*
   * The following section consists of six reaction collectors, which interpret three
   * inputs each: one for each card in the row. These can be divided into 4 steps:
   * 
   * 1 Send the row image as a message to the channel
   * 2 react to the message with the following emotes: 1️⃣ 2️⃣ and 3️⃣
   * 3 create reaction collector
   * 4 define the 'collect' action for the collector
   * 
   * Since the six collectors are mostly identical, notes will only be provided for
   * the first one. One thing to note is that collectors 2 through 6 are only created
   * if there are enough cards on the board to require them. So, for instance, if there
   * are only 9 cards on the board, then only the first 3 collectors are generated.
   */
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
    let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
    let data = JSON.parse(raw);
    if (!data.hasOwnProperty(`${user.tag}`)) {    // creates user score if DNE
      data[`${user.tag}`] = 0;
    }
    let str = JSON.stringify(data);
    fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
      if (err) {
        let ts = new Date();
        console.log(ts.toISOString()+' error writing file', err);
      }
    });

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
    if (!setFound && !cancelled) { // the rest only works if no one else has found a set or cancelled the game
      if (!playerInputs.hasOwnProperty(`${user.tag}`)) {
        playerInputs[`${user.tag}`] = [];
      }
      let slot = emojiNum(reaction.emoji.name)-1;   // this is the only unique line in the collectors
      let ts = new Date();
      console.log(ts.toISOString()+' '+user.tag+' selected card #'+(slot+1)+' in guild '+interaction.guild.id);
      if (slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2] && slot !== playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3]) {
        playerInputs[`${user.tag}`].push(slot);
      }   // fixes "Jesus's bug": without this check, a player can select the same card three times in a row and get a set
      let select1 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-1];
      let select2 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-2];
      let select3 = playerInputs[`${user.tag}`][playerInputs[`${user.tag}`].length-3];
      if (playerInputs[`${user.tag}`].length >= 3) {
        if (isSet(board[select1],board[select2],board[select3])) { // if player finds a set
          setFound = true;    // lock other players out of finding sets momentarily
          let ts = new Date();
          console.log(ts.toISOString()+' '+user.tag+' found a set in guild '+interaction.guild.id);
          stopsign.reactions.removeAll();   // slooowwwlllyy removes all the emojis from the messages
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
          joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
            img.toFile(`temp/${interaction.guild.id}set.jpeg`);
          });   // generate the image that shows the set found
          let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
          let data = JSON.parse(raw);
          data[`${user.tag}`] += 1;   // add one point to the user's score
          let str = JSON.stringify(data);
          fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
            if (err) {
              let ts = new Date();
              console.log(ts.toISOString()+' error writing file', err);
            }
          });
          interaction.channel.send(`User ${user.tag} found a set!`);
          if (curDeck.length !== 0) {   // if there are cards remaining in the deck...
            if (board.length < 15) {    // replace cards if less than 15 on board
              board[select1] = getRand(curDeck);
              board[select2] = getRand(curDeck);
              board[select3] = getRand(curDeck);
            }
            else {    // bring newer cards into old slots if not
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
            for (let i = 0; i < 4; i++) {   // regenerate board rows
              joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              });
            }
          }
          else {    // if no cards in deck
            let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
            board.splice(cards[0],1);
            board.splice(cards[1],1);
            board.splice(cards[2],1);
            for (let i = 0; i < board.length/3; i++) {
              joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
              });
            }
          }
          if (curDeck.length === 0 && !checkBoardOptimum(board)) {    // if no cards and no sets...
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            if(fs.existsSync(`temp/${interaction.guild.id}data.json`)) {
              fs.unlinkSync(`temp/${interaction.guild.id}data.json`);
            }
            let ts = new Date();
            console.log(ts.toISOString()+' game over in guild '+interaction.guild.id);
            interaction.channel.send('Game over!');
            printScores(data, interaction, 0, startTime);   // end game
          }
          else {    // if there are more sets to be found...
            db.close();
            continueGame(board, curDeck, interaction, startTime);   // continue game
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
      let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
      let data = JSON.parse(raw);
      if (!data.hasOwnProperty(`${user.tag}`)) {
        data[`${user.tag}`] = 0;
      }
      let str = JSON.stringify(data);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });
  
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
      if (!setFound && !cancelled) {
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
            joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
              img.toFile(`temp/${interaction.guild.id}set.jpeg`);
            });
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            data[`${user.tag}`] += 1;
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
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
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
      let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
      let data = JSON.parse(raw);
      if (!data.hasOwnProperty(`${user.tag}`)) {
        data[`${user.tag}`] = 0;
      }
      let str = JSON.stringify(data);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });
  
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
      if (!setFound && !cancelled) {
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
            joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
              img.toFile(`temp/${interaction.guild.id}set.jpeg`);
            });
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            data[`${user.tag}`] += 1;
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
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
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
      let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
      let data = JSON.parse(raw);
      if (!data.hasOwnProperty(`${user.tag}`)) {
        data[`${user.tag}`] = 0;
      }
      let str = JSON.stringify(data);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });
  
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
      if (!setFound && !cancelled) {
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
            joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
              img.toFile(`temp/${interaction.guild.id}set.jpeg`);
            });
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            data[`${user.tag}`] += 1;
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
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
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
      let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
      let data = JSON.parse(raw);
      if (!data.hasOwnProperty(`${user.tag}`)) {
        data[`${user.tag}`] = 0;
      }
      let str = JSON.stringify(data);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });
  
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
      if (!setFound && !cancelled) {
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
            joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
              img.toFile(`temp/${interaction.guild.id}set.jpeg`);
            });
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            data[`${user.tag}`] += 1;
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
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
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
      let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
      let data = JSON.parse(raw);
      if (!data.hasOwnProperty(`${user.tag}`)) {
        data[`${user.tag}`] = 0;
      }
      let str = JSON.stringify(data);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });
  
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
      if (!setFound && !cancelled) {
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
            joinImages.joinImages([`images/borders/${board[select3]}.jpeg`,`images/borders/${board[select2]}.jpeg`,`images/borders/${board[select1]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
              img.toFile(`temp/${interaction.guild.id}set.jpeg`);
            });
            let raw = fs.readFileSync(`temp/${interaction.guild.id}data.json`);
            let data = JSON.parse(raw);
            data[`${user.tag}`] += 1;
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
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
              }
            }
            else {
              let cards = playerInputs[`${user.tag}`].slice(-3).sort((a,b)=>{return a-b;}).reverse();
              board.splice(cards[0],1);
              board.splice(cards[1],1);
              board.splice(cards[2],1);
              for (let i = 0; i < board.length/3; i++) {
                joinImages.joinImages([`images/${board[i*3]}.jpeg`,`images/${board[i*3+1]}.jpeg`,`images/${board[i*3+2]}.jpeg`],{direction: 'horizontal', offset: 5}).then((img) => {
                  img.toFile(`temp/${interaction.guild.id}row${i+1}.jpeg`);
                });
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

  const gFilter = (reaction, user) => {   // filter used by cancel button
    return reaction.emoji.name === '🛑' && user.id === interaction.user.id;
  };    // only user who started the game can canel it
  const gCollector = stopsign.createReactionCollector({filter: gFilter});
  gCollector.on('collect', (reaction, user) => {
    cancelled = true;   // set cancelled to true, to avoid synchronicity conflicts

    let ts = new Date();
    console.log(ts.toISOString()+' '+interaction.user.tag+' canceled a game in guild '+interaction.guild.id);

    stopsign.reactions.removeAll()    // sloooooowly remove all the reactions
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
    printScores(data, interaction, 1, startTime);   // end game
  });
}

module.exports = { // The entry point for the game, starting from a newgame interaction
  data: new SlashCommandBuilder()
    .setName('newgame')
    .setDescription('Starts a new game of SET'),
  async execute(interaction) {
    if (!fs.existsSync(`temp/${interaction.guild.id}data.json`)) {    // if game doesn't already exist in this server
      let ts = new Date();
      console.log(ts.toISOString()+' '+interaction.user.tag+' started a game in guild '+interaction.guild.id);

      let curDeck = [1111,1112,1113,1121,1122,1123,1131,1132,1133,1211,1212,1213,1221,1222,1223,1231,1232,1233,1311,1312,1313,1321,1322,1323,1331,1332,1333,2111,2112,2113,2121,2122,2123,2131,2132,2133,2211,2212,2213,2221,2222,2223,2231,2232,2233,2311,2312,2313,2321,2322,2323,2331,2332,2333,3111,3112,3113,3121,3122,3123,3131,3132,3133,3211,3212,3213,3221,3222,3223,3231,3232,3233,3311,3312,3313,3321,3322,3323,3331,3332,3333];
      let board = newBoard([], curDeck, interaction.guild.id);

      await interaction.reply('New game! For help, use the "/howtoplay" command.');

      let gameData = {}   // initializes the (empty) player scores object
      let str = JSON.stringify(gameData);
      fs.writeFileSync(`temp/${interaction.guild.id}data.json`, str, err => {
        if (err) {
          let ts = new Date();
          console.log(ts.toISOString()+' error writing file', err);
        }
      });   // writes the object to the temp folder

      let startTime = new Date();
      continueGame(board, curDeck, interaction, startTime);   // first call to game loop
    }
    else {
      await interaction.reply('Game is already active');
    }
  }
};
