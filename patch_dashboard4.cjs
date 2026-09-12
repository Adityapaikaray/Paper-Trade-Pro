const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /<div className="space-y-4">\s*\[\s*\{ t: 'AMD',/,
  `<div className="space-y-4">\n              {[ { t: 'AMD',`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched DashboardView array");
