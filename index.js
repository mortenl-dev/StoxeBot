require('dotenv/config')
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');

const client = new Client( {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;
    if (!msg.mentions.has(client.user)) return;
    msg.content = msg.content.replace

    msg.reply("ごめん あまない 俺は今お前のために怒ってない" + msg.content);
    console.log(msg.content);

})

client.on('ready', () => {
    console.log('the bot is ready.')
});

client.login(process.env.TOKEN);