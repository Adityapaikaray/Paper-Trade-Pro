const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// The block to extract
const blockToExtract = `  const { profile } = usePortfolio();
  const { isLive, lastUpdated, stocks } = useMarketData();
    const holdings = profile.holdings || [];

  const isIntradayMode = ['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M');

  const portfolioPrevClose = useMemo(() => {
    if (isPortfolioEmpty || !hasHoldings || holdings.length === 0) return 0;
    let total = 0;
    holdings.forEach(h => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      const prev = stock?.prevClose || h.averagePrice || 0;
      total += prev * h.shares;
    });
    return total;
  }, [holdings, stocks, isPortfolioEmpty, hasHoldings]);`;

code = code.replace(blockToExtract, "");

// Where to inject it: after `const isPortfolioEmpty = ...` calculation.
const anchor = `  const isPortfolioEmpty = hasHoldings !== undefined
    ? !hasHoldings
    : (isReset || (investedValue === 0 && currentValue === 0));`;

code = code.replace(anchor, anchor + "\n\n" + blockToExtract);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
