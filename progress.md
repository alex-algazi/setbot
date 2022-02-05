# Week 1 (Jan 31 - Feb 7)
### A. Weekly Accomplishments:
1. "/newgame" command file now includes majority of the game's logic. (Alex)
2. Can create a board of 4 messages, and emoji reactions are then displayed on those messages. (Alex)
3. "/cancelgame" can delete the current game data file, thus ending the current game. (Diana)
### B. Problems/Issues:
1. There was a bug that caused the "current deck" array to persist between games. Originally, there was a "base deck" array with all 81 cards listed, but to fix this persistence bug, we did away with that array, and now "current deck" is set equal directly to the 81 card array. (Alex)
2. Going forward, it is unclear how we are going to loop the game's logic while also listening for user emoji interactions. Once we get to the "listening" stage of the project in a few weeks, we will need to give more consideration to our overall structure.
### C. Next Week's Planned Work:
1. Diana will make it so that the board is checked for sets. This will enable my task listed below.
2. When there are no sets on the board, rows need to be added. Alex will determine the best way to do this and work towards implementing it.
### Total Number of Hours
Alex: 4 hrs, Diana: 2 hrs
