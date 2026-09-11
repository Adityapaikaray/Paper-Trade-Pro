const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
code = code.replace("  const { profile, marketContext } = usePortfolio();\n  const { profile, marketContext } = usePortfolio();", "  const { profile, marketContext } = usePortfolio();");
code = code.replace("};\n\nexport default DashboardView;", "\nexport default DashboardView;");
fs.writeFileSync('src/components/DashboardView.tsx', code);
