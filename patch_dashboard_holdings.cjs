const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// We need to inject holdingsWithData logic.
const holdingsWithDataLogic = `
  const holdingsWithData = profile.holdings
    .map(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      return { holding, stock };
    })
    .filter(h => h.stock && h.stock.currency === currencySymbol)
    .map(h => {
      const currentPrice = h.stock.price;
      const avgCost = h.holding.averagePrice;
      const quantity = h.holding.shares;
      const marketValue = currentPrice * quantity;
      const costValue = avgCost * quantity;
      const unrealizedPL = marketValue - costValue;
      const unrealizedPLPct = (currentPrice / avgCost - 1) * 100;
      const todayChange = h.stock.change * quantity;
      const todayChangePct = h.stock.changePercent;
      const allocation = portfolioValue > 0 ? (marketValue / portfolioValue) * 100 : 0;
      
      return {
        ...h.holding,
        stock: h.stock,
        currentPrice,
        marketValue,
        unrealizedPL,
        unrealizedPLPct,
        todayChange,
        todayChangePct,
        allocation
      };
    });
`;

code = code.replace(
  "const unrealizedReturnPct = totalCost > 0 ? (unrealizedReturn / totalCost) * 100 : 0;",
  "const unrealizedReturnPct = totalCost > 0 ? (unrealizedReturn / totalCost) * 100 : 0;\n" + holdingsWithDataLogic
);

// We should replace the TITAN CARD and AMD CARD section with a mapping over holdingsWithData
// Find where the cards are located.
// The hardcoded section starts right after <div className="space-y-4"> which is after "Grid/List buttons"
// We'll replace the block.
const oldSectionStart = code.indexOf('{/* TITAN CARD */}');
const oldSectionEnd = code.indexOf('{/* Portfolio Composition */}');

if (oldSectionStart !== -1 && oldSectionEnd !== -1) {
  const dynamicHoldings = `
              {holdingsWithData.length === 0 ? (
                <div className="vibrant-card p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center mb-4">
                    <List size={24} className="text-text-muted" />
                  </div>
                  <h4 className="text-text-main font-bold mb-2">No Active Positions</h4>
                  <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">You don't have any holdings in this market yet. Visit the Market view to start building your portfolio.</p>
                </div>
              ) : holdingsWithData.map((h, i) => (
                <div key={h.symbol} className="vibrant-card p-5 group">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5 border-b border-ui-border pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1A1F29] border border-ui-border flex items-center justify-center font-bold text-lg text-white">
                        {h.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-text-main leading-tight">{h.symbol}</h4>
                        <p className="text-xs text-text-muted">{h.stock?.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">Equity</span>
                          <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">{h.stock?.sector || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Current Price</p>
                      <p className="text-xl font-mono font-black text-text-main">{currencySymbol}{h.currentPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                      <p className={\`text-sm font-mono font-bold \${h.stock.change >= 0 ? 'text-positive' : 'text-negative'}\`}>
                        {h.stock.change >= 0 ? '+' : ''}{currencySymbol}{h.stock.change.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} 
                        ({h.stock.changePercent >= 0 ? '+' : ''}{h.stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Quantity</p>
                      <p className="text-sm font-mono font-bold text-text-main">{h.shares}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Avg. Cost</p>
                      <p className="text-sm font-mono font-bold text-text-main">{currencySymbol}{h.averagePrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Market Value</p>
                      <p className="text-sm font-mono font-bold text-text-main">{currencySymbol}{h.marketValue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Unrealized P/L</p>
                      <p className={\`text-sm font-mono font-bold \${h.unrealizedPL >= 0 ? 'text-positive' : 'text-negative'}\`}>
                        {h.unrealizedPL >= 0 ? '+' : ''}{currencySymbol}{h.unrealizedPL.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} 
                        <span className="text-[10px]"> ({h.unrealizedPLPct >= 0 ? '+' : ''}{h.unrealizedPLPct.toFixed(2)}%)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Today's Change</p>
                      <p className={\`text-sm font-mono font-bold \${h.todayChange >= 0 ? 'text-positive' : 'text-negative'}\`}>
                        {h.todayChange >= 0 ? '+' : ''}{currencySymbol}{h.todayChange.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} 
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Allocation</p>
                        <p className="text-sm font-mono font-bold text-text-main">{h.allocation.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => onTrade && onTrade(h.stock)} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">Trade / Details</button>
                    <button onClick={() => openModal('modify-allocation', { stock: h.stock, holding: h, currentAllocation: h.allocation })} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">Modify Allocation</button>
                  </div>
                </div>
              ))}
              `;
              
  code = code.substring(0, oldSectionStart) + dynamicHoldings + "\n              " + code.substring(oldSectionEnd);
}

// Ensure "Your Goals" doesn't have a fake 'Manage' button if there's no modal. We can hide it or keep it static.
code = code.replace(
  /<button className="text-xs text-primary hover:text-primary-light font-bold flex items-center gap-1">Manage <ArrowRight size=\{12\} \/><\/button>/,
  ''
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched DashboardView Holdings");
