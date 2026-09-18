const fs = require('fs');
let code = fs.readFileSync('src/server/yahooProvider.ts', 'utf8');

// Remove all the require hacks
const newInit = `import yahooFinance from 'yahoo-finance2';`;
code = code.replace(/import yahooFinanceModule from 'yahoo-finance2';[\s\S]*?catch\(e\) \{\n  console\.error\("YF INIT ERROR:", e\);\n  yahooFinance = null;\n\}/m, newInit);

code = code.replace(/require\('fs'\)/g, "undefined"); // remove require fs hacks too

fs.writeFileSync('src/server/yahooProvider.ts', code);
