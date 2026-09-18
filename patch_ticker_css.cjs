const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

code = code.replace(/<div className="flex-1 flex items-center h-full overflow-hidden relative group">/, '<div className="flex-1 flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-hide relative group touch-pan-x">');

fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
