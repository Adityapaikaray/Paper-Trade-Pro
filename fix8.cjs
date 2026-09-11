const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(/  \);\nexport default DashboardView;/g, "  );\n};\nexport default DashboardView;");
fs.writeFileSync('src/components/DashboardView.tsx', code);
