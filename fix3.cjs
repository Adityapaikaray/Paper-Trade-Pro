const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes("const isIndia = marketContext === 'IN';"));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("const { openModal, addToast, setIsCopilotOpen } = useUI();"));

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx,
    "  const { profile, marketContext } = usePortfolio();",
    "  const isIndia = marketContext === 'IN';",
    "  const currencySymbol = isIndia ? '₹' : '$';",
    "  const portfolioValue = isIndia ? 2469011.47 : 1024850.00;",
    "  const todayReturn = isIndia ? 14250.80 : 12450.50;",
    "  const todayReturnPct = isIndia ? 0.58 : 1.2;",
    "  const unrealizedReturn = isIndia ? 245000.00 : 45000.00;",
    "  const unrealizedReturnPct = isIndia ? 11.2 : 4.5;",
    "  const { stocks } = useMarketData();"
  );
  
  // also check for trailing brace
  const lastLine = lines.pop();
  if (lastLine !== "export default DashboardView;") {
    lines.push(lastLine);
    lines.push("export default DashboardView;");
  } else {
    lines.push(lastLine);
  }
}

fs.writeFileSync('src/components/DashboardView.tsx', lines.join('\n'));
