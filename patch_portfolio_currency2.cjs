const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// Fix the syntax error first
code = code.replace(
  "const currency = { symbol: marketContext === 'IN' ? '₹' : '",
  "const currency = { symbol: marketContext === 'IN' ? '₹' : '$', rate: 1 };\n"
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
console.log("Patched PortfolioView.tsx currency properly");
