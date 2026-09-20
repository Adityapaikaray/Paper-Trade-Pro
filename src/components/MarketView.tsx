import { motion } from 'framer-motion';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Search, Star, TrendingUp, TrendingDown, PlusCircle, Bell, ChevronDown, ChevronUp, RefreshCw, Radio, Clock, Globe } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { getRegionalMarketStatus } from '../utils/marketHours.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Stock } from '../types.ts';
import AlertModal from './AlertModal.tsx';
import StockChart from './StockChart.tsx';
import KeyIndicesBar from './KeyIndicesBar.tsx';

interface MarketViewProps {
  onTrade: (stock: Stock, side?: "BUY" | "SELL") => void;
}

const MarketView: React.FC<MarketViewProps> = ({ onTrade }) => {
  const { stocks, isLive, lastUpdated, priceTicks, refresh, isLoading, marketStatus } = useMarketData();
  const { toggleWatchlist, isWatchlisted, marketContext } = usePortfolio();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedExchange, setSelectedExchange] = React.useState('All');
  const [selectedSector, setSelectedSector] = React.useState('All');
  const [alertStock, setAlertStock] = React.useState<Stock | null>(null);
  const [expandedSymbol, setExpandedSymbol] = React.useState<string | null>(null);

  const isIndia = marketContext === 'IN';
  const regionalStatus = getRegionalMarketStatus(marketContext);

  // Region-specific stock filtering: strictly isolate US from India
  const regionalStocks = useMemo(() => {
    return stocks.filter(s => {
      if (isIndia) {
        return s.country === 'India' || s.currency === '₹' || s.exchange === 'NSE' || s.exchange === 'BSE';
      } else {
        return s.country === 'USA' || s.currency === '$' || s.exchange === 'NASDAQ' || s.exchange === 'NYSE';
      }
    });
  }, [stocks, isIndia]);

  // Regional exchange options
  const exchanges = useMemo(() => {
    return isIndia ? ['All', 'NSE', 'BSE'] : ['All', 'NASDAQ', 'NYSE'];
  }, [isIndia]);

  // Dynamic sectors for active region
  const sectors = useMemo(() => {
    return ['All', ...new Set(regionalStocks.map(s => s.sector).filter(Boolean))].sort();
  }, [regionalStocks]);

  const filteredStocks = useMemo(() => {
    return regionalStocks.filter(s => {
      const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExchange = selectedExchange === 'All' || s.exchange === selectedExchange;
      const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
      return matchesSearch && matchesExchange && matchesSector;
    });
  }, [regionalStocks, searchTerm, selectedExchange, selectedSector]);


  const toggleExpand = (symbol: string) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

  const formattedTime = new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-10 ">
      <header className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl md:text-5xl vibrant-heading primary-gradient-text italic">Live Exchange</h2>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider shrink-0 mt-2 md:mt-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Real-Time Quotes
              </span>
            </div>
            <p className="text-text-muted font-bold uppercase text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] mt-2 max-w-sm md:max-w-none">
              Real-Time Market Data Feed • 6-Second Low Latency Synchronization
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Regional Market Session Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ui-surface border border-ui-border text-[9px] font-black uppercase tracking-wider">
              <Clock size={12} className="text-primary" />
              <span className="text-text-muted">{regionalStatus.timezoneLabel}:</span>
              <span className={`px-2 py-0.5 rounded-md font-mono ${
                regionalStatus.isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : regionalStatus.status === 'Pre-Market' || regionalStatus.status === 'After Hours'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
              }`}>
                {regionalStatus.status}
              </span>
              <span className="hidden sm:inline-block text-[8.5px] text-text-muted font-normal">
                ({regionalStatus.timeString})
              </span>
            </div>

            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-ui-surface hover:bg-ui-bg border border-ui-border text-text-muted hover:text-primary transition-all text-[9px] font-black uppercase tracking-wider shadow-sm w-full md:w-auto mt-2 md:mt-0"
              title="Refresh live quotes"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-primary' : ''} />
              <span>{formattedTime}</span>
            </button>
          </div>
        </div>

        {/* Global Key Indices */}
        <KeyIndicesBar />

        {/* Filter controls and search bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-ui-bg p-1.5 rounded-2xl border border-ui-border shadow-md">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-3">Region:</span>
              <div className="flex items-center gap-1">
                {exchanges.map(exchange => (
                  <button
                    key={exchange}
                    onClick={() => setSelectedExchange(exchange)}
                    className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                      selectedExchange === exchange 
                        ? 'bg-primary text-ui-bg shadow-lg shadow-primary/10' 
                        : 'text-text-muted hover:text-primary hover:bg-ui-surface'
                    }`}
                  >
                    {exchange}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-ui-bg p-1.5 rounded-2xl border border-ui-border shadow-md">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] ml-3">Sector:</span>
              <div className="flex flex-wrap gap-1">
                {sectors.map(sector => (
                  <button
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                      selectedSector === sector 
                        ? 'bg-primary text-ui-bg shadow-lg shadow-primary/10' 
                        : 'text-text-muted hover:text-primary hover:bg-ui-surface'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group w-full xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search ticker or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ui-surface border border-ui-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-xs font-black tracking-wide text-text-main placeholder:text-text-muted shadow-md"
            />
          </div>
        </div>
      </header>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-ui-bg/50 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-ui-border">
                <th className="px-4 md:px-8 py-5 font-black sticky left-0 bg-ui-surface z-10">Asset Protocol</th>
                <th className="px-4 md:px-8 py-5 font-black hidden sm:table-cell">Designation</th>
                <th className="px-4 md:px-8 py-5 font-black">Live Valuation</th>
                <th className="px-4 md:px-8 py-5 font-black">Delta 24h</th>
                <th className="px-4 md:px-8 py-5 font-black hidden lg:table-cell">Trajectory</th>
                <th className="px-4 md:px-8 py-5 font-black hidden xl:table-cell">Capitalization</th>
                <th className="px-4 md:px-8 py-5 font-black text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border">
              {filteredStocks.map((stock) => {
                const tick = priceTicks[stock.symbol];
                const dayLow = stock.dayLow ?? (stock.price * 0.985);
                const dayHigh = stock.dayHigh ?? (stock.price * 1.015);
                const rangeSpan = dayHigh - dayLow;
                const rangePercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((stock.price - dayLow) / rangeSpan) * 100)) : 50;

                return (
                  <React.Fragment key={stock.symbol}>
                    <motion.tr initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, ease: 'easeOut' }} 
                      className={`group hover:bg-ui-bg transition-all cursor-pointer ${expandedSymbol === stock.symbol ? 'bg-ui-bg' : ''}`}
                      onClick={() => toggleExpand(stock.symbol)}
                    >
                      <td className="px-4 md:px-8 py-4 md:py-6 sticky left-0 bg-ui-surface group-hover:bg-ui-bg transition-all z-10">
                        <div className="flex items-center gap-3 md:gap-5">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(stock.symbol);
                            }}
                            className={`transition-all hover:scale-125 hidden md:block ${isWatchlisted(stock.symbol) ? 'text-primary' : 'text-text-muted/30 hover:text-primary/50'}`}
                          >
                            <Star size={18} fill={isWatchlisted(stock.symbol) ? 'currentColor' : 'none'} />
                          </button>
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-ui-bg border border-ui-border rounded-2xl flex items-center justify-center text-primary font-serif text-lg italic shadow-md group-hover:border-primary/30 transition-all shrink-0">
                            {stock.symbol.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-serif italic text-text-main text-base md:text-lg tracking-tight">{stock.symbol}</p>
                              {expandedSymbol === stock.symbol ? <ChevronUp size={14} className="text-primary hidden md:block" /> : <ChevronDown size={14} className="text-text-muted hidden md:block" />}
                            </div>
                            <p className="text-[8px] md:text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] truncate max-w-[100px] md:max-w-none">{stock.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                        <span className="text-[8px] md:text-[9px] font-black px-2 md:px-3 py-1 md:py-1.5 bg-ui-bg text-text-muted rounded-lg uppercase tracking-widest border border-ui-border whitespace-nowrap">{stock.sector}</span>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <div className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-xl font-mono font-black text-lg md:text-xl italic tracking-tighter tabular-nums transition-all duration-300 ${
                          tick === 'up'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 scale-105 shadow-lg shadow-emerald-500/10'
                            : tick === 'down'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 scale-105 shadow-lg shadow-rose-500/10'
                            : 'text-text-main'
                        }`}>
                          <span className="text-xs md:text-sm opacity-60 font-sans">{stock.currency}</span>
                          <span>{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          {tick === 'up' && <TrendingUp size={14} className="text-emerald-400 animate-bounce hidden md:block" />}
                          {tick === 'down' && <TrendingDown size={14} className="text-rose-400 animate-bounce hidden md:block" />}
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <div className={`inline-flex items-center gap-1.5 font-black px-2 md:px-3 py-1 md:py-1.5 rounded-xl text-[9px] md:text-[10px] tracking-widest ${stock.change >= 0 ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/40' : 'bg-rose-400/10 text-rose-400 border border-rose-400/40'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 w-32 md:w-48 hidden lg:table-cell">
                        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                          <StockChart stock={stock} showDetails={false} />
                        </div>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-xs md:text-sm font-mono font-black text-text-muted italic tracking-tighter hidden xl:table-cell">
                        {stock.marketCap}
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                        <div className="flex items-center justify-end gap-2 md:gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlertStock(stock);
                            }}
                            className="p-2 md:p-3 bg-ui-bg text-text-muted hover:text-primary hover:bg-ui-surface rounded-xl transition-all border border-ui-border shadow-sm hidden sm:block"
                            title="Set Price Alert"
                          >
                            <Bell size={16} />
                          </button>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onTrade(stock, 'BUY');
                              }}
                              className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-positive text-white hover:opacity-95 text-[10px] md:text-xs font-bold shadow-sm transition-all"
                            >
                              Buy
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onTrade(stock, 'SELL');
                              }}
                              className="px-3 md:px-5 py-2 md:py-2.5 rounded-xl bg-negative text-white hover:opacity-95 text-[10px] md:text-xs font-bold shadow-sm transition-all"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  {expandedSymbol === stock.symbol && (
                    <motion.tr initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                      <td colSpan={7} className="px-10 py-10 bg-ui-bg/60 border-b border-ui-border">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Real-Time Market Depth</h5>
                              <span className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Real-Time Feed Active
                              </span>
                            </div>

                            {/* Intraday Day Range Slider */}
                            <div className="p-5 bg-ui-surface rounded-2xl border border-ui-border space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider text-text-muted">
                                <span>Day Low: {stock.currency}{dayLow.toFixed(2)}</span>
                                <span className="text-text-main font-black">Current: {stock.currency}{stock.price.toFixed(2)}</span>
                                <span>Day High: {stock.currency}{dayHigh.toFixed(2)}</span>
                              </div>
                              <div className="w-full h-2 bg-ui-bg rounded-full overflow-hidden relative border border-ui-border">
                                <div 
                                  className="h-full bg-linear-to-r from-rose-400 via-primary to-emerald-400 rounded-full transition-all duration-500"
                                  style={{ width: `${rangePercent}%` }}
                                />
                              </div>
                            </div>

                            <p className="text-text-muted text-sm font-bold leading-relaxed border-l-2 border-primary/30 pl-4 italic">
                              {stock.description || 'This asset is traded continuously with real-time liquidity on major exchanges.'}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { label: 'Market Cap', value: stock.marketCap },
                                { label: 'Real Volume', value: stock.volume },
                                { label: '52W Range', value: stock.fiftyTwoWeekHigh ? `${stock.currency}${stock.fiftyTwoWeekLow?.toFixed(0)} - ${stock.currency}${stock.fiftyTwoWeekHigh?.toFixed(0)}` : 'N/A' },
                                { label: 'Region', value: stock.country }
                              ].map(detail => (
                                <div key={detail.label} className="p-4 bg-ui-surface rounded-2xl border border-ui-border">
                                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">{detail.label}</p>
                                  <p className="text-xs font-mono font-black text-text-main italic">{detail.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="h-80 bg-ui-surface rounded-3xl border border-ui-border p-6 relative overflow-hidden backdrop-blur-3xl group/chart flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Real-Time Stock Chart & Historical Candlesticks</h5>
                              <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Realtime Feed
                              </span>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                              <StockChart stock={stock} height={220} showDetails={true} showTimeframes={true} />
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
        {filteredStocks.length === 0 && (
          <div className="py-20 text-center text-text-muted flex flex-col items-center">
            <Search size={40} className="mb-4 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Protocols Matching Query</p>
          </div>
        )}
      </motion.div>

      <AlertModal 
        stock={alertStock} 
        onClose={() => setAlertStock(null)} 
      />
    </div>
  );
};

export default MarketView;
