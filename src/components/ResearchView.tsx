import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, BookOpen, BarChart2, DollarSign, Award, ArrowUpRight, ShieldCheck, Newspaper } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';
import StockChart from './StockChart.tsx';

interface ResearchViewProps {
  onTrade?: (stock: Stock) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ onTrade }) => {
  const { stocks } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TITAN');
  const [searchQuery, setSearchQuery] = useState('');

  const currentStock = stocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || stocks[0];

  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks.slice(0, 6);

  const currencySymbol = currentStock?.currency || '₹';
  const isPositive = (currentStock?.change || 0) >= 0;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header & Symbol Selector */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
            Institutional Research
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
            Fundamental valuation metrics, earnings trajectory, and asset profile intelligence.
          </p>
        </div>

        {/* Search / Symbol Quick Switcher */}
        <div className="w-full lg:w-80 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol (e.g. TITAN, AMD, NVDA)..."
            className="w-full bg-ui-surface border border-ui-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary shadow-2xs"
          />
          {searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-ui-border">
              {filteredStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => {
                    setSelectedSymbol(s.symbol);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-ui-surface-hover flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-text-main">{s.symbol}</span>
                  <span className="text-text-muted truncate max-w-[140px]">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Overview Banner */}
      <div className="bg-ui-surface rounded-2xl p-6 md:p-8 border border-ui-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#17243A] text-white flex items-center justify-center font-bold text-lg tracking-wide shadow-sm shrink-0">
            {currentStock.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-2xl font-bold font-sans text-text-main">{currentStock.symbol}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg">
                {currentStock.sector || 'EQUITY'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-positive/10 text-positive">
                OUTPERFORM
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">{currentStock.name} · {currentStock.country}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-left md:text-right">
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">LIVE QUOTE</p>
            <p className="text-3xl font-mono font-bold text-text-main leading-tight">
              {currencySymbol}{currentStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-xs font-mono font-bold flex items-center md:justify-end gap-1 mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{currencySymbol}{currentStock.change.toFixed(2)} ({isPositive ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
            </p>
          </div>

          {onTrade && (
            <button
              onClick={() => onTrade(currentStock)}
              className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-95 text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              Trade {currentStock.symbol} <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-main">Historical Price Movement</h4>
          <span className="text-xs font-mono text-text-muted">Volume: {currentStock.volume}</span>
        </div>
        <div className="h-72 w-full">
          <StockChart stock={currentStock} showDetails={false} showTimeframes={true} />
        </div>
      </div>

      {/* Key Financial Statistics & Valuation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ui-surface rounded-xl p-5 border border-ui-border space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">MARKET CAP</p>
          <p className="text-xl font-mono font-bold text-text-main">{currentStock.marketCap || '₹3.24 Trillion'}</p>
          <p className="text-[11px] text-text-muted">Mega-Cap Benchmark</p>
        </div>

        <div className="bg-ui-surface rounded-xl p-5 border border-ui-border space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">P/E RATIO (TTM)</p>
          <p className="text-xl font-mono font-bold text-text-main">84.2x</p>
          <p className="text-[11px] text-text-muted">Sector avg: 71.0x</p>
        </div>

        <div className="bg-ui-surface rounded-xl p-5 border border-ui-border space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">52-WEEK RANGE</p>
          <p className="text-xl font-mono font-bold text-text-main">
            {currencySymbol}{(currentStock.price * 0.78).toFixed(0)} - {currencySymbol}{(currentStock.price * 1.15).toFixed(0)}
          </p>
          <p className="text-[11px] text-positive">Within 8% of ATH</p>
        </div>

        <div className="bg-ui-surface rounded-xl p-5 border border-ui-border space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">DIVIDEND YIELD</p>
          <p className="text-xl font-mono font-bold text-text-main">0.31%</p>
          <p className="text-[11px] text-text-muted">Payout ratio: 24.5%</p>
        </div>
      </div>

      {/* Analyst Consensus & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-ui-surface rounded-2xl p-6 border border-ui-border space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h4 className="text-base font-bold text-text-main">Business Overview & Thesis</h4>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {currentStock.description ||
              `${currentStock.name} is a premier player in its industry sector, delivering consistent multi-year compounding through dominant market share, durable pricing power, and scalable distribution advantages across consumer and institutional channels.`}
          </p>
          <div className="p-4 bg-ui-bg rounded-xl border border-ui-border text-xs text-text-main space-y-2">
            <p className="font-bold flex items-center gap-2">
              <ShieldCheck size={14} className="text-positive" />
              Institutional Takeaway:
            </p>
            <p className="text-text-muted">
              Maintains an attractive return on capital employed (ROCE &gt; 25%). Balance sheet indicates low leverage with robust operating cash flow generation to fund accretive expansion.
            </p>
          </div>
        </div>

        <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border space-y-4">
          <h4 className="text-base font-bold text-text-main">Analyst Consensus</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-positive">Buy / Outperform</span>
              <span className="font-mono text-text-main font-bold">78%</span>
            </div>
            <div className="w-full h-2 bg-ui-bg rounded-full overflow-hidden">
              <div className="h-full bg-positive rounded-full" style={{ width: '78%' }} />
            </div>

            <div className="flex justify-between text-xs">
              <span className="font-bold text-primary">Hold / Neutral</span>
              <span className="font-mono text-text-main font-bold">18%</span>
            </div>
            <div className="w-full h-2 bg-ui-bg rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '18%' }} />
            </div>

            <div className="flex justify-between text-xs">
              <span className="font-bold text-negative">Sell / Underperform</span>
              <span className="font-mono text-text-main font-bold">4%</span>
            </div>
            <div className="w-full h-2 bg-ui-bg rounded-full overflow-hidden">
              <div className="h-full bg-negative rounded-full" style={{ width: '4%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
