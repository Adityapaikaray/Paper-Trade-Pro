const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const currencySymbol = isIndia ? '₹' : '")) {
    lines[i] = "  const { profile, marketContext } = usePortfolio();\n  const isIndia = marketContext === 'IN';\n  const currencySymbol = isIndia ? '₹' : '$';";
  }
}

fs.writeFileSync('src/components/DashboardView.tsx', lines.join('\n'));
