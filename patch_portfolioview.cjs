const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

if (!code.includes('addFunds')) {
  code = code.replace(
    "const { profile } = usePortfolio();",
    "const { profile, addFunds, marketContext } = usePortfolio();"
  );
  
  code = code.replace(
    /return \(\n      <div className="flex flex-col items-center justify-center py-40 space-y-8 ">/,
    `return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 ">
        <button onClick={() => addFunds(marketContext === 'IN' ? 100000 : 10000, marketContext === 'IN' ? '₹' : '$')} className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
          Deposit Virtual Funds
        </button>`
  );

  fs.writeFileSync('src/components/PortfolioView.tsx', code);
  console.log("Patched PortfolioView.");
}
