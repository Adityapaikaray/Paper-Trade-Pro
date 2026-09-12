const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

if (!code.includes('addFunds')) {
  code = code.replace(
    "const { profile, marketContext } = usePortfolio();",
    "const { profile, marketContext, addFunds } = usePortfolio();"
  );
  
  code = code.replace(
    /<p className="text-\[10px\] font-bold uppercase tracking-\[0\.2em\] text-text-muted mb-2">Total Portfolio Value<\/p>\s*<p className="text-2xl xl:text-3xl font-serif font-black text-text-main">\{currencySymbol\}\{portfolioValue\.toLocaleString\(undefined, \{ minimumFractionDigits: 2 \}\)\}<\/p>/m,
    `<div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Total Portfolio Value</p>
                <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">{currencySymbol}{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <button onClick={() => addFunds(isIndia ? 1000000 : 10000, currencySymbol)} className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1" title="Add virtual funds">
                <Plus size={12} /> Add Cash
              </button>
            </div>`
  );

  fs.writeFileSync('src/components/DashboardView.tsx', code);
  console.log("Added deposit button.");
}
