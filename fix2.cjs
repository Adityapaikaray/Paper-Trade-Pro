const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// I will just use regex to clean up the declaration area
code = code.replace(/const isIndia = marketContext === 'IN';[\s\S]*?const { stocks } = useMarketData\(\);/, `
  const { profile, marketContext } = usePortfolio();
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const portfolioValue = isIndia ? 2469011.47 : 1024850.00;
  const todayReturn = isIndia ? 14250.80 : 12450.50;
  const todayReturnPct = isIndia ? 0.58 : 1.2;
  const unrealizedReturn = isIndia ? 245000.00 : 45000.00;
  const unrealizedReturnPct = isIndia ? 11.2 : 4.5;
  const { stocks } = useMarketData();
`);

code = code.replace(/};\n};\n\nexport default DashboardView;/, "};\n\nexport default DashboardView;");

fs.writeFileSync('src/components/DashboardView.tsx', code);
