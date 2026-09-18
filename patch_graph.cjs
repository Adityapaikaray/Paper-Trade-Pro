const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// 1. Add stocks to useMarketData
code = code.replace("const { isLive, lastUpdated } = useMarketData();", "const { isLive, lastUpdated, stocks } = useMarketData();");

// 2. Add isIntradayMode and portfolioPrevClose
const prevCloseLogic = `  const holdings = profile.holdings || [];

  const isIntradayMode = ['1 MIN', '5 MIN', '30 MIN', '1 HR'].includes(timeRange || '1M');

  const portfolioPrevClose = useMemo(() => {
    if (isPortfolioEmpty || !hasHoldings || holdings.length === 0) return 0;
    let total = 0;
    holdings.forEach(h => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      const prev = stock?.prevClose || h.averagePrice || 0;
      total += prev * h.shares;
    });
    return total;
  }, [holdings, stocks, isPortfolioEmpty, hasHoldings]);`;
code = code.replace("const holdings = profile.holdings || [];", prevCloseLogic);

// 3. Update the pnl calculation
const pnlOld = `// Return & P&L calculation strictly between Current Value and Invested Value (zero cash)
  const pnl = safeCurrent - safeInvested;
  const returnPct = safeInvested > 0 ? (pnl / safeInvested) * 100 : 0;
  const isGain = pnl >= 0;`;

const pnlNew = `// For intraday, use previous close as reference
  const refValue = isIntradayMode ? portfolioPrevClose : safeInvested;
  const pnl = safeCurrent - refValue;
  const returnPct = refValue > 0 ? (pnl / refValue) * 100 : 0;
  const isGain = pnl >= 0;`;
code = code.replace(pnlOld, pnlNew);

// 4. Update the chartData generation to use portfolioPrevClose for investedValue if isIntradayMode
code = code.replace("investedValue: safeInv,", "investedValue: isIntradayMode ? Number(portfolioPrevClose.toFixed(2)) : safeInv,");
code = code.replace("investedValue: safeInv,", "investedValue: isIntradayMode ? Number(portfolioPrevClose.toFixed(2)) : safeInv,");

// 5. Update the Legend
const oldLegend1 = `<span className="text-xs font-bold text-text-muted uppercase tracking-wider">Invested Value</span>`;
const newLegend1 = `<span className="text-xs font-bold text-text-muted uppercase tracking-wider group relative cursor-help">
              {isIntradayMode ? 'Previous Day Close' : 'Invested Value'}
              {isIntradayMode && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ui-surface border border-ui-border rounded shadow-xl text-[10px] normal-case text-text-main opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Intraday performance is measured against the previous trading day's portfolio close.
                </div>
              )}
            </span>`;
code = code.replace(oldLegend1, newLegend1);

const oldLegendVal1 = `{formatCurrency(safeInvested)}`;
const newLegendVal1 = `{formatCurrency(refValue)}`;
code = code.replace(oldLegendVal1, newLegendVal1);

// 6. Update Tooltip 
const oldTooltip1 = `<span className="text-text-muted font-medium">Invested Value</span>`;
const newTooltip1 = `<span className="text-text-muted font-medium">{isIntradayMode ? 'Prev Day Close' : 'Invested Value'}</span>`;
code = code.replace(oldTooltip1, newTooltip1);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
