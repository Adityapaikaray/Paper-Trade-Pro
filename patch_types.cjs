const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
if (!code.includes('marketState?: string;')) {
  code = code.replace(/isRealtime\?: boolean;/g, 'isRealtime?: boolean;\n  marketState?: string;');
}
fs.writeFileSync('src/types.ts', code);

let code2 = fs.readFileSync('src/server/provider.ts', 'utf8');
if (!code2.includes('marketState?: string;')) {
  code2 = code2.replace(/isRealtime: boolean;/g, 'isRealtime: boolean;\n  marketState?: string;');
}
fs.writeFileSync('src/server/provider.ts', code2);
