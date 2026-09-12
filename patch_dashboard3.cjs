const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /\{\[\s*\{ t: 'AMD', h: 'New AI chip demand boosts revenue outlook', time: '2 hours ago · Reuters' \},\s*\{ t: 'TITAN', h: 'Strong Q4 results beat expectations', time: '4 hours ago · Bloomberg' \},\s*\{ t: 'India', h: 'NIFTY reaches new 52-week high', time: '5 hours ago · Economic Times' \},\s*\{ t: 'NVDA', h: 'AI infrastructure demand continues to grow', time: '6 hours ago · TechCrunch' \}\s*\]\.map/,
  `[
                { t: 'AMD', h: 'New AI chip demand boosts revenue outlook', time: '2 hours ago · Reuters', us: true },
                { t: 'TITAN', h: 'Strong Q4 results beat expectations', time: '4 hours ago · Bloomberg', in: true },
                { t: 'India', h: 'NIFTY reaches new 52-week high', time: '5 hours ago · Economic Times', in: true },
                { t: 'NVDA', h: 'AI infrastructure demand continues to grow', time: '6 hours ago · TechCrunch', us: true }
              ].filter(n => (isIndia ? n.in : n.us)).map`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched DashboardView News");
