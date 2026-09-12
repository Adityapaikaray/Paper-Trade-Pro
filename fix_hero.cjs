const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /<div className="absolute inset-0 opacity-80 pointer-events-none" style=\{\{ background: 'radial-gradient\(ellipse at center bottom, #111111 0%, #000000 100%\), linear-gradient\(180deg, transparent 0%, #000000 100%\)' \}\} \/>/,
  `<div className="absolute inset-0 opacity-80 pointer-events-none" style={{ background: theme === 'dark' ? 'radial-gradient(ellipse at center bottom, #111111 0%, #000000 100%), linear-gradient(180deg, transparent 0%, #000000 100%)' : 'radial-gradient(ellipse at center bottom, #FCFBF8 0%, #F5F2EA 100%), linear-gradient(180deg, transparent 0%, #F5F2EA 100%)' }} />`
);

// Also fix bg-[#222222] inside TopBar.tsx that the previous replacement missed
let topBarCode = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
topBarCode = topBarCode.replace(/bg-\[#222222\]/g, 'bg-ui-surface-hover');
fs.writeFileSync('src/components/TopBar.tsx', topBarCode);

// Also fix divide-[#222222] in PremiumPerformanceCard.tsx
let perfCode = fs.readFileSync('src/components/PremiumPerformanceCard.tsx', 'utf8');
perfCode = perfCode.replace(/divide-\[#222222\]/g, 'divide-ui-border');
fs.writeFileSync('src/components/PremiumPerformanceCard.tsx', perfCode);

// Fix stroke="#222222" in DashboardView.tsx
code = code.replace(/stroke="#222222"/g, 'stroke="var(--ui-border)"');

fs.writeFileSync('src/components/DashboardView.tsx', code);
