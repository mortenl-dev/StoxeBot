require('dotenv/config')
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const {createChart, createEmbed}  = require('./methods.js');
const {getCurrentAndPreviousMonthDates} = require ('./dateMethods.js');
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

//MONGO

const { MongoClient, ServerApiVersion } = require('mongodb');
const { mongoose } = require('mongoose');
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongoClient = new MongoClient(process.env.MONGO_URI, {
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


// ------------------------------------------------------------------

var symbol;
client.on("messageCreate", async (msg) => {

  if (msg.author.bot) return;
  if (!msg.mentions.has(client.user)) return;
  msg.content = msg.content.replace(/<@\d+>/g,"");
  user = msg.author;

  var multiplier = 1;
  var result = msg.content
  .replace(/\s+/g, "") // Remove all spaces
  .split(","); // Split by commas

  if (result[0] == "BOOKMARKS" ||result[0] == "SAVED" ||result[0] == "B" ||result[0] == "S" ||result[0] == "STARRED") {

    const collection = mongoClient.db("Main").collection("User");
    const existingUser = await collection.findOne({ id: user.id });
        
        if (existingUser) {
+
          await existingUser.dataSet.forEach((str, index) => {
            createMultipleMessages(msg,user,str,getCurrentAndPreviousMonthDates() );
          });
        }
        else {
          return msg.channel.send("You have no bookmarks!");
        }
      return;
  }
  createMessage(msg, getCurrentAndPreviousMonthDates(), result);

    
})
async function ReactShowSaved(reaction,user) {
  if (user.bot) return;
  if (reaction.message.author.id === client.user.id) {
    if (reaction.emoji.name === '✅') {
      console.log(`${user.tag} reacted with ✅`);
      reaction.message.channel.send(`${user.id} triggered the ✅ reaction!`);
      const collection = mongoClient.db("Main").collection("User");

      try {
        const existingUser = await collection.findOne({ id: user.id });
        
        if (existingUser) {
          await collection.updateOne(
            { id: user.id }, 
            { $addToSet: { dataSet: symbol } } 
          );
            return message.channel.send("Your stock has been saved!");
        }
        
        
        const insertUser = {id: user.id, username: user.username, dataSet: [symbol]};
        collection.insertOne(insertUser)
        

        message.channel.send({ content: 'You have been registered and your stock has been saved!', ephemeral: true });
        
        
      } catch (error) {
          console.error('Error saving user:', error);
          message.channel.send({ content: 'An error occurred while registering.', ephemeral: true });
      }
    }
  }
}

client.on('messageReactionAdd', async (reaction, user) => {
  ReactShowSaved(reaction,user);
});

client.on('ready', async () => {
    console.log('the bot is ready.');

    console.log(`Logged in as ${client.user.tag}!`);

  // Connect to MongoDB
  
});

client.login(process.env.TOKEN);


async function createMessage(msg, dates, result) {
  
  //multiplier = (vwArray.length % 2048) + 0.1;
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${result[0]}/range/${multiplier}/day/${dates.oneMonthAgo}/${dates.current}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_KEY}`

  const response = await fetch(url);
  const data = await response.json();
  symbol = result[0];
  const fmpurl =  `https://financialmodelingprep.com/api/v3/search?query=`+symbol+`&limit=1&apikey=${process.env.FMP_KEY}`;
  const fmpresponse = await fetch(fmpurl);
  const fmpdata = await fmpresponse.json();

  const vwArray = data.results.map(item => parseFloat(item.vw.toFixed(2))); //TRUNCATION
  
  const chartEmbed = createEmbed(data, fmpdata[0], symbol, vwArray, url);
  

  const botmsg = await msg.reply({ embeds: [chartEmbed] });

  try {
    await botmsg.react('✅'); // Bot adds the reaction
  } catch (error) {
    console.error('Failed to add reaction:', error);
  }
}

async function createMultipleMessages(msg,user,ticker, dates) {

  //multiplier = (vwArray.length % 2048) + 0.1;
  
  
  
  const fmpurl =  `https://financialmodelingprep.com/api/v3/search?query=`+ticker+`&limit=1&apikey=${process.env.FMP_KEY}`;
  const fmpresponse = await fetch(fmpurl);
  const fmpdata = await fmpresponse.json();
  const url =  `https://financialmodelingprep.com/api/v3/historical-chart/4hour/${ticker}?from=${dates.oneMonthAgo}&to=${dates.current}&apikey=${process.env.FMP_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  const vwArray = data.map(item => item.close); //TRUNCATION

  const chartEmbed = createEmbed(data,fmpdata[0],ticker, vwArray, url);
  
  // ------------------------------------------------------------------
  //MESSAGE REPLY
  const botmsg = await msg.channel.send({ embeds: [chartEmbed] });

  // ------------------------------------------------------------------
  
}