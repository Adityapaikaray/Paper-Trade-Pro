const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Insert imports
const importStatements = `
import { db } from './src/server/db.ts';
import { YahooProvider } from './src/server/yahooProvider.ts';
const provider = new YahooProvider();
`;

code = code.replace(/const PORT = 3000;/, `const PORT = 3000;\n${importStatements}`);

// Replace the old /api/market-data endpoint
const oldMarketDataStart = code.indexOf('app.get("/api/market-data"');
const oldMarketDataEndStr = '  res.json({ nyse: nyseOpen ? "OPEN" : "CLOSED", nse: nseOpen ? "OPEN" : "CLOSED", timestamp: now.getTime(), isLive: true });\n});';
// Wait, market-status is right below it or something. Let's just use regex to replace everything until the market-status endpoint

// Actually, I'll just append the new endpoints before `app.post("/api/copilot"` 
const newEndpoints = `
// --- NSE & BSE Market Data API ---

app.get("/api/instruments", (req, res) => {
  res.json(db.getAll());
});

app.get("/api/instruments/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  
  // Combine local DB and provider search
  const localResults = db.search(query);
  if (localResults.length > 0) {
    return res.json(localResults);
  }
  
  const providerResults = await provider.searchInstruments(query);
  res.json(providerResults);
});

app.get("/api/quotes", async (req, res) => {
  const symbolsParam = req.query.symbols;
  if (!symbolsParam) return res.status(400).json({ error: "No symbols" });
  
  const pairs = symbolsParam.split(',').map(s => {
    const parts = s.split(':');
    return parts.length === 2 ? { exchange: parts[0], symbol: parts[1] } : { exchange: 'NSE', symbol: parts[0] };
  });
  
  const quotes = await provider.getQuotes(pairs);
  res.json(quotes);
});

app.get("/api/quotes/:exchange/:symbol", async (req, res) => {
  const quote = await provider.getQuote(req.params.exchange, req.params.symbol);
  if (!quote) return res.status(404).json({ error: "Not found" });
  res.json(quote);
});

app.get("/api/historical/:exchange/:symbol", async (req, res) => {
  const interval = req.query.interval || '1 day';
  const range = req.query.range || '1Y';
  
  const data = await provider.getHistoricalData(req.params.exchange, req.params.symbol, interval, range);
  res.json(data);
});
`;

code = code.replace(/\/\/ Copilot API Route/, `${newEndpoints}\n// Copilot API Route`);

fs.writeFileSync('server.ts', code);
