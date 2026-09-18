const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// Replace FILTERS
code = code.replace(/const FILTERS = \['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'\];/g, "const FILTERS = ['1 MIN', '5 MIN', '30 MIN', '1 HR', '1 WEEK', '1M', '6 M', '1 YEAR', '5 YEAR', 'ALL TIME'];");

// Add onStatsChange to props interface
if (!code.includes('onStatsChange?:')) {
  code = code.replace(/onTimeRangeChange\?: \(range: string\) => void;/g, "onTimeRangeChange?: (range: string) => void;\n  onStatsChange?: (stats: { returnPct: number, totalGain: number, currentValue: number, investedValue: number }) => void;");
}

// Add onStatsChange to component definition
code = code.replace(/onTimeRangeChange,\n  hasHoldings/g, "onTimeRangeChange,\n  onStatsChange,\n  hasHoldings");

// Replace chartData useMemo completely
const newChartData = `  const chartData: ChartDataPoint[] = useMemo(() => {
    if (isPortfolioEmpty || !history || history.length === 0) {
      return [];
    }

    const now = Date.now();
    let cutoff = 0;
    let isIntraday = false;

    switch (timeRange) {
      case '1 MIN':
        cutoff = now - 60 * 1000;
        isIntraday = true;
        break;
      case '5 MIN':
        cutoff = now - 5 * 60 * 1000;
        isIntraday = true;
        break;
      case '30 MIN':
        cutoff = now - 30 * 60 * 1000;
        isIntraday = true;
        break;
      case '1 HR':
        cutoff = now - 60 * 60 * 1000;
        isIntraday = true;
        break;
      case '1 WEEK':
        cutoff = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        cutoff = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '6 M':
        cutoff = now - 180 * 24 * 60 * 60 * 1000;
        break;
      case '1 YEAR':
        cutoff = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case '5 YEAR':
        cutoff = now - 5 * 365 * 24 * 60 * 60 * 1000;
        break;
      case 'ALL TIME':
      default:
        cutoff = 0;
    }

    // Filter history based on cutoff
    let filtered = history.filter(p => p.timestamp >= cutoff);
    
    // Always include at least the very first point before cutoff if available to have a starting reference
    if (filtered.length > 0 && history.length > filtered.length) {
       const before = history.filter(p => p.timestamp < cutoff);
       if (before.length > 0) {
          filtered.unshift(before[before.length - 1]);
       }
    } else if (filtered.length === 0 && history.length > 0) {
       filtered = [history[history.length - 1]];
    }

    const points: ChartDataPoint[] = filtered.map(pt => {
      const d = new Date(pt.timestamp);
      
      let timeLabel = '';
      if (isIntraday) {
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '6 M' || timeRange === '1 YEAR') {
        timeLabel = \`\${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} \${d.getFullYear().toString().substr(2)}\`;
      } else if (timeRange === '5 YEAR' || timeRange === 'ALL TIME') {
        timeLabel = d.getFullYear().toString();
      } else {
        timeLabel = \`\${d.getDate()} \${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}\`;
      }

      return {
        timestamp: pt.timestamp,
        time: timeLabel,
        fullDate: formatDateLabel(pt.timestamp, isIntraday),
        investedValue: Number(pt.investedValue.toFixed(2)),
        currentValue: Number(pt.currentValue.toFixed(2)),
      };
    });

    // Ensure we always have the current live point at the very end
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      if (now - lastPoint.timestamp > 10000 || lastPoint.currentValue !== safeCurrent) {
        const d = new Date(now);
        let timeLabel = '';
        if (isIntraday) {
          timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeRange === '6 M' || timeRange === '1 YEAR') {
          timeLabel = \`\${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} \${d.getFullYear().toString().substr(2)}\`;
        } else if (timeRange === '5 YEAR' || timeRange === 'ALL TIME') {
          timeLabel = d.getFullYear().toString();
        } else {
          timeLabel = \`\${d.getDate()} \${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}\`;
        }
        points.push({
          timestamp: now,
          time: timeLabel,
          fullDate: formatDateLabel(now, isIntraday),
          investedValue: Number(safeInvested.toFixed(2)),
          currentValue: Number(safeCurrent.toFixed(2)),
        });
      }
    } else {
      // If no points at all, just plot the current point
      const d = new Date(now);
      points.push({
          timestamp: now,
          time: isIntraday ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : \`\${d.getDate()} \${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}\`,
          fullDate: formatDateLabel(now, isIntraday),
          investedValue: Number(safeInvested.toFixed(2)),
          currentValue: Number(safeCurrent.toFixed(2)),
      });
    }

    // Call onStatsChange if provided
    if (onStatsChange && points.length > 0) {
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const tGain = endPoint.currentValue - startPoint.currentValue;
      const rPct = startPoint.currentValue > 0 ? (tGain / startPoint.currentValue) * 100 : 0;
      onStatsChange({
        returnPct: rPct,
        totalGain: tGain,
        currentValue: endPoint.currentValue,
        investedValue: endPoint.investedValue
      });
    }

    return points;
  }, [isPortfolioEmpty, safeInvested, safeCurrent, timeRange, isGain, history, onStatsChange]);`;

// Find where chartData starts
const startIndex = code.indexOf('const chartData: ChartDataPoint[] = useMemo(() => {');
const endIndex = code.indexOf('// Determine Y-axis domain boundaries for proper padding');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newChartData + "\n\n  " + code.substring(endIndex);
}

// Add gain/loss and return % to tooltip
const oldTooltipRow1 = `{/* Row 1: Invested Value */}`;
const newTooltipRows = `{/* Row: Gain/Loss */}
                      <div className="flex justify-between items-center gap-4 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">Gain / Loss</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.currentValue - pt.investedValue >= 0 ? '+' : ''}{formatCurrency(pt.currentValue - pt.investedValue)}
                        </span>
                      </div>
                      {/* Row: Return % */}
                      <div className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted font-medium">Return %</span>
                        </div>
                        <span className={\`font-mono font-bold \${pt.currentValue - pt.investedValue >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          {pt.investedValue > 0 ? ((pt.currentValue - pt.investedValue) / pt.investedValue * 100).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                      {/* Row 1: Invested Value */}`;

code = code.replace(oldTooltipRow1, newTooltipRows);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
