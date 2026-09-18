const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

code = code.replace(/import yahooFinanceModule from 'yahoo-finance2';\nconst YF = \(yahooFinanceModule as any\)\.default \|\| yahooFinanceModule;\nconst yahooFinance = typeof YF === 'function' && YF\.prototype \? new YF\(\) : YF;/g, `import yahooFinanceModule from 'yahoo-finance2';
let yahooFinance: any;
try {
  const req = require;
  const mod = req('yahoo-finance2');
  const YF = mod.default || mod;
  yahooFinance = typeof YF === 'function' ? new YF() : YF;
} catch(e) {
  yahooFinance = null;
}
`);

fs.writeFileSync('src/server/yahooProvider.ts', code);
