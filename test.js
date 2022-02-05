// NUM one two thr
// SHD sol str opn
// COL red grn blu
// SHP ovl sqg dmd

const images = require("images");
const decklist = [1111,1112,1113,1121,1122,1123,1131,1132,1133,1211,1212,1213,1221,1222,1223,1231,1232,1233,1311,1312,1313,1321,1322,1323,1331,1332,1333,2111,2112,2113,2121,2122,2123,2131,2132,2133,2211,2212,2213,2221,2222,2223,2231,2232,2233,2311,2312,2313,2321,2322,2323,2331,2332,2333,3111,3112,3113,3121,3122,3123,3131,3132,3133,3211,3212,3213,3221,3222,3223,3231,3232,3233,3311,3312,3313,3321,3322,3323,3331,3332,3333]

let deck = decklist;
let board = [];

function genBoard() {
  for (let i = 0; i < 4; i++) {
    board.push(getRand());
    board.push(getRand());
    board.push(getRand());
    images(910,225)
    .draw(images(`images/${board[i*3]}.jpeg`),0,0)
    .draw(images(`images/${board[i*3+1]}.jpeg`),305,0)
    .draw(images(`images/${board[i*3+2]}.jpeg`),610,0)
    .save(`temp/row${i+1}.jpeg`);
  }
}

function getRand() {
  let rand = Math.floor(Math.random()*deck.length);
  let card = deck[rand];
  deck.splice(rand,1);
  return card;
}

genBoard();

function isSet(card1, card2, card3) {
  const total = card1+card2+card3;
  if (Math.floor((total/1)%10)%3==0 &&
      Math.floor((total/10)%10)%3==0 &&
      Math.floor((total/100)%10)%3==0 &&
      Math.floor((total/1000)%10)%3==0)
    return true;
  else
    return false;
}
