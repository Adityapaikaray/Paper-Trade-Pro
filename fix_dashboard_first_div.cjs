const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /<div>\s*<p className="text-\[10px\] uppercase tracking-wider text-text-muted font-bold mb-1">Quantity<\/p>/g,
  '<div className="flex-1 min-w-0">\n                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Quantity</p>'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
