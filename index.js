require('dotenv/config')
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client( {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
const url = "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-02-10?adjusted=true&sort=asc&apiKey=eLTH_eXFOmF8qUvvHk9Tru8lyzmQc7bZ"

// ------------------------------------------------------------------

//CHART


// Regex to match the two dates in the URL
const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;

// Extract dates
const [startDate, endDate] = [...url.matchAll(dateRegex)].map(match => match[0]);



const QuickChart = require('quickchart-js');


// ------------------------------------------------------------------

client.on("messageCreate", async (msg) => {

    //MAIN

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    const embed = new EmbedBuilder()
      .setTitle(data.request_id) // Title of the embed
      .setDescription(data.description || 'Default Description') // Description
      .setColor(data.color || 0x0099ff); // Set a color (default: blue)

    if (data.fields) {
      data.fields.forEach(field =>
        embed.addFields({ name: field.name, value: field.value, inline: field.inline || false })
      );
    }

    // ------------------------------------------------------------------

    //CHART

    const chart = new QuickChart();
    chart
      .setConfig({
        type: 'line',
        data: {
          labels: ['Hello world', ],
          datasets: [{ label: data.ticker, data: [1, 2] }],
        },
      })
      .setWidth(800)
      .setHeight(400)
      .setBackgroundColor('transparent');

    const chartEmbed = {
      title: data.ticker,
      description: 'Showing results between '+startDate+' and '+endDate,
      image: {
        url: chart.getUrl(),
      },
    };

    // ------------------------------------------------------------------

    //RESPONSE SAFETY

    if (msg.author.bot) return;
    if (!msg.mentions.has(client.user)) return;
    msg.content = msg.content.replace(/<@\d+>/g,"");

    // ------------------------------------------------------------------

    //MESSAGE REPLY
    await msg.reply({ embeds: [embed, chartEmbed] });

    // ------------------------------------------------------------------

    //CONSOLE REPLY
    
    console.log(msg.content);

    // ------------------------------------------------------------------
})

client.on('ready', () => {
    console.log('the bot is ready.')
});

client.login(process.env.TOKEN);