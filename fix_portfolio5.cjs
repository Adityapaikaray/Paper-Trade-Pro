const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

code = code.replace(/const INITIAL_BALANCES = \{ '[\s\S]*?profile: UserProfile;/, "const INITIAL_BALANCES = { '$$': 0, '₹': 0 };\ninterface PortfolioContextType {\n  profile: UserProfile;");

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
