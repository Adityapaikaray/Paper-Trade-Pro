/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Search,
  ChevronDown,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Filter,
  Check,
  Star,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  BarChart2,
  SlidersHorizontal,
  X,
  PieChart,
  Eye,
  Calendar,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { Stock } from '../types.ts';
import {
  INDEX_HEATMAP_CONFIG,
  INDIA_INDEX_KEYS,
  US_INDEX_KEYS,
  IndexDefinition,
  IndexConstituent,
  getPerformanceHeatColor,
  calculateTimeframeReturn,
  parseMarketCapToNumber,
  parseVolumeToNumber
} from '../data/indexHeatmapData.ts';
import {
  getMarketSessionDetail,
  MarketSessionDetail,
  MarketSessionMode
} from '../utils/marketHours.ts';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters.ts';
import { PositionDetailsModal } from './PositionDetailsModal.tsx';
import { analyticsService } from '../services/analytics.ts';

interface StockHeatmapViewProps {
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
  defaultIndexKey?: string;
  embedded?: boolean;
}

type SizingMode = 'weight' | 'market_cap' | 'volume';
type DirectionFilter = 'all' | 'gainers' | 'losers' | 'high_movers';
type TimeframeMetric = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
type HeatmapMode = 'stocks' | 'sectors';

const RECENT_INDEX_KEY = 'tradepro_recent_heatmap_index';
const FAVORITE_INDICES_KEY = 'tradepro_favorite_indices';

