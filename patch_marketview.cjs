const fs = require('fs');
let code = fs.readFileSync('src/components/MarketView.tsx', 'utf8');

// Insert the Market Dashboard component before the stock list
const dashboardHTML = `
      {/* Market Dashboard - Trends & Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-ui-surface p-4 border border-ui-border rounded-xl">
          <h3 className="text-xs font-bold text-text-muted mb-3 flex items-center"><TrendingUp size={14} className="mr-1 text-positive"/> TOP GAINERS</h3>
          <div className="space-y-2">
            {stocks.filter(s => s.changePercent > 0).sort((a,b) => b.changePercent - a.changePercent).slice(0, 3).map(s => (
              <div key={s.symbol} className="flex justify-between items-center text-sm">
                <span className="font-bold">{s.symbol}</span>
                <span className="text-positive">+{s.changePercent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-ui-surface p-4 border border-ui-border rounded-xl">
          <h3 className="text-xs font-bold text-text-muted mb-3 flex items-center"><TrendingDown size={14} className="mr-1 text-negative"/> TOP LOSERS</h3>
          <div className="space-y-2">
            {stocks.filter(s => s.changePercent < 0).sort((a,b) => a.changePercent - b.changePercent).slice(0, 3).map(s => (
              <div key={s.symbol} className="flex justify-between items-center text-sm">
                <span className="font-bold">{s.symbol}</span>
                <span className="text-negative">{s.changePercent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-ui-surface p-4 border border-ui-border rounded-xl col-span-1 md:col-span-2 flex flex-col justify-center">
           <h3 className="text-xs font-bold text-text-muted mb-2">MARKET SENTIMENT</h3>
           <div className="w-full bg-ui-border h-2 rounded-full mt-2 flex overflow-hidden">
             <div className="bg-positive h-full" style={{width: \`\${Math.max(10, Math.min(90, (stocks.filter(s => s.changePercent > 0).length / stocks.length) * 100))}%\`}}></div>
             <div className="bg-negative h-full flex-1"></div>
           </div>
           <div className="flex justify-between mt-2 text-[10px] text-text-muted font-bold">
             <span>ADVANCING</span>
             <span>DECLINING</span>
           </div>
        </div>
      </div>
`;

code = code.replace(/<div className="overflow-x-auto">/, dashboardHTML + '\n      <div className="overflow-x-auto">');

fs.writeFileSync('src/components/MarketView.tsx', code);
