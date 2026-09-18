const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// Tooltip logic for Gain/Loss
const oldTooltipGain = `<div className="flex justify-between items-center gap-4 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">Gain / Loss</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.currentValue - pt.investedValue >= 0 ? '+' : ''}{formatCurrency(pt.currentValue - pt.investedValue)}
                        </span>
                      </div>`;
const newTooltipGain = `<div className="flex justify-between items-center gap-4 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">{isIntradayMode ? 'Intraday Gain/Loss' : 'Gain / Loss'}</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.currentValue - pt.investedValue >= 0 ? '+' : ''}{formatCurrency(pt.currentValue - pt.investedValue)}
                        </span>
                      </div>`;
code = code.replace(oldTooltipGain, newTooltipGain);

const oldTooltipReturn = `<div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">Return %</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.investedValue > 0 ? ((pt.currentValue - pt.investedValue) / pt.investedValue * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>`;
const newTooltipReturn = `<div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">{isIntradayMode ? 'Intraday Return' : 'Return %'}</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.investedValue > 0 ? ((pt.currentValue - pt.investedValue) / pt.investedValue * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>`;
code = code.replace(oldTooltipReturn, newTooltipReturn);

// Update onStatsChange to send the correct timeframe gain
const oldStatsChange = `const tGain = endPoint.currentValue - startPoint.currentValue;
      const rPct = startPoint.currentValue > 0 ? (tGain / startPoint.currentValue) * 100 : 0;`;
const newStatsChange = `let tGain = endPoint.currentValue - startPoint.currentValue;
      let rPct = startPoint.currentValue > 0 ? (tGain / startPoint.currentValue) * 100 : 0;
      
      // For intraday, base it off the previous close (which is stored in investedValue for these timeframes)
      if (['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M')) {
         tGain = endPoint.currentValue - endPoint.investedValue;
         rPct = endPoint.investedValue > 0 ? (tGain / endPoint.investedValue) * 100 : 0;
      }`;
code = code.replace(oldStatsChange, newStatsChange);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
