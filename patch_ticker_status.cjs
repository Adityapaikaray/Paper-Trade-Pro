const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

const targetStatus = `<div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B887] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B887]" />
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase">
            LIVE
          </span>
          <span className="hidden sm:inline-flex text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase tracking-tight">
            {isLive ? 'STREAMING' : 'CONNECTING'}
          </span>
        </div>`;

const replacementStatus = `{(() => {
          let label = 'CONNECTING';
          let detail = 'CONNECTING...';
          let color = 'bg-amber-500';
          let bgColor = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
          let ping = true;

          if (stocks.length > 0) {
            const isOpen = marketStatus?.nse === 'REGULAR' || marketStatus?.nyse === 'REGULAR' || marketStatus?.nse === 'OPEN' || marketStatus?.nyse === 'OPEN';
            const isRealtime = stocks.some(s => s.isRealtime);

            if (!isOpen) {
              label = 'CLOSED';
              detail = 'MARKET CLOSED';
              color = 'bg-slate-500';
              bgColor = 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
              ping = false;
            } else if (!isRealtime) {
              label = 'DELAYED';
              detail = '15 MIN';
              color = 'bg-amber-500';
              bgColor = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            } else {
              label = 'LIVE';
              detail = 'STREAMING';
              color = 'bg-[#00B887]';
              bgColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            }
          }

          return (
            <div className="flex items-center gap-2" title={lastUpdated ? "Last Updated: " + new Date(lastUpdated).toLocaleTimeString() : ""}>
              <span className="relative flex h-2 w-2">
                {ping && <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${color}\`} />}
                <span className={\`relative inline-flex rounded-full h-2 w-2 \${color}\`} />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase">
                {label}
              </span>
              <span className={\`hidden sm:inline-flex text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-tight \${bgColor}\`}>
                {detail}
              </span>
            </div>
          );
        })()}`;

code = code.replace(targetStatus, replacementStatus);
fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
