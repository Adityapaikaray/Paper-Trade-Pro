const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

code = code.replace(/import yahooFinance from 'yahoo-finance2';/g, '');
code = code.replace(/import yahooFinanceModule from 'yahoo-finance2';\nconst yahooFinance = yahooFinanceModule.default || yahooFinanceModule;/g, '');

const importStr = `import yf from 'yahoo-finance2';\nconst yahooFinance = new yf();\n`;
code = importStr + code;

fs.writeFileSync('src/server/yahooProvider.ts', code);
