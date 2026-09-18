const { YahooProvider } = require('./out.cjs');
const provider = new YahooProvider();
provider.getQuote("UNKNOWN", "AAPL").then(console.log).catch(console.error);
