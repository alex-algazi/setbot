### **Spring 2022 Senior Project**

### **Weekly Status Report**

### **Discord SET Bot**

https://github.com/alex-algazi/setbot

*Alex Algazi (asa10@hood.edu); Diana Teka (dyt1@hood.edu)*

## WEEK 2 (FEB 7 - FEB 14)
### A. Weekly Accomplishments
1. 
2. 
3. 
### B. Problems/Issues
1. 
2. 
3. 
### C. Next Week's Planned Work
1. 
2. 
3. 
### D. Time Log
Alex:  hrs, Diana:  hrs

## WEEK 1 (JAN 31 - FEB 7)
### A. Weekly Accomplishments
1. "/newgame" command file now includes majority of the game's logic. (Alex)
2. Can create a board of 4 messages, and emoji reactions are then displayed on those messages. This is done by first setting the "current deck" array to a full deck (commands/newgame.js line 57), then generating a board by selecting 12 random cards and converting them to images, one per row (commands/newgame.js lines 12-25). Current deck and board states are then saved to a temp JSON file (commands/newgame.js lines 60-71). Emojis are then added, three per message (commands/newgame.js lines 81-96). (Alex)
3. "/cancelgame" can delete the current game data JSON file, thus ending the current game (commands/cancelgame.js). (Diana)
### B. Problems/Issues
1. There was a bug that caused the "current deck" array to persist between games. Originally, there was a "base deck" array with all 81 cards listed, but to fix this persistence bug, we did away with that array, and now "current deck" is set equal directly to the 81 card array. (Alex)
2. Going forward, it is unclear how we are going to loop the game's logic while also listening for user emoji interactions. Once we get to the "listening" stage of the project in a few weeks, we will need to give more consideration to our overall structure.
### C. Next Week's Planned Work
1. Diana will make it so that the board is checked for sets. This will enable my task listed below.
2. When there are no sets on the board, rows need to be added. Alex will determine the best way to do this and work towards implementing it.
3. We need to figure out what our database solution is going to be, and figure out what server we are hosting it on (pluto or wyrd).
### D. Time Log
Alex: 3 hrs, Diana: 2 hrs
