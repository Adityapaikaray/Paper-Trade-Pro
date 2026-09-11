const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    const yahooTickers = symbolList.map(mapToYahooTicker);
    let quotes = [];
    // Break into chunks of 10 or fetch individually to avoid INKApi Error which happens on bad bulk tickers
    for (const t of yahooTickers) {
      try {
        const q = await yahooFinance.quote(t);
        if (q) quotes.push(q);
      } catch(e) { console.warn(\`Failed to fetch quote for \${t}:\`, e.message); }
    }
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
    const now = Date.now();
    
    quoteArray.forEach((q: any) => {`;

const replacement = `    const yahooTickers = symbolList.map(mapToYahooTicker);
    const now = Date.now();
    let quotes = [];
    let tickersToFetch = [];
    
    // Check cache first
    for (const t of yahooTickers) {
      const cached = quoteCache.get(t);
      if (cached && cached.expiresAt > now) {
        // Re-construct a mock quote object that matches the expected format below
        quotes.push({
          symbol: t,
          regularMarketPrice: cached.data.price,
          regularMarketPreviousClose: cached.data.close,
          regularMarketChange: cached.data.change,
          regularMarketChangePercent: cached.data.percent_change,
          regularMarketDayHigh: cached.data.day_high,
          regularMarketDayLow: cached.data.day_low,
          fiftyTwoWeekHigh: cached.data.fifty_two_week_high,
          fiftyTwoWeekLow: cached.data.fifty_two_week_low,
          regularMarketVolume: cached.data.volume !== "N/A" ? cached.data.volume : undefined,
          currency: cached.data.currency,
          regularMarketTime: new Date(cached.data.timestamp)
        });
      } else {
        tickersToFetch.push(t);
      }
    }
    
    // Fetch missing tickers in chunks to avoid Too Many Requests and INKApi errors
    const CHUNK_SIZE = 5;
    for (let i = 0; i < tickersToFetch.length; i += CHUNK_SIZE) {
      const chunk = tickersToFetch.slice(i, i + CHUNK_SIZE);
      try {
        const chunkQuotes = await yahooFinance.quote(chunk);
        const chunkArray = Array.isArray(chunkQuotes) ? chunkQuotes : [chunkQuotes];
        quotes.push(...chunkArray);
      } catch(e) { 
        console.warn(\`Failed bulk fetch for chunk, falling back to individual:\`, e.message);
        // Fallback to individual with delay
        for (const t of chunk) {
          try {
            const q = await yahooFinance.quote(t);
            if (q) quotes.push(q);
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
          } catch(err) {
            console.warn(\`Failed individual fetch for \${t}:\`, err.message);
          }
        }
      }
    }
    
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
    
    quoteArray.forEach((q: any) => {`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
