// Z7 Discord Bot
// index.js
const Discord = require('discord.js');
const admin = require('firebase-admin');
// const fetch = require('node-fetch');
const { prefix, token } = require('./config.json');
const serviceAccount = require('./z7-bot-db-auth.json');
const ytdl = require("ytdl-core-discord");

// firebase db
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();


// initialize discord client
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

// welcome message
/*client.on('guildMemberAdd', member =>{
	member.guild.channels.get('channelID').send('Welcome ' + member.nickname + ' to the Z7 army!');
});*/

// commands
client.on('message', async (message) => {
	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
	if (command == 'play'){
		const url = args[0];
		let userChannel = message.member.voice.channel;

		if (!args.length){
			message.channel.send('Please provide a song link.');
		}
		else{
			if (!ytdl.validateURL(url)){
			message.channel.send('Must provide a YouTube link.');
			}
		}
		
		if (url && ytdl.validateURL(url)) {
			userChannel
				.join()
				.then((connection) => {
					play(connection, url);
				})
				.catch((reject) => {
					console.error(reject);
				});
		}
	}
	else {
		const embed = new Discord.MessageEmbed()
			.setTitle('Available Commands')
			.setDescription('\n\tzm play [link]: Play song from YouTube link.' +
			'\n\tzm help: Displays commands.');
		message.channel.send(embed);
	}
});

async function play(connection, url) {
	const seconds = new URL(url).searchParams.get('t') || 0;
	const milliseconds = Number(seconds) * 1000;
	connection.play(await ytdl(url, { begin: milliseconds }).catch(), {
		type: "opus",
	});
}

client.login(token);
