const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const topMoversReplacement = `
  const contextCountry = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'USA' : 'All');
  
  const topMovers = stocks
    .filter(s => contextCountry === 'All' || s.country === contextCountry)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5)
    .map(s => ({ s: s.symbol, v: (s.changePercent >= 0 ? '+' : '') + s.changePercent.toFixed(2) + '%' }));
`;

// Inject topMovers logic before the return statement.
code = code.replace(
  "const { openModal, addToast, setIsCopilotOpen } = useUI();",
  "const { openModal, addToast, setIsCopilotOpen } = useUI();\n" + topMoversReplacement
);

// Replace hardcoded array with dynamic one
code = code.replace(
  /\{\[\s*\{ s: 'TITAN'[\s\S]*?\}\,\s*\]\.map\(mover => \(/,
  "{topMovers.map(mover => ("
);

// We should also replace the hardcoded Recent Activity with actual recent activity if possible, 
// or at least filter out symbols that don't match. Or just leave it as mock data for now.
// For now, let's keep Recent Activity but use some symbols matching context.
code = code.replace(
  /\{\[\s*\{ type: 'BUY', symbol: 'AMD', desc: '10 shares @ \$175\.77', color: 'text-positive' \},\s*\{ type: 'BUY', symbol: 'TITAN', desc: '245 shares @ ₹3,645\.60', color: 'text-positive' \},\s*\{ type: 'DIV', symbol: 'TITAN', desc: 'Dividend Received', color: 'text-primary' \},\s*\{ type: 'BUY', symbol: 'AAPL', desc: '5 shares @ \$168\.20', color: 'text-positive' \},\s*\]/,
  `[
                isIndia ? { type: 'BUY', symbol: 'TITAN', desc: '245 shares @ ₹3,645.60', color: 'text-positive' } : { type: 'BUY', symbol: 'AMD', desc: '10 shares @ $175.77', color: 'text-positive' },
                isIndia ? { type: 'DIV', symbol: 'RELIANCE', desc: 'Dividend Received', color: 'text-primary' } : { type: 'BUY', symbol: 'AAPL', desc: '5 shares @ $168.20', color: 'text-positive' },
                isIndia ? { type: 'SELL', symbol: 'TCS', desc: '10 shares @ ₹4,100.00', color: 'text-rose-500' } : { type: 'DIV', symbol: 'MSFT', desc: 'Dividend Received', color: 'text-primary' },
              ]`
);

// Replace "Goals" mock currencies based on context
code = code.replace(
  /₹15,00,000 \/ ₹30,00,000/,
  `{currencySymbol}{isIndia ? '15,00,000' : '150,000'} / {currencySymbol}{isIndia ? '30,00,000' : '300,000'}`
);

code = code.replace(
  /₹28,20,000 \/ ₹1,00,00,000/,
  `{currencySymbol}{isIndia ? '28,20,000' : '282,000'} / {currencySymbol}{isIndia ? '1,00,00,000' : '1,000,000'}`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched DashboardView.tsx");
