const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

code = code.replace(
  "const INITIAL_BALANCES = { '",
  "const INITIAL_BALANCES = { '$': 0, '₹': 0 };\n\n"
);
fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
console.log("Fixed PortfolioContext string replacement issue.");
