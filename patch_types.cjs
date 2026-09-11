const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes("marketContext")) {
    fs.writeFileSync('src/types.ts', code + "\nexport type MarketRegion = 'IN' | 'US';\n");
    console.log("Patched types.");
}
