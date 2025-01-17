require('dotenv/config')
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
// ------------------------------------------------------------------

const QuickChart = require('quickchart-js');

//MONGO

const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoose } = require('mongoose');
const uri = 'mongodb+srv://mortenlins:5xiRuLcvhgBH59Rf@stoxe.wflko.mongodb.net/?retryWrites=true&w=majority&appName=Stoxe';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(uri, {
  autoSelectFamily: false,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await mongoClient.connect();
    // Send a ping to confirm a successful connection
    await mongoClient.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch {
    // Ensures that the client will close when you finish/error
    await mongoClient.close();
  }
}
run().catch(console.dir);

const userSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

// ------------------------------------------------------------------

var symbol;
client.on("messageCreate", async (msg) => {
  createMessage(msg);

    
})

// Event: When a reaction is added
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return; // Ignore reactions from bots

  // Fetch partial reaction if necessary
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching the reaction:', error);
      return;
    }
  }

  // Check if the reaction is on a message sent by the bot
  if (reaction.message.author.id === client.user.id) {
    // Example: Check if the reaction is the specific emoji
    if (reaction.emoji.name === '✅') {
      console.log(`${user.tag} reacted with ✅`);
      // Run your specific code here
      reaction.message.channel.send(`${user.id} triggered the ✅ reaction!`);
      const collection = mongoClient.db("Main").collection("User");

      try {
        const existingUser = await collection.findOne({ id: user.id });
        
        if (existingUser) {
          await collection.updateOne(
            { id: user.id }, // Match user by their unique ID
            { $addToSet: { dataSet: symbol } } // Add to array without duplicates
            // or use $push if you allow duplicates
          );
          await existingUser.dataSet.forEach((str, index) => {
            createMultipleMessages(reaction,user,str);
          });
          
            return reaction.message.channel.send("You are already registered!");
        }
        
        const insertUser = {id: user.id, username: user.username, dataSet: [symbol]};
        collection.insertOne(insertUser)
        

        reaction.message.channel.send({ content: 'You have been registered!', ephemeral: true });
        
        
      } catch (error) {
          console.error('Error saving user:', error);
          reaction.message.channel.send({ content: 'An error occurred while registering.', ephemeral: true });
      }
    }
  }
});

client.on('ready', async () => {
    console.log('the bot is ready.');

    console.log(`Logged in as ${client.user.tag}!`);

  // Connect to MongoDB
  
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



// MAIN MESSAGE FUNCTION

async function createMessage(msg) {
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
  
  const dates = getCurrentAndPreviousMonthDates();
  console.log(result);
  console.log(start);
  console.log(end);
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${result[0]}/range/${multiplier}/day/${dates.oneMonthAgo}/${dates.current}?adjusted=true&sort=asc&apiKey=eLTH_eXFOmF8qUvvHk9Tru8lyzmQc7bZ`
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
    .setTitle(fmpdata[0].name+" "+"("+data.ticker+")")
    .setDescription('Showing results between '+startDate+' and '+endDate)
    .setImage(chart.getUrl())
    .addFields(
      { name: 'Queries', value: `${data.queryCount}`, inline: true   },
      { name: 'Currency', value: `${fmpdata[0].currency}`, inline: true  },
      { name: 'Stock exchange', value: `${fmpdata[0].stockExchange}`, inline: true  },
      { name: '\u200B', value: '\u200B' },
      { name: 'Newest value', value: `${vwArray[vwArray.length-1]}`, inline: true },
      { name: 'Oldest value', value: `${vwArray[0]}`, inline: true },
      { name: 'Margin +/-', value: `${margin}`, inline: true },
    )
  

  // ------------------------------------------------------------------
  //MESSAGE REPLY
  const botmsg = await msg.reply({ embeds: [chartEmbed] });

  // ------------------------------------------------------------------

  //REACTION

  try {
    await botmsg.react('✅'); // Bot adds the reaction
  } catch (error) {
    console.error('Failed to add reaction:', error);
  }

  // ------------------------------------------------------------------

  //CONSOLE REPLY
  
  console.log(msg.content);

  // ------------------------------------------------------------------
}

async function createMultipleMessages(reaction,user,ticker) {

  //COMMAND SYSTEM

  var multiplier = 1;
  //multiplier = (vwArray.length % 2048) + 0.1;
  
  const dates = getCurrentAndPreviousMonthDates();
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/day/${dates.oneMonthAgo}/${dates.current}?adjusted=true&sort=asc&apiKey=eLTH_eXFOmF8qUvvHk9Tru8lyzmQc7bZ`
  //const fmpurl = `https://financialmodelingprep.com/api/v3/search?query=${symbol}&limit=1&apikey=${process.env.FMP_KEY}`;
  // ------------------------------------------------------------------

  //MAIN

  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  
  const fmpurl =  `https://financialmodelingprep.com/api/v3/search?query=`+ticker+`&limit=1&apikey=${process.env.FMP_KEY}`;
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
    .setTitle(fmpdata[0].name+" "+"("+data.ticker+")")
    .setDescription('Showing results between '+startDate+' and '+endDate)
    .setImage(chart.getUrl())
    .addFields(
      { name: 'Queries', value: `${data.queryCount}`, inline: true   },
      { name: 'Currency', value: `${fmpdata[0].currency}`, inline: true  },
      { name: 'Stock exchange', value: `${fmpdata[0].stockExchange}`, inline: true  },
      { name: '\u200B', value: '\u200B' },
      { name: 'Newest value', value: `${vwArray[vwArray.length-1]}`, inline: true },
      { name: 'Oldest value', value: `${vwArray[0]}`, inline: true },
      { name: 'Margin +/-', value: `${margin}`, inline: true },
    )
  

  // ------------------------------------------------------------------
  //MESSAGE REPLY
  const botmsg = await reaction.message.channel.send({ embeds: [chartEmbed] });

  // ------------------------------------------------------------------

}