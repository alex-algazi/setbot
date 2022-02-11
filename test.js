// NUM one two thr
// SHD sol str opn
// COL red grn blu
// SHP ovl sqg dmd

function isSet(c1, c2, c3) {
  let total = c1+c2+c3;
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

const board = [1221,3233,2232,2112,1212,2323,2312,3332,1323];

console.log(checkBoard(board));
