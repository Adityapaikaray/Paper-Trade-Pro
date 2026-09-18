const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

// Import usePortfolio
if (!code.includes("usePortfolio")) {
  code = code.replace(/import \{ useMarketData \} from '\.\.\/hooks\/useMarketData\.ts';/, "import { useMarketData } from '../hooks/useMarketData.ts';\nimport { usePortfolio } from '../contexts/PortfolioContext.tsx';");
}

const target1 = `  const { stocks, indices, priceTicks, indexTicks, isLive } = useMarketData();`;
const replacement1 = `  const { stocks, indices, priceTicks, indexTicks, marketStatus, lastUpdated } = useMarketData();\n  const { isWatchlisted } = usePortfolio();`;
code = code.replace(target1, replacement1);

const target2 = `    // 2. Actively traded stocks
    const prioritySymbols = [
      'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TITAN', 'TATAMOTORS',
      'AMD', 'NVDA', 'AAPL', 'TSLA', 'MSFT', 'GOOGL'
    ];
    stocks.forEach(stock => {
      if (prioritySymbols.includes(stock.symbol.toUpperCase())) {`;
      
const replacement2 = `    // 2. Actively traded stocks (Use watchlist first, then defaults)
    let watchlistedStocks = stocks.filter(s => isWatchlisted(s.symbol));
    
    // If no watchlist or empty, fallback to a dynamic configurable list
    if (watchlistedStocks.length === 0) {
      const defaults = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TITAN', 'TATAMOTORS'];
      watchlistedStocks = stocks.filter(s => defaults.includes(s.symbol.toUpperCase()));
    }
    
    watchlistedStocks.forEach(stock => {
      if (true) {`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
