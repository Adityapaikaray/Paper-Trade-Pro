const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the old /api/indices endpoint
const newIndices = `
app.get("/api/indices", async (req, res) => {
  const symbols = ['^DJI', '^GSPC', '^IXIC', '^GDAXI', '^NSEI', '^BSESN', '^NSEBANK'];
  const queries = symbols.map(s => ({ exchange: 'UNKNOWN', symbol: s }));
  const quotes = await provider.getQuotes(queries);
  res.json(quotes);
});
`;

// It might be difficult to match the exact string, so I'll just append it to the file, and since Express matches routes in order of definition (wait, if there are two GET /api/indices, the first one matches).
// Let's replace the old endpoint.
code = code.replace(/app\.get\("\/api\/indices",\s*async\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/m, newIndices);

fs.writeFileSync('server.ts', code);
