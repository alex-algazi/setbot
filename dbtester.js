const Sequelize = require('sequelize');
const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// [alpha]
// [beta]

client.once('ready', () => {
	// [gamma]
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'addtag') {
		// [delta]
	} else if (commandName === 'tag') {
		// [epsilon]
	} else if (commandName === 'edittag') {
		// [zeta]
	} else if (commandName === 'taginfo') {
		// [theta]
	} else if (commandName === 'showtags') {
		// [lambda]
	} else if (commandName === 'removetag') {
		// [mu]
	}
});

client.login('your-token-goes-here');
