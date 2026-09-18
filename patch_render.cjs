const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// Inside the chart area, add Loading and Error overlays
const oldChartCanvas = `<div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">`;
        
const newChartCanvas = `<div className="flex-1 w-full min-h-[300px] relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ui-bg/50 backdrop-blur-sm rounded-lg">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold text-text-main">Loading portfolio history...</p>
          </div>
        )}
        
        {error && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ui-bg/80 backdrop-blur-sm rounded-lg">
            <p className="text-sm font-bold text-negative mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-1.5 bg-ui-surface-hover border border-ui-border rounded-full text-xs font-bold text-text-main hover:bg-ui-border transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">`;
code = code.replace(oldChartCanvas, newChartCanvas);

// Add Status row below chart
const oldEnd = `</ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );`;

const newEnd = `</ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Real-time Status Indicator */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-mono tracking-wide border-t border-ui-border pt-3">
        <div className="flex items-center gap-1.5">
          <div className={\`w-2 h-2 rounded-full \${isLive ? 'bg-positive animate-pulse' : 'bg-negative'}\`} />
          <span className={\`font-bold \${isLive ? 'text-positive' : 'text-negative'}\`}>
            {isLive ? 'LIVE' : 'MARKET DATA UNAVAILABLE'}
          </span>
        </div>
        {isLive && (
          <>
            <span className="text-text-muted px-1.5 py-0.5 rounded bg-ui-surface-hover border border-ui-border font-bold">
              MARKET {timeRange === '1 MIN' || timeRange === '5 MIN' || timeRange === '30 MIN' || timeRange === '1 HR' ? 'OPEN' : 'DATA'}
            </span>
            <span className="text-text-muted">
              Last updated: {new Date(lastUpdated || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </>
        )}
      </div>
    </div>
  );`;
code = code.replace(oldEnd, newEnd);

// In tooltip, add LIVE status
const oldTooltipHeader = `{/* Date header */}
                      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted pb-1.5 border-b border-ui-border">
                        {pt.fullDate}
                      </p>`;

const newTooltipHeader = `{/* Date header */}
                      <div className="flex justify-between items-center pb-1.5 border-b border-ui-border">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          {pt.fullDate}
                        </p>
                        {isLive && (pt.timestamp > Date.now() - 60000) && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                            <span className="text-[9px] font-bold text-positive tracking-wider">LIVE</span>
                          </div>
                        )}
                      </div>`;
code = code.replace(oldTooltipHeader, newTooltipHeader);

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
