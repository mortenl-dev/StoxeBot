# StoxeBot

StoxeBot is a discord bot which displays live stock market data.
## Implementation
1. Create a new Node.js project
2. Copy the files from the repository to be used as a template.
3. Run the following commands to install all necessary dependencies
```bash
npm install discord.js dotenv mongodb mongoose node nodemon quickchart-js
```
4. You will need to generate the following API keys for the .env file:
```bash
TOKEN = #Your discord API token
FMP_KEY = #Your FMP token. Can be found here: https://site.financialmodelingprep.com/developer/docs
MONGO_URI = #The token for your MongoDB cluster (You will need to create an account and a cluster first)
POLYGON_KEY = #The token for your Polygon.io account
```
5. Using this and the discord token you have already generated, you can now create a discord bot/application and test it on your server! Just don't forget to run your code through your terminal first:

```bash
node .
```

## Demonstration

```python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