export const StockHeatmapView: React.FC<StockHeatmapViewProps> = ({
  onTrade,
  defaultIndexKey,
  embedded = false
}) => {
  const { stocks, indices, isLive, lastUpdated, refresh, isLoading, marketStatus } = useMarketData();
  const { marketContext, setMarketContext, toggleWatchlist, isWatchlisted } = usePortfolio();

  // Favorite indices stored in local preferences
  const [favoriteIndices, setFavoriteIndices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_INDICES_KEY);
      return saved ? JSON.parse(saved) : ['nifty', 'sandp500', 'niftybank', 'nasdaq'];
    } catch {
      return ['nifty', 'sandp500', 'niftybank', 'nasdaq'];
    }
  });

  const toggleFavorite = (indexId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIndices(prev => {
      const next = prev.includes(indexId) ? prev.filter(k => k !== indexId) : [...prev, indexId];
      try {
        localStorage.setItem(FAVORITE_INDICES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Determine initial index selection
  const initialIndexKey = useMemo(() => {
    if (defaultIndexKey && INDEX_HEATMAP_CONFIG[defaultIndexKey]) {
      return defaultIndexKey;
    }
    try {
      const saved = sessionStorage.getItem(RECENT_INDEX_KEY);
      if (saved && INDEX_HEATMAP_CONFIG[saved]) {
        // Only restore if compatible with market context or if all
        const config = INDEX_HEATMAP_CONFIG[saved];
        if (marketContext === 'IN' && config.region === 'IN') return saved;
        if (marketContext === 'US' && config.region === 'US') return saved;
      }
    } catch {}

    return marketContext === 'IN' ? 'nifty' : 'sandp500';
  }, [defaultIndexKey, marketContext]);

  const [selectedIndexKey, setSelectedIndexKey] = useState<string>(initialIndexKey);
  const [activeMarketRegion, setActiveMarketRegion] = useState<'IN' | 'US' | 'ALL'>(
    marketContext === 'IN' ? 'IN' : marketContext === 'US' ? 'US' : 'IN'
  );

  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('stocks');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sizingMode, setSizingMode] = useState<SizingMode>('weight');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [timeframeMetric, setTimeframeMetric] = useState<TimeframeMetric>('1D');
  const [hoveredStock, setHoveredStock] = useState<IndexConstituent | null>(null);
  const [inspectedConstituent, setInspectedConstituent] = useState<IndexConstituent | null>(null);
  const [detailModalStock, setDetailModalStock] = useState<Stock | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Market session state & live exchange clock
  const [clockNow, setClockNow] = useState<Date>(new Date());
  const [sessionOverride, setSessionOverride] = useState<MarketSessionMode | null>(null);
  const [isSessionPopoverOpen, setIsSessionPopoverOpen] = useState<boolean>(false);
  const sessionPopoverRef = useRef<HTMLDivElement>(null);

  // Live exchange clock ticker (updates every second for accurate schedule changes)
  useEffect(() => {
    analyticsService.trackHeatmapEvent('heatmap_view');
    const timer = setInterval(() => {
      setClockNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    analyticsService.trackHeatmapEvent('heatmap_index_change', { index: selectedIndexKey });
  }, [selectedIndexKey]);

  useEffect(() => {
    analyticsService.trackHeatmapEvent('heatmap_timeframe_change', { timeframe: timeframeMetric });
  }, [timeframeMetric]);

  useEffect(() => {
    analyticsService.trackHeatmapEvent('heatmap_filter', { filter: directionFilter });
  }, [directionFilter]);

  // Close session popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionPopoverRef.current && !sessionPopoverRef.current.contains(event.target as Node)) {
        setIsSessionPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close "MORE" popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync market context when activeMarketRegion changes
  const handleMarketRegionChange = (region: 'IN' | 'US' | 'ALL') => {
    setActiveMarketRegion(region);
    if (region === 'IN') {
      if (marketContext !== 'IN') setMarketContext('IN');
      if (INDEX_HEATMAP_CONFIG[selectedIndexKey]?.region !== 'IN') {
        const target = favoriteIndices.find(k => INDEX_HEATMAP_CONFIG[k]?.region === 'IN') || 'nifty';
        setSelectedIndexKey(target);
      }
    } else if (region === 'US') {
      if (marketContext !== 'US') setMarketContext('US');
      if (INDEX_HEATMAP_CONFIG[selectedIndexKey]?.region !== 'US') {
        const target = favoriteIndices.find(k => INDEX_HEATMAP_CONFIG[k]?.region === 'US') || 'sandp500';
        setSelectedIndexKey(target);
      }
    }
  };

  // Sync index if external market context changes
  useEffect(() => {
    if (!defaultIndexKey) {
      if (marketContext === 'IN' && INDEX_HEATMAP_CONFIG[selectedIndexKey]?.region !== 'IN') {
        setSelectedIndexKey('nifty');
        setActiveMarketRegion('IN');
      } else if (marketContext === 'US' && INDEX_HEATMAP_CONFIG[selectedIndexKey]?.region !== 'US') {
        setSelectedIndexKey('sandp500');
        setActiveMarketRegion('US');
      }
    }
  }, [marketContext, defaultIndexKey]);

  // Persist recent index
  useEffect(() => {
    try {
      sessionStorage.setItem(RECENT_INDEX_KEY, selectedIndexKey);
    } catch {}
  }, [selectedIndexKey]);

  const currentIndexConfig = INDEX_HEATMAP_CONFIG[selectedIndexKey] || INDEX_HEATMAP_CONFIG.nifty;

  // Resolve live constituent list with live data feed
  const liveConstituents = useMemo(() => {
    return currentIndexConfig.constituents.map(base => {
      const liveMatch = stocks.find(s =>
        s.symbol.toUpperCase() === base.symbol.toUpperCase() ||
        s.symbol.toUpperCase() === `${base.symbol.toUpperCase()}:NSE` ||
        (base.symbol.toUpperCase() === 'TATAMOTORS' && (s.symbol.toUpperCase() === 'TMCV' || s.symbol.toUpperCase() === 'TATAMOTORS'))
      );

      if (!liveMatch) {
        return {
          ...base,
          displayReturn: calculateTimeframeReturn(base, timeframeMetric)
        };
      }

      // Merge real-time quotes from market context
      const updated: IndexConstituent = {
        ...base,
        price: liveMatch.price ?? base.price,
        change: liveMatch.change ?? base.change,
        changePercent: liveMatch.changePercent ?? base.changePercent,
        volume: liveMatch.volume ?? base.volume,
        dayHigh: liveMatch.dayHigh ?? base.dayHigh,
        dayLow: liveMatch.dayLow ?? base.dayLow,
        prevClose: liveMatch.prevClose ?? base.prevClose,
        marketCap: liveMatch.marketCap ?? base.marketCap,
        sector: liveMatch.sector || base.sector
      };

      return {
        ...updated,
        displayReturn: calculateTimeframeReturn(updated, timeframeMetric)
      };
    });
  }, [currentIndexConfig, stocks, timeframeMetric]);

  // Set default inspected constituent when index changes or initialized
  useEffect(() => {
    if (liveConstituents.length > 0) {
      setInspectedConstituent(liveConstituents[0]);
    }
  }, [selectedIndexKey]);

  // Dynamic Index Summary Metrics
  const indexSummary = useMemo(() => {
    // Find index in market quotes if available
    const matchedQuote = indices.find(idx => idx.key === selectedIndexKey);

    let advancing = 0;
    let declining = 0;
    let unchanged = 0;
    let topGainer: IndexConstituent | null = null;
    let topLoser: IndexConstituent | null = null;

    liveConstituents.forEach(stock => {
      const ret = stock.displayReturn ?? stock.changePercent;
      if (ret > 0.001) advancing++;
      else if (ret < -0.001) declining++;
      else unchanged++;

      const gainerRet = topGainer ? (topGainer.displayReturn ?? topGainer.changePercent) : -Infinity;
      if (!topGainer || ret > gainerRet) {
        topGainer = stock;
      }
      const loserRet = topLoser ? (topLoser.displayReturn ?? topLoser.changePercent) : Infinity;
      if (!topLoser || ret < loserRet) {
        topLoser = stock;
      }
    });

    const currentValue = matchedQuote ? matchedQuote.price : currentIndexConfig.baselinePrice;
    const absChange = matchedQuote ? matchedQuote.change : currentIndexConfig.baselineChange;
    const pctChange = matchedQuote ? matchedQuote.percentChange : currentIndexConfig.baselinePercent;
    const prevClose = currentIndexConfig.prevClose || (currentValue - absChange);

    return {
      name: currentIndexConfig.name,
      displaySymbol: currentIndexConfig.displaySymbol,
      currentValue,
      absChange,
      pctChange,
      prevClose,
      advancing,
      declining,
      unchanged,
      topGainer,
      topLoser,
      region: currentIndexConfig.region,
      currency: currentIndexConfig.currency
    };
  }, [liveConstituents, indices, selectedIndexKey, currentIndexConfig]);

  // Filtered constituents based on search, sector, and direction
  const filteredConstituents = useMemo(() => {
    return liveConstituents.filter(item => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.symbol.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Sector filter
      if (selectedSector !== 'ALL' && item.sector !== selectedSector) {
        return false;
      }

      // Direction filter
      const ret = item.displayReturn;
      if (directionFilter === 'gainers' && ret <= 0) return false;
      if (directionFilter === 'losers' && ret >= 0) return false;
      if (directionFilter === 'high_movers' && Math.abs(ret) < 1.5) return false;

      return true;
    });
  }, [liveConstituents, searchQuery, selectedSector, directionFilter]);

  // Sector groups & Sector Heatmap calculations
  const sectorGroups = useMemo(() => {
    const map: Record<
      string,
      {
        stocks: (IndexConstituent & { displayReturn: number })[];
        totalWeight: number;
        totalCap: number;
        weightedReturnSum: number;
        avgReturn: number;
      }
    > = {};

    filteredConstituents.forEach(stock => {
      const sec = stock.sector || 'Other';
      if (!map[sec]) {
        map[sec] = {
          stocks: [],
          totalWeight: 0,
          totalCap: 0,
          weightedReturnSum: 0,
          avgReturn: 0
        };
      }
      map[sec].stocks.push(stock);
      map[sec].totalWeight += stock.weight;
      map[sec].totalCap += parseMarketCapToNumber(stock.marketCap);
      map[sec].weightedReturnSum += stock.displayReturn * stock.weight;
    });

    // Compute averages and sort
    Object.keys(map).forEach(sec => {
      const g = map[sec];
      g.avgReturn =
        g.totalWeight > 0
          ? Number((g.weightedReturnSum / g.totalWeight).toFixed(2))
          : Number((g.stocks.reduce((acc, s) => acc + s.displayReturn, 0) / g.stocks.length).toFixed(2));

      // Sort constituents inside sector by selected sizing method
      g.stocks.sort((a, b) => {
        if (sizingMode === 'weight') return b.weight - a.weight;
        if (sizingMode === 'volume') return parseVolumeToNumber(b.volume) - parseVolumeToNumber(a.volume);
        return parseMarketCapToNumber(b.marketCap) - parseMarketCapToNumber(a.marketCap);
      });
    });

    // Sort sectors by total weight descending
    return Object.entries(map).sort((a, b) => b[1].totalWeight - a[1].totalWeight);
  }, [filteredConstituents, sizingMode]);

  // Dynamic available sectors for the selected index
  const availableSectors = useMemo(() => {
    const set = new Set(liveConstituents.map(s => s.sector).filter(Boolean));
    return ['ALL', ...Array.from(set).sort()];
  }, [liveConstituents]);

  // Convert constituent to standard Stock object for Trading & Modal
  const constituentToStock = (item: IndexConstituent): Stock => {
    return {
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.changePercent,
      volume: item.volume,
      marketCap: item.marketCap,
      description: `${item.name} (${item.symbol}) constituent of ${currentIndexConfig.name}.`,
      sector: item.sector,
      country: currentIndexConfig.region === 'IN' ? 'India' : 'USA',
      currency: currentIndexConfig.currency,
      dayHigh: item.dayHigh,
      dayLow: item.dayLow,
      prevClose: item.prevClose
    };
  };

  // Click & Double click handlers
  const handleTileSingleClick = (item: IndexConstituent) => {
    setInspectedConstituent(item);
  };

  const handleTileDoubleClick = (item: IndexConstituent) => {
    setInspectedConstituent(item);
    setDetailModalStock(constituentToStock(item));
  };

  // Quick comparison row indices
  const quickIndicesList = useMemo(() => {
    if (activeMarketRegion === 'IN') {
      return INDIA_INDEX_KEYS.slice(0, 4).map(k => INDEX_HEATMAP_CONFIG[k]);
    }
    if (activeMarketRegion === 'US') {
      return US_INDEX_KEYS.map(k => INDEX_HEATMAP_CONFIG[k]);
    }
    return [
      INDEX_HEATMAP_CONFIG.nifty,
      INDEX_HEATMAP_CONFIG.sensex,
      INDEX_HEATMAP_CONFIG.sandp500,
      INDEX_HEATMAP_CONFIG.nasdaq
    ];
  }, [activeMarketRegion]);

  // Available primary tabs and "MORE" indices for India
  const indiaPrimaryKeys = INDIA_INDEX_KEYS.slice(0, 8);
  const indiaMoreKeys = INDIA_INDEX_KEYS.slice(8);

  const activeInspect = inspectedConstituent || liveConstituents[0] || null;
  const isInspectedWatchlisted = activeInspect ? isWatchlisted(activeInspect.symbol) : false;

  // Dynamic Market Session calculation based on the selected index's region (India or U.S.)
  const sessionDetail: MarketSessionDetail = useMemo(() => {
    return getMarketSessionDetail(
      currentIndexConfig.region,
      clockNow,
      sessionOverride
    );
  }, [currentIndexConfig.region, clockNow, sessionOverride]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col space-y-5 transition-colors duration-200 ${
        isFullscreen ? 'bg-ui-bg p-4 sm:p-6 overflow-y-auto h-screen z-50 fixed inset-0' : ''
      }`}
    >
      {/* 1. Header with Dynamic Title & Region Switcher */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227]/15 dark:bg-[#D4AF37]/20 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] dark:text-[#D4AF37]">
              <LayoutGrid size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic font-black text-text-main tracking-tight uppercase">
              {currentIndexConfig.displaySymbol} STOCK HEATMAP
            </h1>

            {/* Dynamic Market Session Indicator (LIVE, DELAYED, CLOSED) */}
            <div className="relative" ref={sessionPopoverRef}>
              <button
                type="button"
                onClick={() => setIsSessionPopoverOpen(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide border transition-all cursor-pointer select-none group shadow-xs ${
                  sessionDetail.mode === 'LIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : sessionDetail.mode === 'DELAYED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/20'
                }`}
                title="Click for official market trading schedule & session details"
              >
                {/* Visual Status Dot */}
                <span className="relative flex h-2 w-2">
                  {sessionDetail.mode === 'LIVE' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  {sessionDetail.mode === 'DELAYED' && (
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      sessionDetail.mode === 'LIVE'
                        ? 'bg-emerald-500'
                        : sessionDetail.mode === 'DELAYED'
                        ? 'bg-amber-500'
                        : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </span>

                <span className="font-black tracking-wider">{sessionDetail.mode}</span>

                {/* Sub-label showing Exchange & Local Time */}
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] opacity-80 border-l border-current/25 pl-1.5 font-medium">
                  <span>{sessionDetail.region === 'US' ? 'NYSE' : 'NSE'}</span>
                  <span>•</span>
                  <span>{sessionDetail.localTimeStr}</span>
                </span>

                <ChevronDown
                  size={11}
                  className={`opacity-60 transition-transform duration-200 group-hover:opacity-100 ${
                    isSessionPopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Interactive Trading Schedule Popover */}
              <AnimatePresence>
                {isSessionPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-ui-surface border border-ui-border shadow-2xl p-4 sm:p-5 z-50 text-text-main"
                  >
                    {/* Popover Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-ui-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {sessionDetail.region === 'IN' ? '🇮🇳' : '🇺🇸'}
                          </span>
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                            {sessionDetail.exchangeName}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-text-main mt-0.5">
                          {sessionDetail.region === 'IN' ? 'India Trading Schedule' : 'U.S. Trading Schedule'}
                        </h4>
                      </div>

                      {/* State Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border ${
                          sessionDetail.mode === 'LIVE'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : sessionDetail.mode === 'DELAYED'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {sessionDetail.mode}
                      </span>
                    </div>

                    {/* Active Exchange Clock & Phase */}
                    <div className="my-3 p-3 rounded-xl bg-ui-bg border border-ui-border/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-mono flex items-center gap-1.5">
                          <Clock size={13} className="text-[#C9A227]" />
                          <span>Local Exchange Time:</span>
                        </span>
                        <span className="font-mono font-bold text-text-main">
                          {sessionDetail.localTimeStr}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted font-mono">Current Session:</span>
                        <span className="font-bold text-text-main text-right">
                          {sessionDetail.sessionName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-ui-border/50">
                        <span className="text-text-muted font-mono">Next Event:</span>
                        <span className="font-mono text-xs font-semibold text-[#C9A227] dark:text-[#D4AF37]">
                          {sessionDetail.nextEvent}
                        </span>
                      </div>
                    </div>

                    {/* Official Schedule Timeline */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                        Official {sessionDetail.region === 'IN' ? 'NSE/BSE (IST)' : 'NYSE/NASDAQ (ET)'} Hours
                      </p>

                      <div className="space-y-1 text-xs font-mono">
                        {sessionDetail.region === 'IN' ? (
                          <>
                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'pre_market'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>09:00 – 09:15 IST</span>
                              </span>
                              <span className="text-[11px]">Pre-Market Auction [DELAYED]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'regular'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>09:15 – 15:30 IST</span>
                              </span>
                              <span className="text-[11px]">Regular Market [LIVE]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'post_market'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>15:30 – 16:00 IST</span>
                              </span>
                              <span className="text-[11px]">Closing Session [DELAYED]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'closed'
                                ? 'bg-slate-500/10 border-slate-500/40 text-slate-600 dark:text-slate-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>16:00 – 09:00 IST</span>
                              </span>
                              <span className="text-[11px]">Overnight & Weekends [CLOSED]</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'pre_market'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>04:00 – 09:30 ET</span>
                              </span>
                              <span className="text-[11px]">Pre-Market Extended [DELAYED]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'regular'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>09:30 – 16:00 ET</span>
                              </span>
                              <span className="text-[11px]">Regular Market [LIVE]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'after_hours'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>16:00 – 20:00 ET</span>
                              </span>
                              <span className="text-[11px]">After-Hours Extended [DELAYED]</span>
                            </div>

                            <div className={`p-2 rounded-lg flex items-center justify-between border ${
                              sessionDetail.phase === 'closed'
                                ? 'bg-slate-500/10 border-slate-500/40 text-slate-600 dark:text-slate-400 font-bold'
                                : 'bg-ui-bg/50 border-ui-border/50 text-text-muted'
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                <span>20:00 – 04:00 ET</span>
                              </span>
                              <span className="text-[11px]">Overnight & Weekends [CLOSED]</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Feed Quality & Mode Simulation Tester */}
                    <div className="mt-3 pt-3 border-t border-ui-border space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>Data Feed Quality:</span>
                        <span className="font-mono font-medium text-text-main">{sessionDetail.feedType}</span>
                      </div>

                      {/* Preview Override Selector */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Session Mode Preview:</span>
                          {sessionOverride && (
                            <button
                              type="button"
                              onClick={() => setSessionOverride(null)}
                              className="text-[10px] font-mono text-[#C9A227] hover:underline"
                            >
                              Reset to Auto Schedule
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                          <button
                            type="button"
                            onClick={() => setSessionOverride(null)}
                            className={`px-1.5 py-1 rounded-md border text-center font-bold transition-all cursor-pointer ${
                              sessionOverride === null
                                ? 'bg-[#C9A227] text-[#14213D] border-[#C9A227]'
                                : 'bg-ui-bg text-text-muted border-ui-border hover:text-text-main'
                            }`}
                          >
                            Auto
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionOverride('LIVE')}
                            className={`px-1.5 py-1 rounded-md border text-center font-bold transition-all cursor-pointer ${
                              sessionOverride === 'LIVE'
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-ui-bg text-text-muted border-ui-border hover:text-text-main'
                            }`}
                          >
                            LIVE
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionOverride('DELAYED')}
                            className={`px-1.5 py-1 rounded-md border text-center font-bold transition-all cursor-pointer ${
                              sessionOverride === 'DELAYED'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-ui-bg text-text-muted border-ui-border hover:text-text-main'
                            }`}
                          >
                            DELAYED
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionOverride('CLOSED')}
                            className={`px-1.5 py-1 rounded-md border text-center font-bold transition-all cursor-pointer ${
                              sessionOverride === 'CLOSED'
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'bg-ui-bg text-text-muted border-ui-border hover:text-text-main'
                            }`}
                          >
                            CLOSED
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="text-xs font-mono text-text-muted">
            Real-time constituent performance, index weights and sector momentum.
          </p>
        </div>

        {/* Global Market Region Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono font-bold">
            <button
              onClick={() => handleMarketRegionChange('IN')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMarketRegion === 'IN'
                  ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <span>🇮🇳</span>
              <span>India</span>
            </button>
            <button
              onClick={() => handleMarketRegionChange('US')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMarketRegion === 'US'
                  ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <span>🇺🇸</span>
              <span>U.S.</span>
            </button>
            <button
              onClick={() => handleMarketRegionChange('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMarketRegion === 'ALL'
                  ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Globe size={13} />
              <span>All Global</span>
            </button>
          </div>

          <button
            onClick={() => refresh()}
            disabled={isLoading}
            title="Refresh Live Feeds"
            className="p-2 rounded-xl bg-ui-surface border border-ui-border text-text-muted hover:text-text-main hover:border-[#C9A227]/50 transition-colors"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Index Selector (Item 2, 16, 17) */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {/* U.S. Indices */}
          {(activeMarketRegion === 'US' || activeMarketRegion === 'ALL') && (
            <div className="flex items-center gap-1.5 shrink-0">
              {US_INDEX_KEYS.map(key => {
                const cfg = INDEX_HEATMAP_CONFIG[key];
                const isSelected = selectedIndexKey === key;
                const isFav = favoriteIndices.includes(key);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedIndexKey(key)}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                      isSelected
                        ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] border-[#C9A227] shadow-xs'
                        : 'bg-ui-bg/70 text-text-muted hover:text-text-main border-ui-border hover:border-[#C9A227]/40'
                    }`}
                  >
                    <span>{cfg.displaySymbol}</span>
                    <span
                      onClick={e => toggleFavorite(key, e)}
                      className={`text-xs hover:scale-125 transition-transform ${
                        isFav
                          ? isSelected
                            ? 'text-[#14213D] dark:text-[#080D16]'
                            : 'text-[#C9A227]'
                          : 'opacity-25 hover:opacity-100'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Mark as favorite'}
                    >
                      ★
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeMarketRegion === 'ALL' && <div className="h-5 w-px bg-ui-border shrink-0 mx-1" />}

          {/* India Indices */}
          {(activeMarketRegion === 'IN' || activeMarketRegion === 'ALL') && (
            <div className="flex items-center gap-1.5 shrink-0">
              {indiaPrimaryKeys.map(key => {
                const cfg = INDEX_HEATMAP_CONFIG[key];
                const isSelected = selectedIndexKey === key;
                const isFav = favoriteIndices.includes(key);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedIndexKey(key)}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                      isSelected
                        ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] border-[#C9A227] shadow-xs'
                        : 'bg-ui-bg/70 text-text-muted hover:text-text-main border-ui-border hover:border-[#C9A227]/40'
                    }`}
                  >
                    <span>{cfg.displaySymbol}</span>
                    <span
                      onClick={e => toggleFavorite(key, e)}
                      className={`text-xs hover:scale-125 transition-transform ${
                        isFav
                          ? isSelected
                            ? 'text-[#14213D] dark:text-[#080D16]'
                            : 'text-[#C9A227]'
                          : 'opacity-25 hover:opacity-100'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Mark as favorite'}
                    >
                      ★
                    </span>
                  </button>
                );
              })}

              {/* MORE ▾ Dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setIsMoreMenuOpen(prev => !prev)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                    indiaMoreKeys.includes(selectedIndexKey)
                      ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] border-[#C9A227]'
                      : 'bg-ui-bg/70 text-text-muted hover:text-text-main border-ui-border hover:border-[#C9A227]/40'
                  }`}
                >
                  <span>
                    {indiaMoreKeys.includes(selectedIndexKey)
                      ? INDEX_HEATMAP_CONFIG[selectedIndexKey]?.displaySymbol
                      : 'MORE'}
                  </span>
                  <ChevronDown size={14} className={isMoreMenuOpen ? 'rotate-180 transition-transform' : ''} />
                </button>

                <AnimatePresence>
                  {isMoreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-56 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 p-2 space-y-1 backdrop-blur-md"
                    >
                      <div className="px-2 py-1 text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                        Additional Indian Indices
                      </div>
                      {indiaMoreKeys.map(key => {
                        const cfg = INDEX_HEATMAP_CONFIG[key];
                        const isSelected = selectedIndexKey === key;
                        const isFav = favoriteIndices.includes(key);

                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedIndexKey(key);
                              setIsMoreMenuOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-left font-mono text-xs font-bold transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                                : 'text-text-muted hover:text-text-main hover:bg-ui-bg'
                            }`}
                          >
                            <span>{cfg.displaySymbol}</span>
                            <span
                              onClick={e => toggleFavorite(key, e)}
                              className={`text-xs ${
                                isFav
                                  ? isSelected
                                    ? 'text-[#14213D] dark:text-[#080D16]'
                                    : 'text-[#C9A227]'
                                  : 'opacity-25 hover:opacity-100'
                              }`}
                            >
                              ★
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Quick Index Comparison Row (Prompt Item 30) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {quickIndicesList.map(idx => {
          if (!idx) return null;
          const liveQ = indices.find(i => i.key === idx.id);
          const isSelected = selectedIndexKey === idx.id;
          const price = liveQ ? liveQ.price : idx.baselinePrice;
          const pct = liveQ ? liveQ.percentChange : idx.baselinePercent;
          const isPos = pct >= 0;

          return (
            <button
              key={idx.id}
              onClick={() => setSelectedIndexKey(idx.id)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-ui-surface border-[#C9A227] shadow-sm ring-1 ring-[#C9A227]/30'
                  : 'bg-ui-surface/60 border-ui-border hover:border-ui-border/80 hover:bg-ui-surface'
              }`}
            >
              <div>
                <p className="text-xs font-mono font-bold text-text-muted">{idx.displaySymbol}</p>
                <p className="text-sm font-mono font-black text-text-main">
                  {formatCurrency(price, idx.region)}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                  isPos ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}
              >
                {isPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>
                  {isPos ? '+' : ''}
                  {pct.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Index Summary Card (Prompt Item 5) */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {/* Index & Price */}
          <div className="col-span-2 sm:col-span-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
                {indexSummary.name}
              </p>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider border ${
                  sessionDetail.mode === 'LIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : sessionDetail.mode === 'DELAYED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30'
                }`}
              >
                {sessionDetail.mode}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-mono font-black text-text-main">
                {formatCurrency(indexSummary.currentValue, indexSummary.region)}
              </span>
              <span
                className={`font-mono text-xs sm:text-sm font-bold flex items-center gap-1 ${
                  indexSummary.pctChange >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {indexSummary.pctChange >= 0 ? '+' : ''}
                {formatCurrency(indexSummary.absChange, indexSummary.region)} (
                {indexSummary.pctChange >= 0 ? '+' : ''}
                {indexSummary.pctChange.toFixed(2)}%)
              </span>
            </div>
            <p className="text-[11px] font-mono text-text-muted mt-0.5">
              Prev Close: {formatCurrency(indexSummary.prevClose, indexSummary.region)}
            </p>
          </div>

          {/* Breadth: Advancing */}
          <div className="border-l border-ui-border/60 pl-3">
            <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Advancing</p>
            <p className="text-lg font-mono font-black text-emerald-500 mt-0.5">
              {indexSummary.advancing}
            </p>
          </div>

          {/* Breadth: Declining */}
          <div className="border-l border-ui-border/60 pl-3">
            <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Declining</p>
            <p className="text-lg font-mono font-black text-rose-500 mt-0.5">
              {indexSummary.declining}
            </p>
          </div>

          {/* Breadth: Unchanged */}
          <div className="border-l border-ui-border/60 pl-3">
            <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Unchanged</p>
            <p className="text-lg font-mono font-black text-text-muted mt-0.5">
              {indexSummary.unchanged}
            </p>
          </div>

          {/* Movers Summary */}
          <div className="col-span-2 sm:col-span-1 border-l border-ui-border/60 pl-3 space-y-1">
            {indexSummary.topGainer && (
              <div className="text-xs font-mono">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Top Gainer</span>
                <span className="font-bold text-emerald-500">
                  {indexSummary.topGainer.symbol} +{(indexSummary.topGainer.displayReturn ?? indexSummary.topGainer.changePercent).toFixed(2)}%
                </span>
              </div>
            )}
            {indexSummary.topLoser && (
              <div className="text-xs font-mono">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Top Loser</span>
                <span className="font-bold text-rose-500">
                  {indexSummary.topLoser.symbol} {(indexSummary.topLoser.displayReturn ?? indexSummary.topLoser.changePercent).toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Toolbar: Search, Timeframe, Sizing, Filters, and Heatmap Mode Toggle */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search inside Index */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentIndexConfig.displaySymbol} stocks...`}
              className="w-full bg-ui-bg border border-ui-border rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-[#C9A227]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Timeframe Selector (1D, 1W, 1M, 3M, 6M, 1Y) */}
          <div className="flex items-center p-1 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono font-bold">
            {(['1D', '1W', '1M', '3M', '6M', '1Y'] as TimeframeMetric[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframeMetric(tf)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframeMetric === tf
                    ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Sizing Method (Weight, Market Cap, Volume) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-text-muted font-bold hidden sm:inline">SIZE BY:</span>
            <div className="flex items-center p-1 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono font-bold">
              <button
                onClick={() => setSizingMode('weight')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sizingMode === 'weight'
                    ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setSizingMode('market_cap')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sizingMode === 'market_cap'
                    ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Market Cap
              </button>
              <button
                onClick={() => setSizingMode('volume')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sizingMode === 'volume'
                    ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Volume
              </button>
            </div>
          </div>

          {/* Mode Toggle: Stocks vs Sectors */}
          <div className="flex items-center p-1 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono font-bold">
            <button
              onClick={() => setHeatmapMode('stocks')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                heatmapMode === 'stocks'
                  ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Stocks</span>
            </button>
            <button
              onClick={() => setHeatmapMode('sectors')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                heatmapMode === 'sectors'
                  ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <PieChart size={13} />
              <span>Sectors</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Sector dropdown, Gainers/Losers, Fullscreen */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-ui-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="bg-ui-bg border border-ui-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-text-main focus:outline-hidden focus:border-[#C9A227]"
            >
              {availableSectors.map(sec => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>

            {/* Direction Filter */}
            <div className="flex items-center gap-1">
              {(['all', 'gainers', 'losers', 'high_movers'] as DirectionFilter[]).map(df => (
                <button
                  key={df}
                  onClick={() => setDirectionFilter(df)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    directionFilter === df
                      ? 'bg-ui-surface border-[#C9A227] text-text-main'
                      : 'border-transparent text-text-muted hover:text-text-main'
                  }`}
                >
                  {df === 'all'
                    ? 'All'
                    : df === 'gainers'
                    ? 'Gainers'
                    : df === 'losers'
                    ? 'Losers'
                    : 'High Movers (±1.5%)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-1.5 rounded-lg border border-ui-border text-text-muted hover:text-text-main text-xs font-mono flex items-center gap-1"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* 6. Color Legend Spectrum (Prompt Item 7) */}
      <div className="bg-ui-surface border border-ui-border rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <span className="text-text-muted font-bold">PERFORMANCE SPECTRUM:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#7f1d1d]" />
            <span className="text-text-muted">≤ -3%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#b91c1c]" />
            <span className="text-text-muted">-2% to -3%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#dc2626]" />
            <span className="text-text-muted">-1% to -2%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#e11d48]" />
            <span className="text-text-muted">-0% to -1%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#334155]" />
            <span className="text-text-muted">0%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#10b981]" />
            <span className="text-text-muted">0% to +1%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#059669]" />
            <span className="text-text-muted">+1% to +2%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#047857]" />
            <span className="text-text-muted">+2% to +3%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-xs bg-[#064e3b]" />
            <span className="text-text-muted">≥ +3%</span>
          </span>
        </div>
      </div>

      {/* 7. Main Heatmap Canvas + Stock Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Main: Heatmap Canvas */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {filteredConstituents.length === 0 ? (
            <div className="bg-ui-surface border border-ui-border rounded-2xl p-12 text-center space-y-3">
              <Layers size={36} className="mx-auto text-text-muted/40" />
              <h3 className="text-base font-serif font-black text-text-main">
                No constituents match current filters
              </h3>
              <p className="text-xs font-mono text-text-muted">
                Try resetting search queries or sector filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('ALL');
                  setDirectionFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16] font-bold text-xs font-mono shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : heatmapMode === 'sectors' ? (
            /* SECTOR HEATMAP MODE (Prompt Item 10) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sectorGroups.map(([secName, secData], idx) => {
                const colorConfig = getPerformanceHeatColor(secData.avgReturn);
                const isSelected = selectedSector === secName;

                return (
                  <motion.div
                    key={`${secName}-${idx}`}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setSelectedSector(isSelected ? 'ALL' : secName);
                    }}
                    className={`p-4 rounded-xl cursor-pointer select-none transition-all border ${colorConfig.bg} ${
                      colorConfig.border
                    } ${
                      isSelected
                        ? 'ring-2 ring-[#C9A227] ring-offset-2 ring-offset-ui-bg'
                        : 'shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif italic font-black text-base text-white">
                        {secName}
                      </h4>
                      <span className="text-[11px] font-mono text-white/80">
                        {secData.stocks.length} stocks
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-2xl font-mono font-black text-white">
                        {secData.avgReturn >= 0 ? '+' : ''}
                        {secData.avgReturn.toFixed(2)}%
                      </span>
                      <span className="text-xs font-mono text-white/85">
                        Weight: {secData.totalWeight.toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-[10px] font-mono text-white/70 mt-2">
                      Cap: {formatCompactCurrency(secData.totalCap, currentIndexConfig.region)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* STOCKS HEATMAP MODE (Grouped by Sector) */
            sectorGroups.map(([secName, secData], sIdx) => (
              <div
                key={`${secName}-${sIdx}`}
                className="bg-ui-surface border border-ui-border rounded-xl p-3.5 shadow-xs space-y-2.5 transition-colors"
              >
                {/* Sector Header Strip */}
                <div className="flex items-center justify-between border-b border-ui-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSector(selectedSector === secName ? 'ALL' : secName)}
                      className="text-xs sm:text-sm font-serif italic font-black text-text-main hover:text-[#C9A227] transition-colors flex items-center gap-1.5 group"
                    >
                      <span>{secName}</span>
                      <span className="text-[10px] font-mono text-text-muted group-hover:text-[#C9A227]">
                        ({secData.stocks.length})
                      </span>
                    </button>
                    <span className="text-[10px] font-mono text-text-muted">
                      • {secData.totalWeight.toFixed(1)}% Index Weight
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        secData.avgReturn >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      Sector Avg: {secData.avgReturn >= 0 ? '+' : ''}
                      {secData.avgReturn.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Constituent Tiles */}
                <div className="flex flex-wrap gap-2">
                  {secData.stocks.map((stock, stIdx) => {
                    const ret = stock.displayReturn;
                    const colorConfig = getPerformanceHeatColor(ret);
                    const isSelected = inspectedConstituent?.symbol === stock.symbol;

                    // Flexible sizing calculations
                    let flexBasis = 'flex-[1_1_110px] min-w-[100px] h-[80px]';

                    if (sizingMode === 'weight') {
                      if (stock.weight >= 6.0) {
                        flexBasis = 'flex-[3_3_220px] min-w-[180px] h-[115px]';
                      } else if (stock.weight >= 3.0) {
                        flexBasis = 'flex-[2_2_160px] min-w-[140px] h-[100px]';
                      } else if (stock.weight >= 1.5) {
                        flexBasis = 'flex-[1.5_1.5_130px] min-w-[120px] h-[88px]';
                      }
                    } else if (sizingMode === 'market_cap') {
                      const numCap = parseMarketCapToNumber(stock.marketCap);
                      if (numCap >= 1.5e12) {
                        flexBasis = 'flex-[3_3_220px] min-w-[180px] h-[115px]';
                      } else if (numCap >= 500e9) {
                        flexBasis = 'flex-[2_2_160px] min-w-[140px] h-[100px]';
                      }
                    } else if (sizingMode === 'volume') {
                      const numVol = parseVolumeToNumber(stock.volume);
                      if (numVol >= 15e6) {
                        flexBasis = 'flex-[2.5_2.5_180px] min-w-[150px] h-[105px]';
                      }
                    }

                    return (
                      <motion.div
                        key={`${stock.symbol}-${stIdx}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTileSingleClick(stock)}
                        onDoubleClick={() => handleTileDoubleClick(stock)}
                        onMouseEnter={() => setHoveredStock(stock)}
                        onMouseLeave={() => setHoveredStock(null)}
                        className={`relative rounded-xl p-2.5 cursor-pointer select-none transition-all flex flex-col justify-between overflow-hidden shadow-xs border ${
                          colorConfig.bg
                        } ${colorConfig.border} ${flexBasis} ${
                          isSelected
                            ? 'ring-2 ring-[#C9A227] ring-offset-2 ring-offset-ui-bg z-10 scale-[1.02]'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-mono font-black text-xs sm:text-sm text-white tracking-tight leading-none">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] font-mono text-white/70">
                            {stock.weight.toFixed(1)}%
                          </span>
                        </div>

                        <div className="mt-auto space-y-0.5">
                          <p className="font-mono font-black text-sm sm:text-base text-white leading-tight">
                            {ret >= 0 ? '+' : ''}
                            {ret.toFixed(2)}%
                          </p>
                          <p className="text-[10px] font-mono text-white/75 truncate">
                            {formatCurrency(stock.price, currentIndexConfig.region)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Stock Inspector (Prompt Item 12, 13, 14, 18) */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-4">
          <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-ui-border/60 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-[#C9A227]" />
                <h3 className="font-serif italic font-black text-sm text-text-main uppercase tracking-wider">
                  Stock Inspector
                </h3>
              </div>

              {activeInspect && (
                <button
                  onClick={() => toggleWatchlist(constituentToStock(activeInspect))}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isInspectedWatchlisted
                      ? 'bg-[#C9A227]/15 border-[#C9A227] text-[#C9A227]'
                      : 'border-ui-border text-text-muted hover:text-text-main'
                  }`}
                  title={isInspectedWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                >
                  <Star size={15} fill={isInspectedWatchlisted ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>

            {activeInspect ? (
              <div className="space-y-4">
                {/* Header Information */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-mono font-black text-text-main">
                      {activeInspect.symbol}
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-text-muted px-2 py-0.5 rounded-md bg-ui-bg border border-ui-border">
                      {currentIndexConfig.region === 'IN' ? 'NSE' : 'NASDAQ/NYSE'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-text-muted truncate mt-0.5">
                    {activeInspect.name}
                  </p>
                </div>

                {/* Price & Change Banner */}
                <div className="p-3 rounded-xl bg-ui-bg border border-ui-border space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-black text-text-main">
                      {formatCurrency(activeInspect.price, currentIndexConfig.region)}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        activeInspect.changePercent >= 0
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {activeInspect.changePercent >= 0 ? '+' : ''}
                      {formatCurrency(activeInspect.change, currentIndexConfig.region)} (
                      {activeInspect.changePercent >= 0 ? '+' : ''}
                      {activeInspect.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  {timeframeMetric !== '1D' && (
                    <div className="text-[11px] font-mono text-text-muted flex items-center justify-between pt-1 border-t border-ui-border/40">
                      <span>{timeframeMetric} Trajectory:</span>
                      <span
                        className={`font-bold ${
                          activeInspect.displayReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {activeInspect.displayReturn >= 0 ? '+' : ''}
                        {activeInspect.displayReturn.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Detailed Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Index Weight</span>
                    <span className="font-bold text-text-main text-sm">
                      {activeInspect.weight.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Market Cap</span>
                    <span className="font-bold text-text-main text-sm">
                      {formatCurrency(0, currentIndexConfig.region).slice(0, 1)}
                      {activeInspect.marketCap}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Sector</span>
                    <span className="font-bold text-text-main truncate block">
                      {activeInspect.sector}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Volume</span>
                    <span className="font-bold text-text-main">
                      {activeInspect.volume}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Day High</span>
                    <span className="font-bold text-text-main">
                      {formatCurrency(activeInspect.dayHigh, currentIndexConfig.region)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ui-bg/70 border border-ui-border/60">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Day Low</span>
                    <span className="font-bold text-text-main">
                      {formatCurrency(activeInspect.dayLow, currentIndexConfig.region)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onTrade && onTrade(constituentToStock(activeInspect), 'BUY')}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs shadow-xs transition-colors"
                    >
                      Buy {activeInspect.symbol}
                    </button>
                    <button
                      onClick={() => onTrade && onTrade(constituentToStock(activeInspect), 'SELL')}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-xs transition-colors"
                    >
                      Sell {activeInspect.symbol}
                    </button>
                  </div>

                  <button
                    onClick={() => setDetailModalStock(constituentToStock(activeInspect))}
                    className="w-full py-2 rounded-xl bg-ui-bg border border-ui-border hover:border-[#C9A227] text-text-main font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Double-Click for Full Details</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <Activity size={24} className="mx-auto text-text-muted/40" />
                <p className="text-xs font-mono text-text-muted">
                  Click any stock tile to inspect metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Position Details Modal for Double-Click Action (Prompt Item 14) */}
      {detailModalStock && (
        <PositionDetailsModal
          isOpen={!!detailModalStock}
          onClose={() => setDetailModalStock(null)}
          stock={detailModalStock}
          onQuickTrade={stock => {
            if (onTrade) onTrade(stock);
          }}
        />
      )}
    </div>
  );
};

export default StockHeatmapView;
