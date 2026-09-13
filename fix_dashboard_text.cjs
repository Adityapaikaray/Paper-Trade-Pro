const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /<p className="text-sm font-mono font-bold text-text-main">/g,
  '<p className="text-sm font-mono font-bold text-text-main truncate">'
);

code = code.replace(
  /<p className="text-sm font-mono font-bold text-positive">/g,
  '<p className="text-sm font-mono font-bold text-positive truncate">'
);

code = code.replace(
  /<p className="text-sm font-mono font-bold text-negative">/g,
  '<p className="text-sm font-mono font-bold text-negative truncate">'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
