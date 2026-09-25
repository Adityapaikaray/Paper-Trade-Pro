/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Eye
} from 'lucide-react';
import { IndexConstituent } from '../../data/indices/types.ts';
import {
  getPerformanceHeatColor,
  parseMarketCapToNumber,
  parseVolumeToNumber
} from '../../data/indexHeatmapData.ts';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters.ts';
import { Stock } from '../../types.ts';

export type SizingMode = 'weight' | 'market_cap' | 'volume';
export type DirectionFilter = 'all' | 'gainers' | 'losers';
export type TimeframeMetric = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

interface HeatmapGridViewProps {
  index: {
    id: string;
    name: string;
    currency: '$' | '₹';
    region: 'US' | 'IN';
  };
  constituents: IndexConstituent[];
  onSelectStock: (stock: Stock) => void;
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
}

export const HeatmapGridView: React.FC<HeatmapGridViewProps> = ({
  index,
  constituents,
  onSelectStock,
  onTrade
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [sizingMode, setSizingMode] = useState<SizingMode>('weight');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [timeframeMetric, setTimeframeMetric] = useState<TimeframeMetric>('1D');
  const [hoveredStock, setHoveredStock] = useState<IndexConstituent | null>(null);
  const [selectedStock, setSelectedStock] = useState<IndexConstituent | null>(null);
  const [sectorGrouping, setSectorGrouping] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'weight' | 'performance' | 'contribution'>('weight');

  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    constituents.forEach(c => {
      if (c.sector) set.add(c.sector.trim());
    });
    return Array.from(set).sort();
  }, [constituents]);

  // Filtered constituents
  const filteredList = useMemo(() => {
    return constituents.filter(c => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          (c.sector && c.sector.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedSector !== 'ALL' && c.sector !== selectedSector) {
        return false;
      }

      if (directionFilter === 'gainers' && c.changePercent <= 0) return false;
      if (directionFilter === 'losers' && c.changePercent >= 0) return false;

      return true;
    });
  }, [constituents, searchQuery, selectedSector, directionFilter]);

  // Sort comparator
  const sortComparator = (a: IndexConstituent, b: IndexConstituent) => {
    if (sortBy === 'performance') return b.changePercent - a.changePercent;
    if (sortBy === 'contribution') return (b.pointsContribution || 0) - (a.pointsContribution || 0);
    return (b.weight || 0) - (a.weight || 0);
  };

  // Grouped by Sector or Flat list
  const sectorGroups = useMemo(() => {
    if (!sectorGrouping) {
      const sorted = [...filteredList].sort(sortComparator);
      return [{ name: 'All Stocks', stocks: sorted, weight: 100 }];
    }

    const map: Record<string, { stocks: IndexConstituent[]; weight: number }> = {};
    filteredList.forEach(c => {
      const sec = c.sector || 'Other';
      if (!map[sec]) map[sec] = { stocks: [], weight: 0 };
      map[sec].stocks.push(c);
      map[sec].weight += c.weight || 0;
    });

    Object.values(map).forEach(g => g.stocks.sort(sortComparator));

    return Object.entries(map)
      .map(([name, val]) => ({ name, stocks: val.stocks, weight: val.weight }))
      .sort((a, b) => b.weight - a.weight);
  }, [filteredList, sectorGrouping, sortBy]);

  const constituentToStock = (c: IndexConstituent): Stock => ({
    symbol: c.symbol,
    name: c.name,
    description: c.name,
    price: c.price,
    change: c.change,
    changePercent: c.changePercent,
    volume: c.volume,
    marketCap: c.marketCap,
    sector: c.sector,
    country: index.region === 'IN' ? 'India' : 'USA',
    currency: index.currency,
    dayHigh: c.dayHigh,
    dayLow: c.dayLow,
    prevClose: c.prevClose,
    exchange: c.exchange || (index.region === 'IN' ? 'NSE' : 'NASDAQ'),
    history: []
  });

  return (
    <div className="space-y-4">
      {/* Heatmap Controls Toolbar */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search inside Index Heatmap */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${index.name}...`}
              className="w-full bg-ui-surface-subtle border border-ui-border rounded-xl pl-9 pr-8 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sizing Method Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-text-muted hidden sm:inline">Size:</span>
            <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
              {(['weight', 'market_cap', 'volume'] as SizingMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setSizingMode(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    sizingMode === m
                      ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {m === 'market_cap' ? 'Market Cap' : m}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-text-muted hidden sm:inline">Sort:</span>
            <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
              <button
                onClick={() => setSortBy('weight')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  sortBy === 'weight'
                    ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setSortBy('performance')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  sortBy === 'performance'
                    ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setSortBy('contribution')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  sortBy === 'contribution'
                    ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                Contribution
              </button>
            </div>
          </div>

          {/* Sector Grouping Toggle */}
          <button
            onClick={() => setSectorGrouping(!sectorGrouping)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              sectorGrouping
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-ui-surface-subtle border-ui-border text-text-muted hover:text-text-main'
            }`}
          >
            <Layers size={13} />
            <span>Sector Grouping</span>
          </button>
        </div>

        {/* Filters Row: Sector, Direction Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ui-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sector Dropdown */}
            {availableSectors.length > 0 && (
              <select
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-ui-surface-subtle border border-ui-border text-xs font-semibold text-text-main focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Sectors ({availableSectors.length})</option>
                {availableSectors.map(sec => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            )}

            {/* Direction Filter */}
            <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
              {(['all', 'gainers', 'losers'] as DirectionFilter[]).map(df => (
                <button
                  key={df}
                  onClick={() => setDirectionFilter(df)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                    directionFilter === df
                      ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {df}
                </button>
              ))}
            </div>
          </div>

          {/* Count badge */}
          <span className="text-xs text-text-muted">
            Displaying <strong className="text-text-main font-mono">{filteredList.length}</strong> of{' '}
            <strong className="text-text-main font-mono">{constituents.length}</strong> constituents
          </span>
        </div>
      </div>

      {/* Heatmap Spectrum Legend */}
      <div className="bg-ui-surface border border-ui-border rounded-xl px-4 py-2 shadow-xs flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <span className="text-text-muted font-bold">PERFORMANCE SPECTRUM:</span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#7f1d1d]" />
            <span className="text-text-muted">≤ -3%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#b91c1c]" />
            <span className="text-text-muted">-2%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#dc2626]" />
            <span className="text-text-muted">-1%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#334155]" />
            <span className="text-text-muted">0%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
            <span className="text-text-muted">+1%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]" />
            <span className="text-text-muted">+2%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#064e3b]" />
            <span className="text-text-muted">≥ +3%</span>
          </span>
        </div>
      </div>

      {/* Main Heatmap Canvas */}
      <div className="space-y-4">
        {sectorGroups.map(group => (
          <div key={group.name} className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm space-y-3">
            {/* Sector header */}
            {sectorGrouping && (
              <div className="flex items-center justify-between pb-1 border-b border-ui-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-main">{group.name}</span>
                  <span className="text-[10px] font-mono text-text-muted">
                    ({group.stocks.length} stocks)
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-text-muted">
                  {group.weight.toFixed(1)}% index weight
                </span>
              </div>
            )}

            {/* Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {group.stocks.map(c => {
                const heat = getPerformanceHeatColor(c.changePercent);
                const isPos = c.changePercent >= 0;

                // Scale tile size modestly according to weight
                const colSpan =
                  sizingMode === 'weight' && c.weight > 6
                    ? 'col-span-2 row-span-2'
                    : sizingMode === 'weight' && c.weight > 3.5
                    ? 'col-span-2'
                    : 'col-span-1';

                return (
                  <div
                    key={c.symbol}
                    onClick={() => onSelectStock(constituentToStock(c))}
                    onMouseEnter={() => setHoveredStock(c)}
                    onMouseLeave={() => setHoveredStock(null)}
                    className={`${colSpan} min-h-[70px] p-2.5 rounded-xl border ${heat.border} ${heat.bg} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between group relative`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono font-black text-xs text-white tracking-tight">
                        {c.symbol}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-white/80">
                        {c.weight.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-1">
                      <div className="text-[11px] font-mono font-black text-white">
                        {isPos ? '+' : ''}{c.changePercent.toFixed(2)}%
                      </div>
                      <div className="text-[10px] font-mono text-white/80">
                        {index.currency}{formatCurrency(c.price, index.currency)}
                      </div>
                    </div>

                    {/* Tooltip on hover */}
                    {hoveredStock?.symbol === c.symbol && (
                      <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-52 bg-ui-surface border border-ui-border rounded-xl shadow-2xl p-2.5 z-50 pointer-events-none text-left space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-xs text-text-main">
                          <span>{c.symbol}</span>
                          <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                            {isPos ? '+' : ''}{c.changePercent.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted truncate">{c.name}</div>
                        <div className="pt-1 border-t border-ui-border/60 text-[10px] font-mono text-text-muted space-y-0.5">
                          <div className="flex justify-between">
                            <span>Price:</span>
                            <span className="text-text-main font-bold">
                              {index.currency}{formatCurrency(c.price, index.currency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Index Weight:</span>
                            <span className="text-text-main">{c.weight.toFixed(2)}%</span>
                          </div>
                          {typeof c.pointsContribution === 'number' && (
                            <div className="flex justify-between">
                              <span>Contribution:</span>
                              <span
                                className={`font-bold ${
                                  c.pointsContribution >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {c.pointsContribution >= 0 ? '+' : ''}{c.pointsContribution.toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Market Cap:</span>
                            <span className="text-text-main">{c.marketCap}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
