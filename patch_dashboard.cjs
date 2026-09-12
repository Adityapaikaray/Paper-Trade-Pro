const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const regex = /const portfolioValue = isIndia \? 2469011\.47 : 1024850\.00;[\s\S]*?const { stocks } = useMarketData\(\);/;

const replacement = `const { stocks } = useMarketData();
  
  let currentHoldingsValue = 0;
  let totalCost = 0;
  
  profile.holdings.forEach(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (stock && stock.currency === currencySymbol) {
      currentHoldingsValue += stock.price * holding.shares;
      totalCost += holding.averagePrice * holding.shares;
    }
  });

  const cashBalance = profile.balances[currencySymbol] || 0;
  const portfolioValue = cashBalance + currentHoldingsValue;
  
  const unrealizedReturn = currentHoldingsValue - totalCost;
  const unrealizedReturnPct = totalCost > 0 ? (unrealizedReturn / totalCost) * 100 : 0;
  
  // Day return mock based on portfolio size
  const todayReturn = portfolioValue > 0 ? (portfolioValue * (isIndia ? 0.005 : 0.012)) : 0;
  const todayReturnPct = portfolioValue > 0 ? (todayReturn / portfolioValue) * 100 : 0;
`;

code = code.replace(regex, replacement);

// Also let's update the hardcoded HTML values for returns below the portfolio value
// <p className="text-xs font-bold text-positive mt-2 flex items-center gap-1">
//    <TrendingUp size={14} />
//    +₹2,457,354.21 (+21080.03%)
// </p>
code = code.replace(
  /<p className="text-xs font-bold text-positive mt-2 flex items-center gap-1">[\s\S]*?<\/p>/,
  `<p className={\`text-xs font-bold mt-2 flex items-center gap-1 \${todayReturn >= 0 ? 'text-positive' : 'text-rose-500'}\`}>
              {todayReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {todayReturn >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(todayReturn).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({todayReturn >= 0 ? '+' : '-'}{Math.abs(todayReturnPct).toFixed(2)}%)
            </p>`
);


fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched DashboardView.");
