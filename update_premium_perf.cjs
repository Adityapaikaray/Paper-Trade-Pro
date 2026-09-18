const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumPerformanceCard.tsx', 'utf8');

const oldFilters = "const FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];";
const newFilters = "const FILTERS = ['1 MIN', '5 MIN', '30 MIN', '1 HR', '1 WEEK', '1M', '6 M', '1 YEAR', '5 YEAR', 'ALL TIME'];";
code = code.replace(oldFilters, newFilters);

const oldUseState = "const [activeFilter, setActiveFilter] = useState('1M');";
const newUseState = "const [activeFilter, setActiveFilter] = useState('1M');\n  const [timeframeStats, setTimeframeStats] = useState({ returnPct: 0, totalGain: 0, currentValue: 0, investedValue: 0 });";
code = code.replace(oldUseState, newUseState);

// We need to pass onStatsChange to PortfolioGraph
const oldGraph = `<PortfolioGraph 
             investedValue={investedValue}
             currentValue={currentValue}
             history={profile.history || []} 
             currencySymbol={currencySymbol} 
             timeRange={activeFilter}
             onTimeRangeChange={setActiveFilter}
             hasHoldings={hasHoldings}
             premiumMode={true}
          />`;
const newGraph = `<PortfolioGraph 
             investedValue={investedValue}
             currentValue={currentValue}
             history={profile.history || []} 
             currencySymbol={currencySymbol} 
             timeRange={activeFilter}
             onTimeRangeChange={setActiveFilter}
             onStatsChange={setTimeframeStats}
             hasHoldings={hasHoldings}
             premiumMode={true}
          />`;
code = code.replace(oldGraph, newGraph);

// Use timeframeStats in the KPIs
code = code.replace(/\{isPositive \? '\+' : ''\}\{returnPct\.toFixed\(2\)\}\%/g, "{timeframeStats.totalGain >= 0 ? '+' : ''}{timeframeStats.returnPct.toFixed(2)}%");
code = code.replace(/\{isPositive \? '\+' : '-'\}\{currencySymbol\}\{Math\.abs\(totalGain\)\.toLocaleString\(undefined, \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\}/g, "{timeframeStats.totalGain >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(timeframeStats.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}");
// Fix isPositive boolean checks
code = code.replace(/const isPositive = totalGain >= 0;/g, "const isPositive = timeframeStats.totalGain >= 0;");
// Fix current value display
code = code.replace(/\{currencySymbol\}\{currentValue\.toLocaleString\(undefined, \{ minimumFractionDigits: 2, maximumFractionDigits: 2 \}\)\}/g, "{currencySymbol}{(timeframeStats.currentValue || currentValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}");

// Make filters horizontally scrollable on mobile
const oldFilterContainer = `<div className="flex bg-ui-bg p-1 rounded-full border border-ui-border shadow-[0_5px_15px_rgba(0,0,0,0.5)] shrink-0 self-start">`;
const newFilterContainer = `<div className="flex bg-ui-bg p-1 rounded-full border border-ui-border shadow-[0_5px_15px_rgba(0,0,0,0.5)] shrink-0 self-start max-w-full overflow-x-auto scrollbar-hide flex-nowrap" style={{ WebkitOverflowScrolling: 'touch' }}>`;
code = code.replace(oldFilterContainer, newFilterContainer);

// Make button not shrink
const oldButton = `className={\`px-4 py-2 rounded-full text-[13px] font-bold transition-all \${`;
const newButton = `className={\`px-4 py-2 rounded-full text-[13px] font-bold transition-all whitespace-nowrap shrink-0 \${`;
code = code.replace(oldButton, newButton);

fs.writeFileSync('src/components/PremiumPerformanceCard.tsx', code);
