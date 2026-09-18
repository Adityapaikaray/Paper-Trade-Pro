const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

code = code.replace(/isRealtime: false \/\/ Yahoo is delayed by 15 mins for Indian markets usually/g, "isRealtime: false, marketState: result.marketState");
code = code.replace(/isRealtime: false\n\s*\};/g, "isRealtime: false,\n          marketState: result.marketState\n        };");

fs.writeFileSync('src/server/yahooProvider.ts', code);
