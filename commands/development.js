const { prefix } = require('../config.json');
const { findDevelopmentByName, getDevelopmentOwnerId, getDevelopmentOptions } = require('../methods/skills.js');
const { getAdventurerById } = require('../methods/adventurers.js');

module.exports = {
	name: 'development',
	description: 'Searches for all adventurer development abilities matching given data',
	aliases: ['development'],
	args: true,
	usage: '<one or more attribute(s)>',
	example: `\`${prefix}development light_magic_attack\` Will send a list of all adventurer skills that does light magic damage.\n` +
	`\`${prefix}combat sleepres -magic\` Will send a list of all adventurer skills that gives either sleep resist or debuffs magic.`,
	execute(message, args) {
		const arraySearch = [];

		for (let i = 0; i < args.length; i++) {
			arraySearch[i] = args[i].toLowerCase();
		}

		if(arraySearch[0] === "options") {
			console.log(getDevelopmentOptions());
		}

		let resultVal = findDevelopmentByName(arraySearch[0]);
		if (resultVal === -1) {
			return message.channel.send(`No results found, ${message.author}!`);
		}

		let developmentSets = new Map();
		for(let i = 0 ; i < resultVal.length ; i++) {
			if(developmentSets.has(resultVal[i].name))
				developmentSets.get(resultVal[i].name).push(resultVal[i]);
			else
				developmentSets.set(resultVal[i].name, []);
		}

		console.log(developmentSets);

		let msgResult = '';
		developmentSets.forEach(function (value, key, map) {
			msgResult += `**${key} (`;
			for(let i = 0 ; i < value[0].effects.length ; i++) {
				msgResult += `${value[0].effects[i].attribute}: ${value[0].effects[i].modifier}`;
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

		console.log("The Message:");
		console.log(msgResult);
//			msgResult += `**[${adventurers[assistKeys[i]].title}] ${adventurers[assistKeys[i]].name}**\n`;
//			for (let x = 0; x < adventurers[assistKeys[i]].skills.length; x++) {
//				msgResult += `${adventurers[assistKeys[i]].skills[x].name}: ${combatSkillToEmbed(adventurers[assistKeys[i]].skills[x], ' ')}`;
//
//				if (x < adventurers[assistKeys[i]].skills.length) {
//					msgResult += `\n`;
//				}
//			}
//		}

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