const fs = require('fs');
let code = fs.readFileSync('src/contexts/MarketContext.tsx', 'utf8');

code = code.replace(/lastUpdated: liveData\.timestamp \|\| now,/g, "lastUpdated: liveData.timestamp || now,\n              marketState: liveData.marketState,");

// Update marketStatus based on actual data
const marketStatusUpdate = `
      // Determine overall market status
      const nseStock = Object.values(allData).find((d: any) => d.exchange === 'NSE' || d.exchange === 'NSI' || d.symbol.includes('.NS'));
      const usStock = Object.values(allData).find((d: any) => d.symbol === 'AAPL' || d.symbol === 'MSFT');
      setMarketStatus({
        nse: nseStock?.marketState || 'UNKNOWN',
        nyse: usStock?.marketState || 'UNKNOWN'
      });
`;
code = code.replace(/const now = Date\.now\(\);/, marketStatusUpdate + '\n      const now = Date.now();');

fs.writeFileSync('src/contexts/MarketContext.tsx', code);
