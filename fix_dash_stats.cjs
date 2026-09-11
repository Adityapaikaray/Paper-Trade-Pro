const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  "const { profile } = usePortfolio();",
  "const { profile, marketContext } = usePortfolio();"
);

// Inject variables right after useState('1M')
const varLogic = `
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  
  // Create virtual summary stats based on market
  const portfolioValue = isIndia ? 2469011.47 : 1024850.00;
  const todayReturn = isIndia ? 14250.80 : 12450.50;
  const todayReturnPct = isIndia ? 0.58 : 1.2;
  const unrealizedReturn = isIndia ? 245000.00 : 45000.00;
  const unrealizedReturnPct = isIndia ? 11.2 : 4.5;
`;

code = code.replace(
  "const [sortMode, setSortMode] = useState('Value (High → Low)');",
  "const [sortMode, setSortMode] = useState('Value (High → Low)');\n" + varLogic
);

// We need to find the stats in the JSX and replace them.
code = code.replace(/₹2,469,011\.47/g, "{currencySymbol}{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}");
code = code.replace(/₹14,250\.80/g, "{currencySymbol}{todayReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}");
code = code.replace(/\+0\.58%/g, "+{todayReturnPct}%");
code = code.replace(/₹245,000\.00/g, "{currencySymbol}{unrealizedReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}");
code = code.replace(/\+11\.2%/g, "+{unrealizedReturnPct}%");

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched dashboard stats.");
