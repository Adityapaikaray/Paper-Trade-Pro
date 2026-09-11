const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// replace all trailing "export default DashboardView;" and "};"
code = code.replace(/};\nexport default DashboardView;[\s\S]*$/, "};\n\nexport default DashboardView;\n");
code = code.replace(/export default DashboardView;\nexport default DashboardView;\n/, "export default DashboardView;\n");

fs.writeFileSync('src/components/DashboardView.tsx', code);
