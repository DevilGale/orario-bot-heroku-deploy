const { prefix } = require('../config.json');
const { findDevelopmentByName, getDevelopmentOptions, getDevelopmentCloseNames } = require('../methods/skills.js');
const { getAdventurerById } = require('../methods/adventurers.js');

module.exports = {
	name: 'development',
	description: 'Searches for all adventurer development abilities matching given data',
	aliases: ['development'],
	args: true,
	usage: '<name_of_development>',
	example: `\`${prefix}development options\` Will PM a list of all the possible developments to you.\n` +
	`\`${prefix}development hunter\` Will send a list of all adventurer developments that are called hunter.`,
	execute(message, args) {
		const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
		}

		if(arraySearch[0] === "options") {
			return message.author.send(getDevelopmentOptions(), { split: true })
				.then(() => {
					if (message.channel.type !== 'dm') {
						message.channel.send(`Options requested! I've sent you a DM! ${message.author}!`);
					}
				})
				.catch(() => message.reply('it seems like I can\'t DM you!'));
		}

		let resultVal = findDevelopmentByName(arraySearch[0]);
		if (resultVal === -1) {
			let msgClose = getDevelopmentCloseNames(arraySearch);
			if(msgClose === '')
				return message.channel.send(`No results found, ${message.author}!`);
			else {
				let msg = `No results found, ${message.author}!\n\n${msgClose}`;
				if(msg.length > 1500)
					return message.author.send(msg, { split: true })
						.then(() => {
							if (message.channel.type !== 'dm') {
								message.channel.send(`Too many results found, I've sent you a DM! ${message.author}!`);
						}
					})
					.catch(() => message.reply('it seems like I can\'t DM you!'));
				else
					message.channel.send(msg);
			}
		}

		let developmentSets = new Map();
		for(let i = 0 ; i < resultVal.length ; i++) {
			if(developmentSets.has(resultVal[i].name))
				developmentSets.get(resultVal[i].name).push(resultVal[i]);
			else
				developmentSets.set(resultVal[i].name, [resultVal[i]]);
		}

		let msgResult = '';
		developmentSets.forEach(function (value, key, map) {
			msgResult += `**${key} (`;
			for(let i = 0 ; i < value[0].effects.length ; i++) {
				msgResult += `${uppercaseFirstLetter(value[0].effects[i].attribute)}: ${value[0].effects[i].modifier}`;
				if(i + 1 !== value[0].effects.length)
					msgResult += `, `;
			}
			msgResult += `)**\n`;

			value.forEach(developObj => {
				let advObj = getAdventurerById(developObj.advId);
				msgResult += `[${advObj.title}] ${advObj.name}\n`;
			});
			msgResult += '\n';
		});
		msgResult.trimEnd('\n');


		if (msgResult.length >= 1500) {
			return message.author.send(msgResult, { split: true })
				.then(() => {
					if (message.channel.type !== 'dm') {
						message.channel.send(`Too many results found, I've sent you a DM! ${message.author}!`);
					}
				})
				.catch(() => message.reply('it seems like I can\'t DM you!'));
		}
		else
			message.channel.send(msgResult);
		//message.channel.send(`Command name: ${command}\nArguments: ${args}`);
		
	},
};

function uppercaseFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}