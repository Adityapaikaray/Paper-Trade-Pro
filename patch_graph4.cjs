const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

const oldTooltipCurrent = `<span className="text-text-muted font-medium">Current Value</span>`;
const newTooltipCurrent = `<span className="text-text-muted font-medium">Portfolio Value</span>`;
code = code.replace(oldTooltipCurrent, newTooltipCurrent);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
