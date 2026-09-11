const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  "  const isIndia = marketContext === 'IN';\n  const currencySymbol = isIndia ? '₹' : '    const { profile, marketContext } = usePortfolio();",
  "  const { profile, marketContext } = usePortfolio();\n  const isIndia = marketContext === 'IN';\n  const currencySymbol = isIndia ? '₹' : '$';"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
