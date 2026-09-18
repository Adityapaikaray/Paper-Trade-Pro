const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

code = code.replace(/import yahooFinance from 'yahoo-finance2';/g, "import yf from 'yahoo-finance2';\nconst yahooFinance = new (yf as any)();\n");

fs.writeFileSync('src/server/yahooProvider.ts', code);
