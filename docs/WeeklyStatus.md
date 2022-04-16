### **Spring 2022 Senior Project**

### **Weekly Status Report**

### **Discord SET Bot**

https://github.com/alex-algazi/setbot

*Alex Algazi (asa10@hood.edu); Diana Teka (dyt1@hood.edu)*

## WEEK 11 (APR 11 - APR 18)
### A. Weekly Accomplishments
1. New command, called "/showstats", which can show server stats and individual game stats depending on whether it gets the Game ID as a parameter. (See commands/showstats.js)
### B. Problems/Issues
1. Had an issue where the queries were being not being executed synchronously, which led to data nto being retrieved before it was being operated on. Fixed by using two promise functions, one for getting a single result, and one for getting all results of a query. (near the top of showstats.js)
2. Faced a lot of difficulties in constructing the various queries required. In particular, the query for fetching GameUID, cancellation status, time elapsed, and the winner of the game, proved to be very tricky, especially because if multiple users tie for top score, it can be challenging to determine if there was a tie or not. The full query is on line #146 in showstats.js. It is ridiculously long, but so far it seems to be performing as expected. We will have to see if it holds up under more extreme loads with bigger datasets.
### C. Next Week's Planned Work
1. Going over the entire program with a fine-toothed comb to ensure this product can be delivered in its current state.
2. Contact the systems administrator to get a pluto account so that I can be ready to deploy in the coming weeks.
### D. Time Log
Alex: 10 hrs

## WEEK 10 (APR 4 - APR 11)
### A. Weekly Accomplishments
1. Successfully implemented database inserts for the following tables: Players, ServersPlayers, and Games.
2. Timestamps are now successfully saved to the database as well.
3. Games are saved to DB whether they are cancelled or completed, but there is a new boolean variable "Cancelled" (see database/schema.sql) tha denotes this, 0 for completed, 1 for cancelled.
### B. Problems/Issues
1. For a while I couldn't figure out how to retrieve the PlayerUID and then use it in a query. Solved by using a select query in place of one of the values of an insert statement. Didn't know you could do that!
### C. Next Week's Planned Work
1. Add inserts for PlayersGames with scores. Must be done in a for loop.
2. Start working on a "/showstats" command that will show relevant info to users.
### D. Time Log
Alex: 3 hrs

## WEEKS 6-9 (MAR 7 - APR 4)
### A. Monthly Accomplishments
1. Finalized our database schema, and wrote a script that creates the database. (Diana, finished by Alex)
2. Wrote a script that populates the database with dummy data. (Alex)
3. Begun to implement the database inserts. As of now, we have the db connection opening and closing, as well as the beginnings of the game ending insert statement. (Alex)
### B. Problems/Issues
1. Our original database design had a redundant table, since the Discord API does not allow fetching of server/guild names. We removed the redundant table. (Alex)
### C. Next Week's Planned Work
1. Finish implementing the insert statements, in order to have more time this month to work on actually using those stats in meaningful ways using queries. (Alex)
### D. Time Log
Alex: 8 hrs

## WEEK 5 (FEB 28 - MAR 7)
### A. Weekly Accomplishments
1. Implemented optimum pair search. Board is now split into two halves before being operated on, due to a graph theory theorem that shows that a board without sets can be tested in this way. (Alex)
2. Worked out an ideal structure for our database. (Diana)
### B. Problems/Issues
1. We could not figure out how to properly make a diagram about our database, so we made it in excel instead. We will need to figure out how to actually implement this solution. 
### C. Next Week's Planned Work
1. Write a script that creates an appropriate database for our project. (Diana)
2. Write another script that populates said database with dummy data for testing purposes. (Alex)
### D. Time Log
Alex: 4 hrs, Diana: 4 hrs

