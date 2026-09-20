import { motion } from 'framer-motion';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  RefreshCw,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Clock,
  Layers,
  ArrowUpRight,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { IndexQuote, Stock } from '../types.ts';
import IndexChart from './IndexChart.tsx';
import StockHeatmapView from './StockHeatmapView.tsx';

interface KeyIndexViewProps {
  onTrade?: (stock: Stock) => void;
}

// Representative constituent stocks for quick trading integration
const INDEX_CONSTITUENTS: Record<string, string[]> = {
  dow: ['AAPL', 'MSFT', 'GS', 'UNH', 'JPM', 'CAT'],
  sandp500: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META'],
  nasdaq: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'GOOGL'],
  dax: ['SAP', 'SIE', 'ALV', 'DTE'],
  nifty: ['RELIANCE:NSE', 'TCS:NSE', 'HDFCBANK:NSE', 'INFY:NSE', 'ICICIBANK:NSE', 'SBIN:NSE'],
  sensex: ['RELIANCE:NSE', 'TCS:NSE', 'HDFCBANK:NSE', 'INFY:NSE', 'ITC:NSE', 'LT:NSE'],
  niftybank: ['HDFCBANK:NSE', 'ICICIBANK:NSE', 'SBIN:NSE', 'KOTAKBANK:NSE', 'AXISBANK:NSE']
};

