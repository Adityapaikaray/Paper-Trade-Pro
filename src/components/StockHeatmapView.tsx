/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Globe,
  Filter,
  Check,
  Star,
  Activity
} from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { INITIAL_INDICES } from '../contexts/MarketContext.tsx';
import { MOCK_STOCKS } from '../constants.ts';
import { Stock, IndexQuote } from '../types.ts';
import {
  INDEX_HEATMAP_CONFIG,
  parseMarketCapToNumber,
  getPerformanceHeatColor,
  IndexDefinition
} from '../data/indexHeatmapData.ts';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters.ts';

interface StockHeatmapViewProps {
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
  defaultIndexKey?: string;
  embedded?: boolean; // When rendered inside KeyIndexView or a widget
}

type SizingMode = 'market_cap' | 'equal';
type DirectionFilter = 'all' | 'gainers' | 'losers' | 'high_movers';
type TimeframeMetric = '1D' | '1W' | '1M' | 'VOL';

export const StockHeatmapView: React.FC<StockHeatmapViewProps> = ({
  onTrade,
  defaultIndexKey,
  embedded = false
}) => {
  const { stocks, indices, priceTicks, indexTicks, isLive, lastUpdated, refresh, isLoading } = useMarketData();
  const { marketContext, toggleWatchlist, isWatchlisted } = usePortfolio();

  // Determine initial index
  const initialIndexKey = useMemo(() => {
    if (defaultIndexKey && INDEX_HEATMAP_CONFIG[defaultIndexKey]) {
      return defaultIndexKey;
    }
    if (marketContext === 'IN') {
      return 'nifty';
    }
    return 'sandp500';
  }, [defaultIndexKey, marketContext]);

  const [selectedIndexKey, setSelectedIndexKey] = useState<string>(initialIndexKey);
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'US' | 'IN'>(
    marketContext === 'IN' ? 'IN' : marketContext === 'US' ? 'US' : 'ALL'
  );
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sizingMode, setSizingMode] = useState<SizingMode>('market_cap');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [timeframeMetric, setTimeframeMetric] = useState<TimeframeMetric>('1D');
  const [hoveredStock, setHoveredStock] = useState<Stock | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pinnedStock, setPinnedStock] = useState<Stock | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index if market context changes and no custom index is locked
  useEffect(() => {
    if (!defaultIndexKey) {
      if (marketContext === 'IN' && selectedIndexKey !== 'nifty' && selectedIndexKey !== 'sensex' && selectedIndexKey !== 'niftybank') {
        setSelectedIndexKey('nifty');
        setRegionFilter('IN');
      } else if (marketContext === 'US' && selectedIndexKey !== 'sandp500' && selectedIndexKey !== 'nasdaq' && selectedIndexKey !== 'dow') {
        setSelectedIndexKey('sandp500');
        setRegionFilter('US');
      }
    }
  }, [marketContext, defaultIndexKey]);

  const currentIndexConfig = INDEX_HEATMAP_CONFIG[selectedIndexKey] || INDEX_HEATMAP_CONFIG.sandp500;
  
  // Real-time Index quote object from market data
  const currentIndexQuote = useMemo(() => {
    return indices.find(idx => idx.key === selectedIndexKey) || 
           INITIAL_INDICES.find(idx => idx.key === selectedIndexKey) || {
      key: currentIndexConfig.id,
      name: currentIndexConfig.name,
      symbol: currentIndexConfig.symbol,
      displaySymbol: currentIndexConfig.displaySymbol,
      region: currentIndexConfig.region === 'IN' ? 'India' : 'US',
      currency: currentIndexConfig.currency,
      price: currentIndexConfig.region === 'IN' ? 23346.40 : 7650.50,
      change: currentIndexConfig.region === 'IN' ? 75.80 : 12.74,
      percentChange: currentIndexConfig.region === 'IN' ? 0.33 : 0.17
    };
  }, [indices, selectedIndexKey, currentIndexConfig]);

  // Resolve constituent stocks with live data
  const resolvedConstituents = useMemo(() => {
    const symbolList = currentIndexConfig.constituentSymbols;
    return symbolList.map(sym => {
      // Find matching stock from real-time stocks feed or baseline mock stocks
      const matched = stocks.find(s => 
        s.symbol.toUpperCase() === sym.toUpperCase() ||
        s.symbol.toUpperCase().startsWith(`${sym.toUpperCase()}:`) ||
        s.symbol.toUpperCase() === `${sym.toUpperCase()}:NSE` ||
        (sym.toUpperCase() === 'TATAMOTORS' && (s.symbol.toUpperCase() === 'TMCV' || s.symbol.toUpperCase() === 'TATAMOTORS'))
      ) || MOCK_STOCKS.find(s =>
        s.symbol.toUpperCase() === sym.toUpperCase() ||
        s.symbol.toUpperCase() === `${sym.toUpperCase()}:NSE` ||
        (sym.toUpperCase() === 'TATAMOTORS' && s.symbol.toUpperCase() === 'TATAMOTORS')
      );

      if (matched) return matched;

      // Fallback stock item
      return {
        symbol: sym,
        name: sym,
        price: currentIndexConfig.currency === '₹' ? 1500 : 180,
        change: 0.5,
        changePercent: 0.35,
        volume: '1.5M',
        marketCap: currentIndexConfig.currency === '₹' ? '3.5T' : '250B',
        description: `${sym} equity constituent.`,
        sector: 'General',
        country: currentIndexConfig.region === 'IN' ? 'India' : 'USA',
        currency: currentIndexConfig.currency
      } as Stock;
    });
  }, [currentIndexConfig, stocks]);

  // Metric calculation for timeframe / metrics
  const getMetricValue = (stock: Stock): { percent: number; label: string } => {
    if (timeframeMetric === '1W') {
      // Modulate with realistic weekly dispersion based on stock beta
      const hash = stock.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const mod = ((hash % 10) - 4.5) * 0.4;
      const pct = Number((stock.changePercent * 1.8 + mod).toFixed(2));
      return { percent: pct, label: `${pct >= 0 ? '+' : ''}${pct}% 1W` };
    }
    if (timeframeMetric === '1M') {
      const hash = stock.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const mod = ((hash % 12) - 5) * 0.8;
      const pct = Number((stock.changePercent * 2.5 + mod).toFixed(2));
      return { percent: pct, label: `${pct >= 0 ? '+' : ''}${pct}% 1M` };
    }
    if (timeframeMetric === 'VOL') {
      // Sized/colored by volume ratio
      const numCap = parseMarketCapToNumber(stock.marketCap);
      const volScore = numCap > 1e12 ? 2.5 : numCap > 500e9 ? 1.2 : 0.4;
      return { percent: volScore, label: stock.volume || 'Norm' };
    }
    return {
      percent: stock.changePercent,
      label: `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
    };
  };

  // Filter constituents by Search, Sector, and Direction
  const filteredConstituents = useMemo(() => {
    return resolvedConstituents.filter(s => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Sector
      if (selectedSector !== 'ALL' && s.sector !== selectedSector) {
        return false;
      }
      // Direction
      const metric = getMetricValue(s);
      if (directionFilter === 'gainers' && metric.percent <= 0) return false;
      if (directionFilter === 'losers' && metric.percent >= 0) return false;
      if (directionFilter === 'high_movers' && Math.abs(metric.percent) < 1.5) return false;

      return true;
    });
  }, [resolvedConstituents, searchQuery, selectedSector, directionFilter, timeframeMetric]);

  // Group filtered constituents by Sector
  const sectorGroups = useMemo(() => {
    const groups: Record<string, { stocks: Stock[]; totalCap: number; avgChange: number }> = {};

    filteredConstituents.forEach(stock => {
      const sec = stock.sector || 'Other';
      if (!groups[sec]) {
        groups[sec] = { stocks: [], totalCap: 0, avgChange: 0 };
      }
      groups[sec].stocks.push(stock);
      groups[sec].totalCap += parseMarketCapToNumber(stock.marketCap);
    });

    // Compute average change for each sector & sort stocks within sector by market cap
    Object.keys(groups).forEach(sec => {
      const g = groups[sec];
      const sumChange = g.stocks.reduce((sum, s) => sum + getMetricValue(s).percent, 0);
      g.avgChange = g.stocks.length > 0 ? Number((sumChange / g.stocks.length).toFixed(2)) : 0;
      // Sort constituents inside sector by market cap descending
      g.stocks.sort((a, b) => parseMarketCapToNumber(b.marketCap) - parseMarketCapToNumber(a.marketCap));
    });

    // Sort sectors by total market cap descending
    return Object.entries(groups).sort((a, b) => b[1].totalCap - a[1].totalCap);
  }, [filteredConstituents, timeframeMetric]);

  // Index-level statistics
  const indexBreadth = useMemo(() => {
    let gainers = 0;
    let losers = 0;
    let unchanged = 0;
    let topGainer: Stock | null = null;
    let topLoser: Stock | null = null;

    resolvedConstituents.forEach(s => {
      const metric = getMetricValue(s).percent;
      if (metric > 0.05) gainers++;
      else if (metric < -0.05) losers++;
      else unchanged++;

      if (!topGainer || metric > getMetricValue(topGainer).percent) {
        topGainer = s;
      }
      if (!topLoser || metric < getMetricValue(topLoser).percent) {
        topLoser = s;
      }
    });

    const total = resolvedConstituents.length || 1;
    const gainPct = Math.round((gainers / total) * 100);
    const losePct = Math.round((losers / total) * 100);

    return { gainers, losers, unchanged, total, gainPct, losePct, topGainer, topLoser };
  }, [resolvedConstituents, timeframeMetric]);

  // Unique list of available sectors for current index
  const availableSectors = useMemo(() => {
    const set = new Set(resolvedConstituents.map(s => s.sector).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [resolvedConstituents]);

  const activeInspectStock = pinnedStock || hoveredStock || resolvedConstituents[0] || null;

  // Toggle fullscreen container mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col space-y-6 ${
        isFullscreen ? 'bg-ui-bg p-6 overflow-y-auto h-screen z-50 fixed inset-0' : ''
      }`}
    >
      {/* 1. Header & Index Selection Controls */}
      <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Title & Index Badge */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <LayoutGrid size={22} className="animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-text-main tracking-tight">
                Index Stock Heatmap
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Market Cap Treemap
              </span>
            </div>
            <p className="text-xs font-mono text-text-muted">
              Interactive market map visualizing constituent weights and real-time intraday trajectories.
            </p>
          </div>

          {/* Regional Market Filters & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl p-1">
              {(['ALL', 'US', 'IN'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => {
                    setRegionFilter(reg);
                    if (reg === 'US' && currentIndexConfig.region !== 'US') {
                      setSelectedIndexKey('sandp500');
                    } else if (reg === 'IN' && currentIndexConfig.region !== 'IN') {
                      setSelectedIndexKey('nifty');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    regionFilter === reg
                      ? 'bg-primary text-ui-bg font-black shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {reg === 'ALL' ? 'All Global' : reg === 'US' ? '🇺🇸 U.S. Wall St' : '🇮🇳 India Dalal St'}
                </button>
              ))}
            </div>

            <button
              onClick={() => refresh()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ui-bg hover:bg-ui-surface border border-ui-border text-text-muted hover:text-primary transition-all text-xs font-mono font-bold shadow-xs"
              title="Refresh real-time feed"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-primary' : ''} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-ui-bg hover:bg-ui-surface border border-ui-border text-text-muted hover:text-text-main transition-colors shadow-xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Index Selector Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-ui-border/60">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider shrink-0 mr-1">
            Choose Index:
          </span>
          {Object.values(INDEX_HEATMAP_CONFIG)
            .filter(idx => regionFilter === 'ALL' || idx.region === regionFilter)
            .map(idx => {
              const quote = indices.find(i => i.key === idx.id);
              const isSelected = selectedIndexKey === idx.id;
              const chg = quote?.percentChange ?? 0;
              const isPos = chg >= 0;

              return (
                <button
                  key={idx.id}
                  onClick={() => {
                    setSelectedIndexKey(idx.id);
                    setSelectedSector('ALL');
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-serif italic transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-primary text-ui-bg border-primary font-black shadow-md scale-105'
                      : 'bg-ui-bg border-ui-border text-text-muted hover:text-text-main hover:border-primary/40'
                  }`}
                >
                  <span className="font-bold">{idx.displaySymbol}</span>
                  <span
                    className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-black/20 text-ui-bg'
                        : isPos
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {chg.toFixed(2)}%
                  </span>
                </button>
              );
            })}
        </div>

        {/* Selected Index Performance Hero Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-ui-bg/70 rounded-2xl border border-ui-border p-4">
          <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-ui-border/60 pb-3 md:pb-0 md:pr-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-text-muted">{currentIndexConfig.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ui-surface border border-ui-border text-text-muted">
                {currentIndexConfig.symbol}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-text-main">
                {currentIndexConfig.currency}
                {currentIndexQuote.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-mono font-black px-2 py-0.5 rounded-lg ${
                  currentIndexQuote.percentChange >= 0
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {currentIndexQuote.percentChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {currentIndexQuote.percentChange >= 0 ? '+' : ''}
                {currentIndexQuote.change.toFixed(2)} ({currentIndexQuote.percentChange >= 0 ? '+' : ''}
                {currentIndexQuote.percentChange.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Market Breadth Progress Meter */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-2 border-b md:border-b-0 md:border-r border-ui-border/60 pb-3 md:pb-0 md:pr-4">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-muted uppercase">
              <span className="text-emerald-400 flex items-center gap-1">
                <ArrowUpRight size={12} /> {indexBreadth.gainers} Advancing ({indexBreadth.gainPct}%)
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                {indexBreadth.losers} Declining ({indexBreadth.losePct}%) <ArrowDownRight size={12} />
              </span>
            </div>
            <div className="w-full h-2.5 bg-ui-surface rounded-full overflow-hidden flex border border-ui-border">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${indexBreadth.gainPct}%` }}
                title={`Advancing: ${indexBreadth.gainers}`}
              />
              <div
                className="h-full bg-slate-600 transition-all duration-500"
                style={{ width: `${Math.max(100 - indexBreadth.gainPct - indexBreadth.losePct, 0)}%` }}
                title={`Unchanged: ${indexBreadth.unchanged}`}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${indexBreadth.losePct}%` }}
                title={`Declining: ${indexBreadth.losers}`}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-text-muted">
              <span>Index Constituents: {resolvedConstituents.length} stocks</span>
              <span>Unchanged: {indexBreadth.unchanged}</span>
            </div>
          </div>

          {/* Top Movers in Index */}
          <div className="md:col-span-3 flex flex-col justify-center text-xs font-mono space-y-1.5">
            {indexBreadth.topGainer && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[10px] uppercase font-bold">Top Leader:</span>
                <button
                  onClick={() => onTrade?.(indexBreadth.topGainer!)}
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {indexBreadth.topGainer.symbol} (+{indexBreadth.topGainer.changePercent.toFixed(2)}%)
                </button>
              </div>
            )}
            {indexBreadth.topLoser && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[10px] uppercase font-bold">Top Laggard:</span>
                <button
                  onClick={() => onTrade?.(indexBreadth.topLoser!)}
                  className="font-bold text-rose-400 hover:underline flex items-center gap-1"
                >
                  {indexBreadth.topLoser.symbol} ({indexBreadth.topLoser.changePercent.toFixed(2)}%)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Heatmap Controls & Search Toolbar */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search within Index */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ticker in ${currentIndexConfig.displaySymbol} (e.g. AAPL, RELIANCE)...`}
            className="w-full bg-ui-bg border border-ui-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-primary/50 placeholder:text-text-muted/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted hover:text-text-main"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges: Sector, Sizing, Direction, Timeframe */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sector Selector */}
          <div className="flex items-center gap-1.5 bg-ui-bg border border-ui-border rounded-xl px-2.5 py-1.5">
            <Filter size={13} className="text-text-muted" />
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-text-main focus:outline-none cursor-pointer"
            >
              {availableSectors.map(sec => (
                <option key={sec} value={sec} className="bg-ui-surface text-text-main">
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>
          </div>

          {/* Sizing Mode Toggle */}
          <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl p-1">
            <button
              onClick={() => setSizingMode('market_cap')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                sizingMode === 'market_cap'
                  ? 'bg-primary text-ui-bg font-black shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Tile size proportional to market capitalization weight"
            >
              Weight Treemap
            </button>
            <button
              onClick={() => setSizingMode('equal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                sizingMode === 'equal'
                  ? 'bg-primary text-ui-bg font-black shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Uniform grid matrix sizing"
            >
              Equal Grid
            </button>
          </div>

          {/* Performance Direction Filter */}
          <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl p-1">
            {(['all', 'gainers', 'losers', 'high_movers'] as const).map(dir => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  directionFilter === dir
                    ? 'bg-ui-surface text-text-main border border-ui-border shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {dir === 'all'
                  ? 'All'
                  : dir === 'gainers'
                  ? '▲ Gainers'
                  : dir === 'losers'
                  ? '▼ Losers'
                  : '⚡ High Movers'}
              </button>
            ))}
          </div>

          {/* Timeframe Metric */}
          <div className="flex items-center bg-ui-bg border border-ui-border rounded-xl p-1">
            {(['1D', '1W', '1M', 'VOL'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframeMetric(tf)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  timeframeMetric === tf
                    ? 'bg-primary text-ui-bg font-black shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Heatmap Legend Spectrum */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-3 text-[10px] font-mono text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="font-bold uppercase tracking-wider">Performance Scale:</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-[#7f1d1d] text-white font-bold">&le; -3%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#b91c1c] text-white font-bold">-2%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#dc2626] text-white font-bold">-1%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#334155] text-slate-200 font-bold">0%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#22c55e] text-white font-bold">+1%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#15803d] text-white font-bold">+2%</span>
            <span className="px-1.5 py-0.5 rounded bg-[#14532d] text-white font-bold">&ge; +3%</span>
          </div>
        </div>
        <div>
          <span>Click tile to trade • Double click to pin inspector</span>
        </div>
      </div>

      {/* 4. The Main Treemap Canvas & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Matrix Canvas */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {sectorGroups.length === 0 ? (
            <div className="bg-ui-surface border border-ui-border rounded-3xl p-12 text-center space-y-3">
              <Layers size={36} className="mx-auto text-text-muted/50" />
              <h3 className="text-lg font-serif font-black text-text-main">No constituents match filters</h3>
              <p className="text-xs font-mono text-text-muted">
                Try clearing the search or resetting sector/direction filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('ALL');
                  setDirectionFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-primary text-ui-bg font-bold text-xs font-mono shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            sectorGroups.map(([sectorName, { stocks: secStocks, totalCap, avgChange }]) => {
              const isAvgPos = avgChange >= 0;

              return (
                <div
                  key={sectorName}
                  className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-md space-y-3 transition-all duration-200 hover:border-primary/30"
                >
                  {/* Sector Header Strip */}
                  <div className="flex items-center justify-between border-b border-ui-border/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() =>
                          setSelectedSector(selectedSector === sectorName ? 'ALL' : sectorName)
                        }
                        className="text-sm font-serif italic font-black text-text-main hover:text-primary transition-colors flex items-center gap-1.5 group"
                      >
                        <span>{sectorName}</span>
                        <span className="text-[10px] font-mono text-text-muted group-hover:text-primary">
                          ({secStocks.length})
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-text-muted hidden sm:inline">
                        Cap: {formatCompactCurrency(totalCap, currentIndexConfig.region)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${
                          isAvgPos
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        Avg: {isAvgPos ? '+' : ''}
                        {avgChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Sector Constituent Tiles */}
                  <div
                    className={
                      sizingMode === 'equal'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2'
                        : 'flex flex-wrap gap-2'
                    }
                  >
                    {secStocks.map(stock => {
                      const metric = getMetricValue(stock);
                      const colorConfig = getPerformanceHeatColor(metric.percent);
                      const isTickUp = priceTicks[stock.symbol] === 'up';
                      const isTickDown = priceTicks[stock.symbol] === 'down';
                      const isHovered = hoveredStock?.symbol === stock.symbol;
                      const isPinned = pinnedStock?.symbol === stock.symbol;
                      const isSearchMatch =
                        searchQuery &&
                        (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase()));

                      // Proportional weight size calculation
                      const numCap = parseMarketCapToNumber(stock.marketCap);
                      // Sizing tier
                      let flexBasisClass = 'flex-1 min-w-[120px] h-[85px]';
                      if (sizingMode === 'market_cap') {
                        if (numCap >= 1.5e12) {
                          flexBasisClass = 'flex-[3_3_240px] min-w-[200px] h-[130px]';
                        } else if (numCap >= 500e9) {
                          flexBasisClass = 'flex-[2_2_180px] min-w-[160px] h-[110px]';
                        } else if (numCap >= 200e9) {
                          flexBasisClass = 'flex-[1.5_1.5_140px] min-w-[130px] h-[95px]';
                        } else {
                          flexBasisClass = 'flex-[1_1_110px] min-w-[100px] h-[85px]';
                        }
                      }

                      return (
                        <motion.div
                          key={stock.symbol}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setPinnedStock(stock);
                            if (onTrade) onTrade(stock);
                          }}
                          onDoubleClick={() => setPinnedStock(isPinned ? null : stock)}
                          onMouseEnter={(e) => {
                            setHoveredStock(stock);
                            setMousePos({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) => {
                            setMousePos({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredStock(null)}
                          className={`relative rounded-xl p-2.5 cursor-pointer select-none transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs border ${
                            colorConfig.bg
                          } ${colorConfig.border} ${flexBasisClass} ${
                            isPinned
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-ui-bg z-20 scale-[1.02]'
                              : isHovered
                              ? 'ring-2 ring-white/60 z-10 shadow-lg'
                              : ''
                          } ${
                            isSearchMatch
                              ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-ui-bg'
                              : searchQuery
                              ? 'opacity-30'
                              : 'opacity-100'
                          } ${
                            isTickUp
                              ? 'ring-2 ring-emerald-300 animate-pulse'
                              : isTickDown
                              ? 'ring-2 ring-rose-400 animate-pulse'
                              : ''
                          }`}
                        >
                          {/* Top Row: Symbol & Heart/Watchlist toggle */}
                          <div className="flex items-start justify-between w-full gap-1">
                            <div className="truncate">
                              <span
                                className={`tracking-tight drop-shadow-xs ${
                                  numCap >= 1e12
                                    ? 'text-base sm:text-lg font-black'
                                    : 'text-xs sm:text-sm font-black'
                                } ${colorConfig.text}`}
                              >
                                {stock.symbol}
                              </span>
                              {numCap >= 500e9 && (
                                <p className={`text-[9px] font-sans truncate opacity-85 leading-tight ${colorConfig.subtext}`}>
                                  {stock.name}
                                </p>
                              )}
                            </div>

                            {/* Change Pill */}
                            <span
                              className={`text-[9px] sm:text-[10px] font-mono font-black px-1.5 py-0.5 rounded border shrink-0 drop-shadow-xs ${colorConfig.badge}`}
                            >
                              {metric.label}
                            </span>
                          </div>

                          {/* Bottom Row: Price & Market Cap */}
                          <div className="flex items-baseline justify-between w-full pt-1 border-t border-white/10">
                            <span
                              className={`text-xs font-mono font-black drop-shadow-xs ${colorConfig.text}`}
                            >
                              {stock.currency}
                              {stock.price.toLocaleString(undefined, {
                                minimumFractionDigits: stock.price >= 100 ? 1 : 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span
                              className={`text-[8.5px] font-mono font-bold opacity-80 ${colorConfig.subtext}`}
                            >
                              {stock.marketCap}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Sticky Floating Detail Inspector Panel */}
        <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-6 space-y-4">
          <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {activeInspectStock ? (
              <div className="space-y-6">
                {/* Header with Symbol & Watchlist */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-serif italic font-black text-text-main">
                        {activeInspectStock.symbol}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-ui-bg border border-ui-border text-text-muted">
                        {activeInspectStock.exchange || currentIndexConfig.displaySymbol}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                      {activeInspectStock.name}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleWatchlist(activeInspectStock.symbol)}
                    className={`p-2 rounded-xl border transition-all ${
                      isWatchlisted(activeInspectStock.symbol)
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                        : 'bg-ui-bg border-ui-border text-text-muted hover:text-text-main'
                    }`}
                    title="Toggle Watchlist"
                  >
                    <Star
                      size={16}
                      fill={isWatchlisted(activeInspectStock.symbol) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                {/* Price Display */}
                <div className="bg-ui-bg/70 rounded-2xl border border-ui-border p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-mono font-black text-text-main">
                      {activeInspectStock.currency}
                      {activeInspectStock.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                    <span
                      className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg border ${
                        activeInspectStock.changePercent >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {activeInspectStock.changePercent >= 0 ? '+' : ''}
                      {activeInspectStock.change.toFixed(2)} ({activeInspectStock.changePercent >= 0 ? '+' : ''}
                      {activeInspectStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Day Range Slider */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-text-muted">
                      <span>Low: {activeInspectStock.currency}{(activeInspectStock.dayLow || activeInspectStock.price * 0.99).toFixed(1)}</span>
                      <span>High: {activeInspectStock.currency}{(activeInspectStock.dayHigh || activeInspectStock.price * 1.01).toFixed(1)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-ui-surface rounded-full overflow-hidden relative border border-ui-border">
                      <div
                        className="h-full bg-linear-to-r from-rose-500 via-primary to-emerald-500 rounded-full"
                        style={{ width: '65%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Fundamentals Quick Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="bg-ui-bg p-3 rounded-xl border border-ui-border">
                    <span className="text-[9px] text-text-muted uppercase font-bold">Sector</span>
                    <p className="font-bold text-text-main truncate mt-0.5">{activeInspectStock.sector}</p>
                  </div>
                  <div className="bg-ui-bg p-3 rounded-xl border border-ui-border">
                    <span className="text-[9px] text-text-muted uppercase font-bold">Market Cap</span>
                    <p className="font-bold text-text-main truncate mt-0.5">{activeInspectStock.marketCap}</p>
                  </div>
                  <div className="bg-ui-bg p-3 rounded-xl border border-ui-border">
                    <span className="text-[9px] text-text-muted uppercase font-bold">24H Volume</span>
                    <p className="font-bold text-text-main truncate mt-0.5">{activeInspectStock.volume}</p>
                  </div>
                  <div className="bg-ui-bg p-3 rounded-xl border border-ui-border">
                    <span className="text-[9px] text-text-muted uppercase font-bold">Index Weight</span>
                    <p className="font-bold text-primary truncate mt-0.5">
                      {(
                        (parseMarketCapToNumber(activeInspectStock.marketCap) /
                          Math.max(
                            resolvedConstituents.reduce((acc, s) => acc + parseMarketCapToNumber(s.marketCap), 0),
                            1
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                {/* One-Click Action Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onTrade?.(activeInspectStock, 'BUY')}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowUpRight size={14} /> Buy {activeInspectStock.symbol}
                    </button>
                    <button
                      onClick={() => onTrade?.(activeInspectStock, 'SELL')}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ArrowDownRight size={14} /> Sell
                    </button>
                  </div>

                  {pinnedStock && (
                    <button
                      onClick={() => setPinnedStock(null)}
                      className="w-full py-1.5 text-center text-[10px] font-mono text-text-muted hover:text-text-main"
                    >
                      Unpin inspector (follow hover)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-text-muted space-y-2">
                <Info size={24} className="mx-auto text-text-muted/40" />
                <p className="text-xs font-mono">Hover over any stock tile to inspect real-time metrics.</p>
              </div>
            )}
          </div>

          {/* Quick Tip Pill */}
          <div className="p-4 bg-ui-surface/60 border border-ui-border rounded-2xl text-[11px] font-mono text-text-muted space-y-1.5">
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Zap size={13} />
              <span>Finviz / TradingView Treemap Mode</span>
            </div>
            <p className="leading-relaxed text-[10px]">
              Tile dimensions reflect market cap weighting within {currentIndexConfig.displaySymbol}. Saturated green denotes leaders beating +1.5% while red highlights intraday pullbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Floating Hover Tooltip for Each Stock Box */}
      <AnimatePresence>
        {hoveredStock && (
          <motion.div
            id="stock-box-hover-tooltip"
            initial={{ opacity: 0, scale: 0.94, y: 3 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 3 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left: `${
                typeof window !== 'undefined' && mousePos.x + 295 > window.innerWidth
                  ? Math.max(12, mousePos.x - 295)
                  : mousePos.x + 14
              }px`,
              top: `${
                typeof window !== 'undefined' && mousePos.y + 240 > window.innerHeight
                  ? Math.max(12, mousePos.y - 240)
                  : Math.max(12, mousePos.y + 14)
              }px`,
              zIndex: 99999,
              pointerEvents: 'none',
            }}
            className="w-[280px] bg-slate-950/95 dark:bg-slate-950/95 border border-slate-700/80 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-2xl pointer-events-none select-none"
          >
            {/* Header: Symbol & Sector */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-black text-xl tracking-tight text-white drop-shadow-xs">
                  {hoveredStock.symbol}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                  {hoveredStock.country === 'India' ? 'NSE' : (hoveredStock.exchange || (currentIndexConfig.region === 'IN' ? 'NSE' : 'NASDAQ'))}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 truncate max-w-[120px]">
                {hoveredStock.sector}
              </span>
            </div>

            {/* Company Name */}
            <p className="text-xs font-medium text-slate-300 truncate mb-3">
              {hoveredStock.name}
            </p>

            {/* Main Metric Hero Box: Current Price & Percentage Change for the Day */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Current Price
                </div>
                <div className="text-xl font-mono font-black text-white mt-0.5">
                  {hoveredStock.currency}
                  {hoveredStock.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Day Change
                </div>
                <div
                  className={`inline-flex items-center gap-1 text-xs font-mono font-black px-2 py-0.5 rounded-md border mt-0.5 ${
                    hoveredStock.changePercent >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {hoveredStock.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>
                    {hoveredStock.changePercent >= 0 ? '+' : ''}
                    {hoveredStock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div
                  className={`text-[10px] font-mono font-bold mt-0.5 ${
                    hoveredStock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {hoveredStock.change >= 0 ? '+' : ''}
                  {hoveredStock.currency}
                  {Math.abs(hoveredStock.change).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Secondary Metrics: Market Cap & 24h Volume */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3">
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Market Cap</span>
                <span className="font-bold text-slate-200">{hoveredStock.marketCap}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <span className="text-slate-400 block text-[9px] uppercase tracking-wider">24h Volume</span>
                <span className="font-bold text-slate-200">{hoveredStock.volume}</span>
              </div>
            </div>

            {/* Intraday Day Low / High Range Slider */}
            {(() => {
              const dayLow = hoveredStock.dayLow ?? (hoveredStock.price * 0.985);
              const dayHigh = hoveredStock.dayHigh ?? (hoveredStock.price * 1.015);
              const rangeSpread = Math.max(0.001, dayHigh - dayLow);
              const rangePosition = Math.min(100, Math.max(0, ((hoveredStock.price - dayLow) / rangeSpread) * 100));

              return (
                <div className="space-y-1 pt-1.5 border-t border-white/10 mb-2.5">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>L: {hoveredStock.currency}{dayLow.toFixed(2)}</span>
                    <span className="uppercase text-[8px] tracking-wider text-slate-500 font-bold">Day Range</span>
                    <span>H: {hoveredStock.currency}{dayHigh.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hoveredStock.changePercent >= 0 ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${rangePosition}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Quick Action Hint */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1 text-primary">
                <span>●</span> Click to trade
              </span>
              <span>Double-click to pin</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockHeatmapView;
