const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const yahooTickers = symbolList.map(mapToYahooTicker);\n    const quotes = await yahooFinance.quote(yahooTickers);",
  "const yahooTickers = symbolList.map(mapToYahooTicker);\n    let quotes = [];\n    // Break into chunks of 10 or fetch individually to avoid INKApi Error which happens on bad bulk tickers\n    for (const t of yahooTickers) {\n      try {\n        const q = await yahooFinance.quote(t);\n        if (q) quotes.push(q);\n      } catch(e) { console.warn(`Failed to fetch quote for ${t}:`, e.message); }\n    }"
);

fs.writeFileSync('server.ts', code);
