const QuickChart = require('quickchart-js');
const {EmbedBuilder} = require('discord.js');

function createChart(labels, label){ //vwArray, data.ticker
    const chart = new QuickChart();
  chart
    .setConfig({
      type: 'line',
      data: {
        labels: labels,
        datasets: [{ 
          label: label,
          data: labels,
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
    return chart;
}
function createEmbed(valueData, infoData, ticker, vwArray, url) {

  

  const margin = Math.abs(parseFloat(vwArray[0]-vwArray[vwArray.length-1]).toFixed(2));


  // Regex to match the two dates in the URL
  const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b/g;

  // Extract dates
  const [startDate, endDate] = [...url.matchAll(dateRegex)].map(match => match[0]);


  var sideColor = 5763719; //GREEN
    if (vwArray[0]>=vwArray[vwArray.length-1]) {
      sideColor = 15548997; //RED
    }
  const chartEmbed = new EmbedBuilder()
    .setColor(sideColor)
    .setTitle(infoData.name+" "+"("+ticker+")") //fmp[0]
    .setDescription('Showing results between '+startDate+' and '+endDate+' display in 4 hour time frames.')
    .setImage(createChart(vwArray,ticker).getUrl())
    .addFields(
      { name: 'Queries', value: `${valueData.queryCount}`, inline: true   }, //undefined
      { name: 'Currency', value: `${infoData.currency}`, inline: true  },
      { name: 'Stock exchange', value: `${infoData.stockExchange}`, inline: true  },
      { name: '\u200B', value: '\u200B' },
      { name: 'Newest value', value: `${vwArray[vwArray.length-1]}`, inline: true },
      { name: 'Oldest value', value: `${vwArray[0]}`, inline: true },
      { name: 'Margin +/-', value: `${margin}`, inline: true },
    )
  return chartEmbed;
}
module.exports = {createChart, createEmbed}; // For CommonJS