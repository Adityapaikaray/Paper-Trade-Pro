const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

const targetDefaults = `const defaults = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TITAN', 'TATAMOTORS'];`;
const newDefaults = `const defaults = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'ITC', 'TITAN', 'TATAMOTORS'];`;
code = code.replace(targetDefaults, newDefaults);

fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
