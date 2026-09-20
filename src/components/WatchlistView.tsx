import React, { useState, useMemo } from 'react';
import { Search, Star, Trash2, ArrowUpRight, ArrowDownRight, Bell, ChevronDown, Plus, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';
import { Stock } from '../types.ts';

interface WatchlistViewProps {
  onTrade: (stock: Stock, side?: "BUY" | "SELL") => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({ onTrade }) => {
  const { profile, toggleWatchlist, isWatchlisted, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { addToast, openModal } = useUI();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'change_desc' | 'change_asc' | 'price_desc' | 'symbol_asc'>('change_desc');
  const [selectedSector, setSelectedSector] = useState('All');

  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';

  // Base watchlist items filtered strictly by market region
  const watchlistStocks = useMemo(() => {
    // If user has items in profile watchlist
    const userSymbols = new Set(profile?.watchlist || []);

    // Provide default watched symbols tailored to market region
    const defaultWatchlist = isIndia
      ? ['RELIANCE', 'TCS', 'TITAN', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK']
      : ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'SPY', 'QQQ', 'META', 'AMD'];
    
    return stocks
      .filter(s => isIndia ? (s.currency === '₹' || s.country === 'India') : (s.currency === '$' || s.country === 'USA'))
      .filter((s) => userSymbols.has(s.symbol) || defaultWatchlist.includes(s.symbol));
  }, [profile?.watchlist, stocks, isIndia]);

  const sectors = useMemo(() => {
    return ['All', ...new Set(watchlistStocks.map((s) => s.sector || 'General'))];
  }, [watchlistStocks]);

  const filteredWatchlist = useMemo(() => {
    let list = watchlistStocks.filter((s) => {
      const matchesSearch =
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    list.sort((a, b) => {
      switch (sortOption) {
        case 'change_desc':
          return b.changePercent - a.changePercent;
        case 'change_asc':
          return a.changePercent - b.changePercent;
        case 'price_desc':
          return b.price - a.price;
        case 'symbol_asc':
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

    return list;
  }, [watchlistStocks, searchQuery, selectedSector, sortOption]);

  const handleSetAlert = (stock: Stock) => {
    addToast(`Price alert set for ${stock.symbol} at ${stock.currency || '₹'}${stock.price.toFixed(2)}`, 'info');
  };

  const handleRemove = (stock: Stock) => {
    toggleWatchlist(stock.symbol);
    addToast(`Removed ${stock.symbol} from Watchlist`, 'info');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
            Watchlist
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
            Monitor real-time prices, alert thresholds, and quick-trade your radar equities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watchlist..."
              className="w-full bg-ui-surface border border-ui-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Filter and Sorting Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Sector filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                  : 'bg-ui-surface border border-ui-border text-text-muted hover:text-text-main'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted">Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-ui-surface border border-ui-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-main focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
          >
            <option value="change_desc">% Change (High → Low)</option>
            <option value="change_asc">% Change (Low → High)</option>
            <option value="price_desc">Price (High → Low)</option>
            <option value="symbol_asc">Symbol (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Watchlist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredWatchlist.map((stock) => {
          const isPositive = stock.change >= 0;
          const curr = stock.currency || currencySymbol;

          return (
            <div
              key={stock.symbol}
              className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Top info */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-xs tracking-wide shadow-xs shrink-0">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold font-sans text-text-main leading-none">
                          {stock.symbol}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg">
                          {stock.sector || 'EQUITY'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 truncate max-w-[180px]">{stock.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetAlert(stock)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-ui-surface-hover transition-colors"
                      title="Set Price Alert"
                    >
                      <Bell size={15} />
                    </button>
                    <button
                      onClick={() => handleRemove(stock)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-negative hover:bg-ui-surface-hover transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Price and Day Change */}
                <div className="mt-5 flex items-baseline justify-between border-t border-ui-border/60 pt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">MARKET PRICE</p>
                    <p className="text-xl font-mono font-bold text-text-main mt-0.5">
                      {curr}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">DAY RETURN</p>
                    <p className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPositive ? '+' : ''}{curr}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Simulated Sparkline / Mini Bar */}
                <div className="mt-4 pt-3 border-t border-ui-border/40 flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>Vol: {stock.volume}</span>
                  <span>Cap: {stock.marketCap}</span>
                </div>
              </div>

              {/* Action Buttons: Buy / Sell */}
              <div className="mt-5 pt-4 border-t border-ui-border flex items-center gap-2">
                <button
                  onClick={() => onTrade(stock, 'BUY')}
                  className="flex-1 py-2 rounded-xl bg-positive/10 text-positive border border-positive/30 hover:bg-positive hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <ArrowUpRight size={14} /> Buy
                </button>
                <button
                  onClick={() => onTrade(stock, 'SELL')}
                  className="flex-1 py-2 rounded-xl bg-negative/10 text-negative border border-negative/30 hover:bg-negative hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <ArrowDownRight size={14} /> Sell
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
