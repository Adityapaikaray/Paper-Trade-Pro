const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');
code = code.replace(/\(\[prev\?\.balances\?\.\[/g, "(prev?.balances?.[");
fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
