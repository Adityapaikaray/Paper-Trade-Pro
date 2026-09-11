const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const lines = code.trim().split('\n');
if (lines[lines.length - 1] === "export default DashboardView;") {
  lines.pop();
  lines.push("};");
  lines.push("export default DashboardView;");
}

fs.writeFileSync('src/components/DashboardView.tsx', lines.join('\n'));
