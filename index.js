require('dotenv/config')
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client( {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
// ------------------------------------------------------------------

const QuickChart = require('quickchart-js');


client.on("messageCreate", async (msg) => {
    //RESPONSE SAFETY

    if (msg.author.bot) return;
    if (!msg.mentions.has(client.user)) return;
    msg.content = msg.content.replace(/<@\d+>/g,"");

    // ------------------------------------------------------------------

    //COMMAND SYSTEM

    var multiplier = 1;
    var start;
    var end;
    var result = msg.content
    .replace(/\s+/g, "") // Remove all spaces
    .split(","); // Split by commas
    //multiplier = (vwArray.length % 2048) + 0.1;
    if (result[1]=="Y") {
      multiplier = 4;
      result[1] = "day";
      start = result[2]+"-01-01";
      end = result[3]+"-01-01";
    }
    else if (result[1]=="M") {
      multiplier = 1;
      result[1] = "day";
      start = result[2]+`-${result[3]}-01`;
      end = result[2]+`-${result[3][1]+1}-01`;
    }
    else {
      result[1] = "day";
    }
    const dates = getCurrentAndPreviousMonthDates();
    console.log(result);
    console.log(start);
    console.log(end);
    var symbol;
    const url = `https://api.polygon.io/v2/aggs/ticker/${result[0]}/range/${multiplier}/${result[1]}/${dates.oneMonthAgo}/${dates.current}?adjusted=true&sort=asc&apiKey=eLTH_eXFOmF8qUvvHk9Tru8lyzmQc7bZ`
    //const fmpurl = `https://financialmodelingprep.com/api/v3/search?query=${symbol}&limit=1&apikey=${process.env.FMP_KEY}`;
    // ------------------------------------------------------------------

    //MAIN

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    symbol = result[0];
    const fmpurl =  `https://financialmodelingprep.com/api/v3/search?query=`+symbol+`&limit=1&apikey=${process.env.FMP_KEY}`;
    const fmpresponse = await fetch(fmpurl);
    const fmpdata = await fmpresponse.json();
    console.log(fmpdata);

    // ------------------------------------------------------------------

    //CHART

    // Regex to match the two dates in the URL
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;

    // Extract dates
    const [startDate, endDate] = [...url.matchAll(dateRegex)].map(match => match[0]);

    const vwArray = data.results.map(item => parseFloat(item.vw.toFixed(2))); //TRUNCATION

    console.log(vwArray);

    const chart = new QuickChart();
    chart
      .setConfig({
        type: 'line',
        data: {
          labels: vwArray,
          datasets: [{ 
            label: data.ticker,
            data: vwArray,
            borderColor:'aqua',
            borderDash: [5, 5],
            setBackgroundColor: '#fff',
            fill: false,
            borderWidth: 5,
            pointRadius: 0,
          }],
        
        },
        options: {
          legend: {
            display: false
          },
         
          scales: {} //DYNAMIC Y AXIS
          
        }
      })
      
      .setWidth(800)
      .setHeight(400)
      .setBackgroundColor('transparent');
    const margin = Math.abs(parseFloat(vwArray[0]-vwArray[vwArray.length-1]).toFixed(2))
    var sideColor = 5763719; //GREEN
    if (vwArray[0]>=vwArray[vwArray.length-1]) {
      sideColor = 15548997; //RED
    }
    const chartEmbed = new EmbedBuilder()
      .setColor(sideColor)
      .setTitle(data.ticker)
      .setDescription('Showing results between '+startDate+' and '+endDate)
      .setImage(chart.getUrl())
      .addFields(
        { name: 'Queries', value: `${data.queryCount}` },
        { name: '\u200B', value: '\u200B' },
        { name: 'Name', value: `${fmpdata[0].name}`, inline: true  },
        { name: 'Currency', value: `${fmpdata[0].currency}`, inline: true  },
        { name: 'stockExchange', value: `${fmpdata[0].stockExchange}`, inline: true  },
        { name: '\u200B', value: '\u200B' },
        { name: 'Newest value', value: `${vwArray[vwArray.length-1]}`, inline: true },
        { name: 'Oldest value', value: `${vwArray[0]}`, inline: true },
        { name: 'Margin +/-', value: `${margin}`, inline: true },
      )
    

    // ------------------------------------------------------------------
    //MESSAGE REPLY
    await msg.reply({ embeds: [chartEmbed] });

    // ------------------------------------------------------------------

    //CONSOLE REPLY
    
    console.log(msg.content);

    // ------------------------------------------------------------------
})

client.on('ready', () => {
    console.log('the bot is ready.')
});

client.login(process.env.TOKEN);

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentAndPreviousMonthDates() {
  const currentDate = new Date();
  const oneMonthAgoDate = new Date();
  
  // Set the date to one month ago
  oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);

  return {
      current: getFormattedDate(currentDate),
      oneMonthAgo: getFormattedDate(oneMonthAgoDate),
  };
}