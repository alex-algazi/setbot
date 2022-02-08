const { SlashCommandBuilder } = require('@discordjs/builders');
const images = require('images');
const fs = require('fs');

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

function isSet(c1, c2, c3) {
  const total = c1+c2+c3;
  if (Math.floor((total/1)%10)%3==0 &&
      Math.floor((total/10)%10)%3==0 &&
      Math.floor((total/100)%10)%3==0 &&
      Math.floor((total/1000)%10)%3==0)
    return true;
  else
    return false;
}

function checkBoard(b) {
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

function addRow(b, d, id)
{
  b.push(getRand(d));
    b.push(getRand(d));
    b.push(getRand(d));
    images(910,225)
      .draw(images(`images/${b[(b.length/3-1)*3]}.jpeg`),0,0)
      .draw(images(`images/${b[(b.length/3-1)*3+1]}.jpeg`),305,0)
      .draw(images(`images/${b[(b.length/3-1)*3+2]}.jpeg`),610,0)
      .save(`temp/${id}row${b.length/3}.jpeg`);
  
}

const badBoard = [1323,1123,1213,1232,1312,1112,1321,1121,1211,2222,2212,3223];

function newBadBoard(b, d, id) {
  for (let i = 0; i < 4; i++) {
    b.push(badBoard[i*3]);
    b.push(badBoard[i*3+1]);
    b.push(badBoard[i*3+2]);
    d.splice(badBoard[i*3]);
    d.splice(badBoard[i*3+1]);
    d.splice(badBoard[i*3+2]);
    images(910,225)
      .draw(images(`images/${b[i*3]}.jpeg`),0,0)
      .draw(images(`images/${b[i*3+1]}.jpeg`),305,0)
      .draw(images(`images/${b[i*3+2]}.jpeg`),610,0)
      .save(`temp/${id}row${i+1}.jpeg`);
  }
  return b;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('newgame')
    .setDescription('Starts a new game of SET'),
  async execute(interaction) {
    if (!fs.existsSync('./temp/gameData.json')) {
      let curDeck = [1111,1112,1113,1121,1122,1123,1131,1132,1133,1211,1212,1213,1221,1222,1223,1231,1232,1233,1311,1312,1313,1321,1322,1323,1331,1332,1333,2111,2112,2113,2121,2122,2123,2131,2132,2133,2211,2212,2213,2221,2222,2223,2231,2232,2233,2311,2312,2313,2321,2322,2323,2331,2332,2333,3111,3112,3113,3121,3122,3123,3131,3132,3133,3211,3212,3213,3221,3222,3223,3231,3232,3233,3311,3312,3313,3321,3322,3323,3331,3332,3333];
      let board = newBadBoard([], curDeck, interaction.guild.id);
      let setFound = false;

      while (!checkBoard(board))
      {
        addRow(board, curDeck, interaction.guild.id);
      }

      const gameData = {
        "curDeck": curDeck,
        "board": board
      }
      const str = JSON.stringify(gameData);
      fs.writeFile('./temp/gameData.json', str, err => {
        if (err) {
          console.log('Error writing file', err);
        } else {
          console.log('Successfully wrote file');
        }
      });

      await interaction.reply('New game!');

      let row1 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row1.jpeg`]});
      let row2 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row2.jpeg`]});
      let row3 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row3.jpeg`]});
      let row4 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row4.jpeg`]});
      let row5;
      let row6;

      if (board.length >= 15){
        row5 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row5.jpeg`]});
      }
      if (board.length >= 18)
      {
        row6 = await interaction.channel.send({files: [`./temp/${interaction.guild.id}row6.jpeg`]});
      }

      

      try {
        await row1.react('1️⃣');
        await row1.react('2️⃣');
        await row1.react('3️⃣');
        await row2.react('1️⃣');
        await row2.react('2️⃣');
        await row2.react('3️⃣');
        await row3.react('1️⃣');
        await row3.react('2️⃣');
        await row3.react('3️⃣');
        await row4.react('1️⃣');
        await row4.react('2️⃣');
        await row4.react('3️⃣');
        if (board.length >= 15)
        {
          await row5.react('1️⃣');
          await row5.react('2️⃣');
          await row5.react('3️⃣'); 
        }

        if (board.length >= 18)
        {
          await row6.react('1️⃣');
          await row6.react('2️⃣');
          await row6.react('3️⃣'); 
        }
      } catch (error) {
        console.error('One of the emojis failed to react:', error);
      }

      const filter = (reaction, user) => {
        return ['1️⃣','2️⃣','3️⃣'].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };

      const collector1 = row1.createReactionCollector({filter});
      const collector2 = row2.createReactionCollector({filter});
      const collector3 = row3.createReactionCollector({filter});
      const collector4 = row4.createReactionCollector({filter});

      collector1.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag} on ${collector1.message.id}`);
        reaction.users.remove(user.id);
      });
      collector2.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag} on ${collector2.message.id}`);
        reaction.users.remove(user.id);
      });
      collector3.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag} on ${collector3.message.id}`);
        reaction.users.remove(user.id);
      });
      collector4.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag} on ${collector4.message.id}`);
        reaction.users.remove(user.id);
      });
    }
    else {
      await interaction.reply('Game is already active');
    }
  }
};
