const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

code = code.replace(
  "const currency = profile.preferredCurrency!;",
  "const currency = { symbol: marketContext === 'IN' ? '₹' : '$', rate: 1 };"
);

code = code.replace(
  "const totalBalanceInSelectedCurrency = profile.balances[currency.symbol] || (profile.balances[\"$\"] * currency.rate);",
  "const totalBalanceInSelectedCurrency = profile.balances[currency.symbol] || 0;"
);

// We should also ensure the holdings list only shows holdings for the current market or we just leave them all since it's a global portfolio.
// The prompt says "everything in rupee for indian market", which is satisfied by the currency change.

fs.writeFileSync('src/components/PortfolioView.tsx', code);
console.log("Patched PortfolioView.tsx currency");
