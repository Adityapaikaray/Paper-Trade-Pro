const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

code = code.replace(/const INITIAL_BALANCES = \{ 'interface PortfolioContextType \{/, "const INITIAL_BALANCES = { '\\$': 0, '₹': 0 };\n\ninterface PortfolioContextType {");

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
