const { YahooProvider } = require('./out.cjs');
const provider = new YahooProvider();
provider.getQuotes([{exchange: 'NSE', symbol: 'RELIANCE'}, {exchange: 'UNKNOWN', symbol: 'AAPL'}]).then(console.log).catch(console.error);
