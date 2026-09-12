const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioHistoryRecorder.tsx', 'utf8');
code = code.replace(/const balanceInUSD = \(profile\?\.balances\?\.\['.*/g, "const balanceInUSD = (profile?.balances?.['$'] || 0) + ((profile?.balances?.['₹'] || 0) / 83.2);");
fs.writeFileSync('src/components/PortfolioHistoryRecorder.tsx', code);
