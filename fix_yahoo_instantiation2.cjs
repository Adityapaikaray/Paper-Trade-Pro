const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

// Replace the previous instantiation
code = code.replace(/import yf from 'yahoo-finance2';\nconst yahooFinance = new yf\(\);\n/, `import yahooFinanceModule from 'yahoo-finance2';
const YF = (yahooFinanceModule as any).default || yahooFinanceModule;
const yahooFinance = typeof YF === 'function' && YF.prototype ? new YF() : YF;
`);

fs.writeFileSync('src/server/yahooProvider.ts', code);