## WEEK 4 (FEB 21 - FEB 28)
### A. Weekly Accomplishments
1. Improved the scores display. Now it shows an ASCII table with all players' scores listed in descending order. (Diana)
2. Circumvented the lagging fourth row bug by completely rearranging the structure of the program. Now, each row is generated, reacted, and a collector is made BEFORE the next row is processed. This allows time for whatever was causing the timing bug to sort itself out, and leads to less downtime during the game. (Alex)
3. Sets are now shown as the game is played, using green borders around the images to make them distinct from the board. (Alex)
### B. Problems/Issues
1. Previously, the scoreboard would display whitespace in accordance with the longest possible discord username (37 characters). Now, we find the longest username among the players of the game, and scale the whitespace according to this longest name. (Diana)
### C. Next Week's Planned Work
1. Try to implement more efficient set finding algorithm that we found in a scholarly article. (Alex)
2. Finalize our database's structure. (Diana)
### D. Time Log
Alex: 3 hrs, Diana: 3 hrs

## WEEK 3 (FEB 14 - FEB 21)
### A. Weekly Accomplishments
1. Player scores are now displayed at the end of the game, or if a game is cancelled. (Diana)
2. There is now a help command, called /howtoplay. It displays a rules message which will teach players how to play set. (Diana)
3. We have found a way to run the app via systemd, using a service file to run it via node. (Alex)
### B. Problems/Issues
1. Previously, when the game was cancelled before any player had found a set, the app would crash. Fixed by checking to see if the "scores" object was empty before operating on it. (Alex)
2. Previously, the service file was giving an "exit-code" error. Fixed by adding a "User" field to the service file. (Alex)
### C. Next Week's Planned Work
1. Figure out a better way to display scores (like a table-style leaderboard) and declare a winner/winners. (Diana)
2. Find out why the last row takes so long to generate, and try to fix it. (Alex)
### D. Time Log
Alex: 5 hrs, Diana: 3 hrs

## WEEK 2 (FEB 7 - FEB 14)
### A. Weekly Accomplishments
1. Board is checked for sets, and when there are no sets, more cards are added. This is done using a while loop which then calls the helper function "addRow" if there are no sets. (Diana)
2. Instead of using a while loop structure, we have transitioned to a recursive function call due to Discord API limitations. The main block (at the bottom of commands/newgame.js) only creates a deck, a board, and a basic reply, and then passes all that data into an asyncronous function called "continueGame". This allows the reaction collectors to opperate at the correct scope, which was not possible in a while loop structure, and also reduces repitition in the code overall. (Alex)
3. Cancel game has been moved from being a seperate command to being a button on one of the reccuring messages. This was done primarily due to a technical limitation: the seperate command file had no access to game states and therefore could not reliably end the game. "cancelgame.js" has been removed. (Alex)
4. Row opperations only occur if the rows actually exist. This was necessary to avoid errors in game completion states with less than 12 cards on the board. (Alex)
5. "gameData.json" has been changed to "\<guildId\>data.json", and now only contains player scoring information for individual games. (Alex)
### B. Problems/Issues
1. New rows were not being added properly, and images were not being generated. This was fixed by modifying the "addRow" function to include image generation. (Diana)
2. Various end game states were impossible to reach without errors due to our previous assumption that the board would always have at least 4 rows. Now, every row except the first one (which is guaranteed) are checked for existence before being actioned upon. (Alex)
3. Upon a player finding a set, several instances of the same bug appeared where the wrong cards were being removed. This was solved by sorting the board slots in descending order prior to operating on them. (Alex)
4. Thanks to Jesus Lopez for discovering this one! Previously, if a user selected the same card three times in a row, the system thought they had found a set. Fixed by refusing duplicate inputs. (Alex)
### C. Next Week's Planned Work
1. Player scores must be displayed if the game is canceled or finished. This will be done as a helper function (currently existing in minimal form at lines 72-74 of newgame.js) which takes in the player scores object and prints each players scores iteratively. (Diana)
2. A new command, idealy called "/howtoplay", will be generated in order to introduce players to the rules of the game, since the existing set rulebook online contains rules that do not apply to a computer implementation. (i.e. "Players will then place cards on the board", etc.) This command will only show outputs to the user who requested it. (Diana)
3. We need to figure out what sorts of elevated permissions a linux user needs in order to register a node.js runtime as a system background service. This will be done using a virtual machine. (Alex)
### D. Time Log
Alex: 6 hrs, Diana: 2 hrs

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
