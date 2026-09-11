const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
code = code.replace("export const DashboardView", "const DashboardView");
code += "\nexport default DashboardView;\n";
fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Fixed export successfully.");
