# Discord SET Bot
This is the repository for our Discord bot, which facilitates a multiplayer game of "SET".

This project is made possible by [discord.js](https://discord.js.org), a Node.js framework for the Discord API.

## How to play
First, invite the bot to your server using [this link](https://discord.com/api/oauth2/authorize?client_id=917630979659685908&permissions=0&scope=bot%20applications.commands). Then, start a game using the "/newgame" command, and cards will be dealt onto the "board" for all players to see. The goal of the game is to find "sets", or groups of three cards where each property is **either the same for all three cards or different for all three cards**. Here are some examples of sets:

![set1](https://github.com/alex-algazi/setbot/blob/main//images/sets/1.jpeg?raw=true)

<ins>Number of shapes:</ins> all different.
<ins>Shading:</ins> all the same.
<ins>Color:</ins> all the same.
<ins>Shape:</ins> all the same.

![set2](https://github.com/alex-algazi/setbot/blob/main//images/sets/2.jpeg?raw=true)

<ins>Number of shapes:</ins> all different.
<ins>Shading:</ins> all different.
<ins>Color:</ins> all different.
<ins>Shape:</ins> all the same.

![set3](https://github.com/alex-algazi/setbot/blob/main//images/sets/3.jpeg?raw=true)

<ins>Number of shapes:</ins> all different.
<ins>Shading:</ins> all different.
<ins>Color:</ins> all different.
<ins>Shape:</ins> all different.

When a user finds a set, the board will be regenerated with three new cards in place of the old ones. Play will continue until the deck is empty and there are no sets remaining on the board, or until the user who started the game cancels it.
