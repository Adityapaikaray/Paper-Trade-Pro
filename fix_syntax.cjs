const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldStr = `app.get("/api/indices", async (req, res) => {
  const symbols = ['^DJI', '^GSPC', '^IXIC', '^GDAXI', '^NSEI', '^BSESN', '^NSEBANK'];
  const queries = symbols.map(s => ({ exchange: 'UNKNOWN', symbol: s }));
  const quotes = await provider.getQuotes(queries);
  res.json(quotes);
});
  }
});`;

const newStr = `app.get("/api/indices", async (req, res) => {
  const symbols = ['^DJI', '^GSPC', '^IXIC', '^GDAXI', '^NSEI', '^BSESN', '^NSEBANK'];
  const queries = symbols.map(s => ({ exchange: 'UNKNOWN', symbol: s }));
  const quotes = await provider.getQuotes(queries);
  res.json(quotes);
});`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync('server.ts', code);
  console.log("Fixed!");
} else {
  // alternative regex
  code = code.replace(/res\.json\(quotes\);\n\}\);\n\s*\}\n\}\);/, 'res.json(quotes);\n});');
  fs.writeFileSync('server.ts', code);
  console.log("Fixed via regex!");
}