export const KeyIndexView: React.FC<KeyIndexViewProps> = ({ onTrade }) => {
  const { indices, indexTicks, stocks, isLive, lastUpdated, refresh, isLoading, marketStatus } = useMarketData();
  const { marketContext } = usePortfolio();
  const [selectedKey, setSelectedKey] = useState<string>('dow');
  const [viewMode, setViewMode] = useState<'chart' | 'heatmap'>('chart');
  const [regionFilter, setRegionFilter] = useState<string>(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));

  React.useEffect(() => {
    const newRegion = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL');
    const firstIndex = indices.find(idx => newRegion === 'ALL' || idx.region === newRegion);
    if (firstIndex) setSelectedKey(firstIndex.key);
    setRegionFilter(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));
  }, [marketContext]);

  const selectedIndex = useMemo(() => {
    return indices.find(idx => idx.key === selectedKey) || indices[0];
  }, [indices, selectedKey]);

  const filteredIndices = useMemo(() => {
    if (regionFilter === 'ALL') return indices;
    return indices.filter(idx => idx.region === regionFilter);
  }, [indices, regionFilter]);

  // Find constituent stocks matching this index for instant trading
  const constituentSymbols = INDEX_CONSTITUENTS[selectedIndex?.key] || [];
  const constituentStocks = useMemo(() => {
    return constituentSymbols
      .map(sym => stocks.find(s => s.symbol === sym || s.symbol.startsWith(sym.replace(':NSE', ''))))
      .filter((s): s is Stock => !!s);
  }, [constituentSymbols, stocks]);

  // Intraday day range calculation
  const dayLow = selectedIndex?.dayLow ?? (selectedIndex ? selectedIndex.price * 0.992 : 0);
  const dayHigh = selectedIndex?.dayHigh ?? (selectedIndex ? selectedIndex.price * 1.008 : 0);
  const rangeSpan = Math.max(dayHigh - dayLow, 0.001);
  const rangePercent = selectedIndex
    ? Math.min(Math.max(((selectedIndex.price - dayLow) / rangeSpan) * 100, 0), 100)
    : 50;

  const isSelectedPositive = selectedIndex ? selectedIndex.change >= 0 : true;

  return (
    <div className="space-y-8  pb-16">
      {/* View Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-ui-border">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <BarChart3 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-serif italic font-black text-text-main tracking-tight">
                  Key Indices & Benchmarks
                </h2>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Real-Time Trajectories
                </span>
              </div>
              <p className="text-xs font-mono text-text-muted mt-1">
                Continuous real-time graphs and multi-timeframe analytics for Wall Street, Dalal Street, and European benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* Global Market Status & Refresh */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-ui-surface px-4 py-2 rounded-2xl border border-ui-border">
            <div className="flex items-center gap-2 pr-3 border-r border-ui-border">
              <span className="text-[9px] font-mono font-bold text-text-muted uppercase">US (NYSE):</span>
              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                marketStatus.nyse === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {marketStatus.nyse}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[9px] font-mono font-bold text-text-muted uppercase">India (NSE):</span>
              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                marketStatus.nse === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {marketStatus.nse}
              </span>
            </div>
          </div>

          {/* View Mode Toggle: Charts vs Stock Heatmap */}
          <div className="flex items-center bg-ui-surface border border-ui-border rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                viewMode === 'chart'
                  ? 'bg-primary text-ui-bg font-black shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <BarChart3 size={14} />
              <span>Real-Time Charts</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-primary text-ui-bg font-black shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Stock Heatmap</span>
            </button>
          </div>

          <button
            id="key-index-refresh-btn"
            onClick={() => refresh()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-ui-surface border border-ui-border hover:border-primary/30 text-text-main text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary' : 'text-primary'} />
            <span>{isLoading ? 'Updating Feed...' : 'Sync Quotes'}</span>
          </button>
        </div>
      </header>

      {viewMode === 'heatmap' ? (
        <StockHeatmapView defaultIndexKey={selectedKey} onTrade={onTrade} embedded={true} />
      ) : (
        <>
      {/* Hero Featured Index Chart Section */}
      {selectedIndex && (
        <section id="hero-index-chart-section" className="bg-ui-surface border border-ui-border rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Subtle ambient back-glow */}
          <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isSelectedPositive ? 'bg-emerald-500' : 'bg-rose-500'
          }`} />

          {/* Index Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ui-border relative z-10">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider mr-1 shrink-0">
                Inspect Index:
              </span>
              {indices.map(idx => (
                <button
                  key={idx.key}
                  id={`select-index-${idx.key}`}
                  onClick={() => setSelectedKey(idx.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif italic tracking-wide transition-all shrink-0 flex items-center gap-2 ${
                    selectedKey === idx.key
                      ? 'bg-primary text-ui-bg font-black shadow-md scale-105'
                      : 'bg-ui-bg border border-ui-border text-text-muted hover:text-text-main hover:border-primary/30'
                  }`}
                >
                  <span>{idx.displaySymbol}</span>
                  <span className={`text-[9px] font-mono font-bold ${
                    selectedKey === idx.key
                      ? 'text-ui-bg opacity-80'
                      : idx.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {idx.change >= 0 ? '+' : ''}{idx.percentChange.toFixed(1)}%
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono font-bold text-text-muted uppercase px-2.5 py-1 rounded-lg bg-ui-bg border border-ui-border">
                {selectedIndex.region} Benchmark • {selectedIndex.symbol}
              </span>
            </div>
          </div>

          {/* Hero Header & Real-time Quote Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6 relative z-10">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-serif italic font-black text-text-main tracking-tight">
                    {selectedIndex.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-text-muted px-2 py-0.5 rounded bg-ui-bg border border-ui-border">
                    {selectedIndex.displaySymbol}
                  </span>
                </div>
                <p className="text-xs font-mono text-text-muted mt-1">
                  Exchange Ticker: <span className="text-primary font-bold">{selectedIndex.symbol}</span>
                </p>
              </div>

              {/* Price & Change Block */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-sm font-mono font-bold text-text-muted">{selectedIndex.currency}</span>
                <span className={`text-4xl sm:text-5xl font-mono font-black italic tracking-tight transition-all duration-300 ${
                  indexTicks[selectedIndex.key] === 'up'
                    ? 'text-emerald-400 scale-105'
                    : indexTicks[selectedIndex.key] === 'down'
                    ? 'text-rose-400 scale-105'
                    : 'text-text-main'
                }`}>
                  {selectedIndex.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-black ${
                  isSelectedPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {isSelectedPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{isSelectedPositive ? '+' : ''}{selectedIndex.change.toFixed(2)}</span>
                  <span>({isSelectedPositive ? '+' : ''}{selectedIndex.percentChange.toFixed(2)}%)</span>
                </div>
              </div>

              {/* Intraday Day Range Slider */}
              <div className="p-4 bg-ui-bg rounded-2xl border border-ui-border space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider text-text-muted">
                  <span>Day Low: {selectedIndex.currency}{dayLow.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  <span className="text-text-main font-black">Day Trading Range</span>
                  <span>Day High: {selectedIndex.currency}{dayHigh.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
                <div className="w-full h-2 bg-ui-surface rounded-full overflow-hidden relative border border-ui-border">
                  <div
                    className="h-full bg-linear-to-r from-rose-400 via-primary to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${rangePercent}%` }}
                  />
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-ui-bg rounded-xl border border-ui-border">
                  <p className="text-[8px] font-mono font-bold uppercase text-text-muted">Prev Close</p>
                  <p className="text-xs font-mono font-black text-text-main mt-0.5">
                    {selectedIndex.currency}{selectedIndex.prevClose?.toLocaleString(undefined, { maximumFractionDigits: 1 }) || '—'}
                  </p>
                </div>
                <div className="p-3 bg-ui-bg rounded-xl border border-ui-border">
                  <p className="text-[8px] font-mono font-bold uppercase text-text-muted">52-Week Range</p>
                  <p className="text-xs font-mono font-black text-text-main mt-0.5 truncate">
                    {selectedIndex.fiftyTwoWeekHigh
                      ? `${selectedIndex.fiftyTwoWeekLow?.toFixed(0)} - ${selectedIndex.fiftyTwoWeekHigh?.toFixed(0)}`
                      : '—'}
                  </p>
                </div>
                <div className="p-3 bg-ui-bg rounded-xl border border-ui-border">
                  <p className="text-[8px] font-mono font-bold uppercase text-text-muted">Region</p>
                  <p className="text-xs font-mono font-black text-text-main mt-0.5">
                    {selectedIndex.region}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Real-Time Chart */}
            <div className="lg:col-span-7 bg-ui-bg/70 rounded-2xl border border-ui-border p-5 flex flex-col justify-between min-h-[340px]">
              <IndexChart
                index={selectedIndex}
                height={320}
                hero={true}
                showTimeframes={true}
              />
            </div>
          </div>

          {/* Quick Component Stock Trading Strip (Index Contributors) */}
          {constituentStocks.length > 0 && onTrade && (
            <div className="pt-6 border-t border-ui-border mt-2 relative z-10">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-primary animate-pulse" />
                  <span className="text-[10px] font-mono font-black uppercase text-primary tracking-wider">
                    Live Index Contributors ({selectedIndex.displaySymbol})
                  </span>
                </div>
                <span className="text-[9px] font-mono text-text-muted">
                  Real-time quotes • Click to place order
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {constituentStocks.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => onTrade(stock)}
                    className="p-3 bg-ui-bg hover:bg-primary/5 border border-ui-border hover:border-primary/40 rounded-xl transition-all text-left flex flex-col justify-between group shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-serif italic font-black text-text-main group-hover:text-primary transition-colors truncate">
                        {stock.symbol.replace(':NSE', '')}
                      </span>
                      <ArrowUpRight size={12} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                    </div>
                    <div className="mt-2">
                      <p className="text-[11px] font-mono font-black text-text-main">
                        {stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[9px] font-mono font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Grid of ALL 7 Key Indices with Real-Time Graphs */}
      <section id="all-indices-grid-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              <h3 className="text-2xl font-serif italic font-black text-text-main tracking-tight">
                All Key Indices ({filteredIndices.length})
              </h3>
            </div>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Live streaming charts, intraday movements, and technical depth across every major index.
            </p>
          </div>

          {/* Region Filters */}
          <div className="flex items-center bg-ui-surface p-1 rounded-2xl border border-ui-border">
            {[
              { id: 'ALL', label: 'All Indices' },
              { id: 'US', label: 'US (Wall St)' },
              { id: 'India', label: 'India (NSE / BSE)' },
              { id: 'Europe', label: 'Europe (DAX)' }
            ].map(tab => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id.toLowerCase()}`}
                onClick={() => setRegionFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  regionFilter === tab.id
                    ? 'bg-primary text-ui-bg font-black shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* The 7 Indices Cards with live charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredIndices.map(idx => {
            const tick = indexTicks[idx.key];
            const isPositive = idx.change >= 0;
            const isHighlighted = selectedKey === idx.key;
            const idxLow = idx.dayLow ?? idx.price * 0.993;
            const idxHigh = idx.dayHigh ?? idx.price * 1.007;

            return (
              <div
                key={idx.key}
                id={`all-index-card-${idx.key}`}
                className={`bg-ui-surface rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                  isHighlighted
                    ? 'border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/40'
                    : tick === 'up'
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : tick === 'down'
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-ui-border hover:border-primary/40 hover:shadow-lg'
                }`}
              >
                {/* Header row */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif italic font-black text-lg text-text-main tracking-tight group-hover:text-primary transition-colors">
                        {idx.displaySymbol}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted uppercase">
                        {idx.region}
                      </span>
                    </div>

                    <button
                      id={`inspect-btn-${idx.key}`}
                      onClick={() => {
                        setSelectedKey(idx.key);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-ui-bg hover:bg-primary hover:text-ui-bg border border-ui-border transition-all flex items-center gap-1 text-text-muted hover:border-primary"
                    >
                      <span>Hero Chart</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <p className="text-xs font-mono text-text-muted mb-4 truncate">
                    {idx.name} • <span className="text-text-main font-bold">{idx.symbol}</span>
                  </p>

                  {/* Real-time Quote and Point Delta */}
                  <div className="flex items-baseline justify-between gap-4 py-2 border-y border-ui-border/60 mb-4">
                    <div>
                      <span className="text-xs font-mono text-text-muted mr-1">{idx.currency}</span>
                      <span className={`text-2xl font-mono font-black italic tracking-tight transition-all duration-300 ${
                        tick === 'up' ? 'text-emerald-400' : tick === 'down' ? 'text-rose-400' : 'text-text-main'
                      }`}>
                        {idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-black ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{isPositive ? '+' : ''}{idx.change.toFixed(2)}</span>
                      <span>({isPositive ? '+' : ''}{idx.percentChange.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Graph of this Index */}
                <div className="bg-ui-bg/80 rounded-2xl border border-ui-border p-3 my-2">
                  <div className="flex items-center justify-between text-[8px] font-mono text-text-muted mb-1 px-1">
                    <span className="uppercase font-bold tracking-wider">Real-Time Trajectory</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live
                    </span>
                  </div>
                  <div className="h-36 w-full">
                    <IndexChart index={idx} height={144} hero={false} />
                  </div>
                </div>

                {/* Day Range & Footer */}
                <div className="pt-3 border-t border-ui-border/60 mt-2 space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-text-muted">
                    <span>Low: {idx.currency}{idxLow.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                    <span>High: {idx.currency}{idxHigh.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="w-full h-1.5 bg-ui-bg rounded-full overflow-hidden border border-ui-border/50">
                    <div
                      className="h-full bg-linear-to-r from-rose-400 via-primary to-emerald-400 rounded-full"
                      style={{
                        width: `${Math.min(Math.max(((idx.price - idxLow) / Math.max(idxHigh - idxLow, 1)) * 100, 0), 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Benchmark Matrix & Performance Overview */}
      <section id="benchmark-matrix-section" className="bg-ui-surface border border-ui-border rounded-3xl p-8 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-ui-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layers size={16} />
            </div>
            <div>
              <h4 className="font-serif italic font-black text-xl text-text-main tracking-tight">
                Global Benchmark Matrix & Daily Relative Performance
              </h4>
              <p className="text-xs font-mono text-text-muted mt-0.5">
                Side-by-side relative variance comparison across international equity bourses
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-muted px-3 py-1 rounded-xl bg-ui-bg border border-ui-border">
            {indices.length} Active Feeds
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar pt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ui-border text-[9px] font-mono uppercase tracking-widest text-text-muted">
                <th className="pb-4 font-bold">Index Symbol</th>
                <th className="pb-4 font-bold">Benchmark Name</th>
                <th className="pb-4 font-bold">Bourse Region</th>
                <th className="pb-4 font-bold">Real-Time Level</th>
                <th className="pb-4 font-bold">Point Delta</th>
                <th className="pb-4 font-bold">Percent Change</th>
                <th className="pb-4 font-bold">Intraday Range</th>
                <th className="pb-4 font-bold text-right">Interactive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border/40">
              {indices.map(idx => {
                const isPositive = idx.change >= 0;
                return (
                  <motion.tr initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, ease: 'easeOut' }}
                    key={idx.key}
                    id={`table-row-${idx.key}`}
                    onClick={() => {
                      setSelectedKey(idx.key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`cursor-pointer transition-colors group ${
                      selectedKey === idx.key ? 'bg-primary/5' : 'hover:bg-ui-bg/60'
                    }`}
                  >
                    <td className="py-4">
                      <span className="font-serif italic font-black text-sm text-text-main group-hover:text-primary transition-colors">
                        {idx.displaySymbol}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-mono font-medium text-text-muted">
                        {idx.name}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted uppercase">
                        {idx.region}
                      </span>
                    </td>
                    <td className="py-4 font-mono font-black italic text-sm text-text-main">
                      {idx.currency}{idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-4 font-mono font-bold text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{idx.change.toFixed(2)}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 font-mono font-black px-2.5 py-1 rounded-xl text-xs ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isPositive ? '+' : ''}{idx.percentChange.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[10px] text-text-muted">
                      {idx.dayLow && idx.dayHigh ? `${idx.currency}${idx.dayLow.toFixed(0)} - ${idx.currency}${idx.dayHigh.toFixed(0)}` : '—'}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        className="px-3 py-1.5 rounded-xl bg-ui-bg group-hover:bg-primary group-hover:text-ui-bg text-text-muted text-[10px] font-mono font-bold border border-ui-border group-hover:border-primary transition-all"
                      >
                        Feature Chart
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Treemap Heatmap Navigation Callout */}
      <div className="p-6 rounded-3xl bg-ui-surface border border-ui-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h4 className="text-sm font-serif italic font-bold text-text-main">
              Visual Treemap of Index Constituents
            </h4>
            <p className="text-xs font-mono text-text-muted">
              Analyze market capitalization weighting and sector distributions in the interactive Stock Heatmap.
            </p>
          </div>
        </div>
        <button
          onClick={() => setViewMode('heatmap')}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-ui-bg font-mono font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0"
        >
          <span>Open Stock Heatmap</span>
          <span>&rarr;</span>
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default KeyIndexView;
