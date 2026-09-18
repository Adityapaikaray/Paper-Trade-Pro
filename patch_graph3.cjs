const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// Replace the onStatsChange logic to send the GLOBAL stats, like the original code did
const oldStatsChange = `let tGain = endPoint.currentValue - startPoint.currentValue;
      let rPct = startPoint.currentValue > 0 ? (tGain / startPoint.currentValue) * 100 : 0;
      
      // For intraday, base it off the previous close (which is stored in investedValue for these timeframes)
      if (['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M')) {
         tGain = endPoint.currentValue - endPoint.investedValue;
         rPct = endPoint.investedValue > 0 ? (tGain / endPoint.investedValue) * 100 : 0;
      }
      onStatsChange({
        returnPct: rPct,
        totalGain: tGain,
        currentValue: endPoint.currentValue,
        investedValue: endPoint.investedValue
      });`;

const newStatsChange = `// Send the GLOBAL stats to the parent component, NOT the timeframe stats,
      // to keep "Total Gain / P&L" based on Invested Value separately.
      onStatsChange({
        returnPct: (safeInvested > 0 ? ((safeCurrent - safeInvested) / safeInvested) * 100 : 0),
        totalGain: (safeCurrent - safeInvested),
        currentValue: safeCurrent,
        investedValue: safeInvested
      });`;
code = code.replace(oldStatsChange, newStatsChange);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
