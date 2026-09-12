const fs = require('fs');

const filesToFix = [
  'src/components/DashboardView.tsx',
  'src/components/TopBar.tsx',
  'src/components/PortfolioView.tsx',
  'src/components/TradeModal.tsx',
  'src/components/PortfolioHistoryRecorder.tsx',
  'src/contexts/PortfolioContext.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (file.endsWith('DashboardView.tsx')) {
    content = content.replace(/const cashBalance = profile\.balances\[currencySymbol\] \|\| 0;/g, 'const cashBalance = profile?.balances?.[currencySymbol] || 0;');
  }
  
  if (file.endsWith('PortfolioHistoryRecorder.tsx')) {
    content = content.replace(/const balanceInUSD = profile\.balances\['\$'\] \+ \(profile\.balances\['₹'\] \/ 83\.2\);/g, "const balanceInUSD = (profile?.balances?.['$'] || 0) + ((profile?.balances?.['₹'] || 0) / 83.2);");
  }

  if (file.endsWith('TradeModal.tsx')) {
    content = content.replace(/profile\.balances\[liveStock\.currency\]/g, 'profile?.balances?.[liveStock.currency]');
  }

  if (file.endsWith('PortfolioView.tsx')) {
    content = content.replace(/const totalBalanceInSelectedCurrency = profile\.balances\[currency\.symbol\] \|\| 0;/g, 'const totalBalanceInSelectedCurrency = profile?.balances?.[currency.symbol] || 0;');
  }

  if (file.endsWith('PortfolioContext.tsx')) {
    content = content.replace(/let balances = parsed\.balances \|\| INITIAL_BALANCES;/g, 'let balances = parsed?.balances || INITIAL_BALANCES;');
    content = content.replace(/const currentBalance = profile\.balances\[stock\.currency\] \|\| 0;/g, 'const currentBalance = profile?.balances?.[stock.currency] || 0;');
  }
  
  fs.writeFileSync(file, content);
});
