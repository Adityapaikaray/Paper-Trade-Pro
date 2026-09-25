/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Search,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Clock,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { IndexDefinition, IndexConstituent } from '../data/indices/types.ts';
import {
  calculateIndexContributions,
  ConstituentContribution,
  IndexContributionResult
} from '../utils/indexContribution.ts';
import { formatCurrency } from '../utils/formatters.ts';
import { Stock } from '../types.ts';

const formatNum = (val: number | null | undefined, decimals = 2): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return val.toFixed(decimals);
};

interface IndexContributorsPanelProps {
  indexDef: IndexDefinition;
  currentValue: number;
  absChange: number;
  pctChange: number;
  prevClose: number;
  constituents: IndexConstituent[];
  marketStatus: string;
  isMarketOpen: boolean;
  marketSessionMode: 'LIVE' | 'DELAYED' | 'CLOSED';
  lastUpdatedTime: string;
  onSelectStock?: (stock: Stock) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

export const IndexContributorsPanel: React.FC<IndexContributorsPanelProps> = ({
  indexDef,
  currentValue,
  absChange,
  pctChange,
  prevClose,
  constituents,
  marketStatus,
  isMarketOpen,
  marketSessionMode,
  lastUpdatedTime,
  onSelectStock,
  onClose,
  isCompact = false
}) => {
  const [showAllModal, setShowAllModal] = useState(false);
  const [allSearchQuery, setAllSearchQuery] = useState('');
  const [allFilterTab, setAllFilterTab] = useState<'all' | 'positive' | 'negative' | 'top_gain' | 'top_drag'>('all');
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Compute contribution metrics
  const contributionData: IndexContributionResult = useMemo(() => {
    return calculateIndexContributions(
      indexDef,
      currentValue,
      absChange,
      pctChange,
      prevClose,
      constituents
    );
  }, [indexDef, currentValue, absChange, pctChange, prevClose, constituents]);

  // Convert constituent to standard Stock object for TradePro modal/trading
  const handleConstituentClick = (item: ConstituentContribution) => {
    if (!onSelectStock) return;
    const stock: Stock = {
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.changePercent,
      volume: item.volume,
      marketCap: item.marketCap,
      description: `${item.name} (${item.symbol}) constituent of ${indexDef.name}. Index Weight: ${item.weight}%.`,
      sector: item.sector,
      country: indexDef.region === 'IN' ? 'India' : 'USA',
      currency: indexDef.currency,
      dayHigh: item.dayHigh,
      dayLow: item.dayLow,
      prevClose: item.prevClose
    };
    onSelectStock(stock);
  };

  // Filtered list for "View All Constituents"
  const filteredAllList = useMemo(() => {
    let list = [...contributionData.allContributors];

    // Filter by search query
    if (allSearchQuery.trim()) {
      const q = allSearchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (allFilterTab === 'positive') {
      list = list.filter(c => c.pointsContribution !== null && c.pointsContribution > 0);
    } else if (allFilterTab === 'negative') {
      list = list.filter(c => c.pointsContribution !== null && c.pointsContribution < 0);
    } else if (allFilterTab === 'top_gain') {
      list = list.sort((a, b) => (b.pointsContribution ?? -9999) - (a.pointsContribution ?? -9999));
    } else if (allFilterTab === 'top_drag') {
      list = list.sort((a, b) => (a.pointsContribution ?? 9999) - (b.pointsContribution ?? 9999));
    }

    return list;
  }, [contributionData.allContributors, allSearchQuery, allFilterTab]);

  const isPositive = absChange >= 0;

  return (
    <div className="bg-ui-surface border border-ui-border rounded-2xl shadow-sm overflow-hidden flex flex-col text-text-main transition-colors">
      {/* 1. Header Overview */}
      <div className="p-4 sm:p-5 border-b border-ui-border bg-ui-bg/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm">
                {indexDef.region === 'IN' ? '🇮🇳' : '🇺🇸'}
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-text-muted uppercase">
                {indexDef.region === 'IN' ? 'NSE / BSE' : 'U.S. MARKETS'}
              </span>
              <span className="text-ui-border">•</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-ui-bg border border-ui-border text-[#C9A227] dark:text-[#D4AF37]">
                {contributionData.methodology === 'price-weighted' ? 'Price-Weighted' : 'Market-Cap Weighted'}
              </span>
              <span
                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  marketSessionMode === 'LIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : marketSessionMode === 'DELAYED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30'
                }`}
              >
                {marketStatus}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-text-main mt-1 flex items-center gap-2">
              <span>{indexDef.name}</span>
              <span className="text-xs font-mono font-normal text-text-muted">
                ({indexDef.displaySymbol})
              </span>
            </h3>

            {/* Current Value & Movement */}
            <div className="flex items-baseline gap-2.5 mt-1.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-mono font-black text-text-main tabular-nums">
                {formatCurrency(currentValue, indexDef.region)}
              </span>
              <span
                className={`font-mono text-sm sm:text-base font-bold flex items-center gap-0.5 tabular-nums ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>
                  {isPositive ? '+' : ''}
                  {formatNum(absChange)} pts ({isPositive ? '+' : ''}
                  {formatNum(pctChange)}%)
                </span>
              </span>
            </div>

            {/* Last Updated Timestamp & delayed disclaimer */}
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-text-muted">
              <Clock size={12} className="text-[#C9A227]" />
              <span>Updated: {lastUpdatedTime}</span>
              <span>•</span>
              <span>Prev Close: {formatCurrency(prevClose, indexDef.region)}</span>
              {marketSessionMode === 'DELAYED' && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">15m Delayed</span>
                </>
              )}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-ui-border text-text-muted hover:text-text-main hover:bg-ui-bg"
              title="Close panel"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dynamic "What's moving the index?" Summary Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-ui-surface border border-ui-border/80 flex items-start gap-2.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-[#C9A227]/15 text-[#C9A227] dark:text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
                What's Moving {indexDef.displaySymbol}?
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-emerald-500 font-bold">
                  +{formatNum(contributionData.grossPositivePoints, 1)} pts
                </span>
                <span className="text-text-muted">/</span>
                <span className="text-rose-500 font-bold">
                  -{formatNum(contributionData.grossNegativePoints, 1)} pts
                </span>
              </div>
            </div>
            <p className="text-xs font-mono text-text-main mt-0.5 leading-relaxed">
              {contributionData.driverSummary}
            </p>
          </div>
        </div>

        {/* Small Methodology Note & Toggle */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-text-muted">
          <p className="italic text-[10px] sm:text-[11px]">
            {contributionData.explanationNote}
          </p>
          <button
            onClick={() => setIsMethodologyOpen(prev => !prev)}
            className="flex items-center gap-1 text-[#C9A227] dark:text-[#D4AF37] hover:underline font-bold shrink-0 ml-2"
          >
            <Info size={11} />
            <span>{isMethodologyOpen ? 'Hide Math' : 'Methodology'}</span>
          </button>
        </div>

        {/* Expandable Methodology Explanation */}
        {isMethodologyOpen && (
          <div className="mt-2 p-3 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono text-text-muted space-y-1.5 animate-fadeIn">
            <p className="text-text-main font-bold">
              {contributionData.methodology === 'price-weighted'
                ? 'Price-Weighted Methodology (Dow Jones)'
                : 'Free-Float Capitalization Methodology'}
            </p>
            <p className="text-[11px] leading-relaxed">
              {contributionData.methodologyDescription}
            </p>
            <div className="p-2 rounded bg-ui-surface border border-ui-border/60 text-[10px] text-text-main font-mono">
              {contributionData.methodology === 'price-weighted' ? (
                <code>Point Contribution = Stock Price Change (ΔP) / Dow Divisor (~0.1517)</code>
              ) : (
                <code>Point Contribution = Index PrevClose × (Weight % / 100) × (Stock % Change / 100)</code>
              )}
            </div>
            <p className="text-[10px] text-text-muted">
              Note: Stock % change, constituent weight, and index point contribution are distinct metrics. A stock with high % gain but small weight contributes fewer points than a mega-cap with a moderate gain.
            </p>
          </div>
        )}
      </div>

      {/* 2. Side-by-side Top Contributors & Detractors */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 overflow-y-auto">
        {/* TOP POSITIVE CONTRIBUTORS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp size={13} />
              </div>
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Top Positive Contributors
              </h4>
            </div>
            <span className="text-[10px] font-mono text-text-muted font-bold">
              {contributionData.topPositiveContributors.length} Advancing
            </span>
          </div>

          {contributionData.topPositiveContributors.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-ui-bg/50 border border-ui-border/60 text-xs font-mono text-text-muted">
              No positive contributors in current session.
            </div>
          ) : (
            <div className="space-y-2">
              {contributionData.topPositiveContributors.slice(0, 5).map((stock, idx) => {
                const magnitude = stock.pointsContribution ?? 0;
                const barWidth = Math.min(
                  100,
                  Math.max(10, (magnitude / contributionData.maxMagnitude) * 100)
                );

                return (
                  <div
                    key={stock.symbol}
                    onClick={() => handleConstituentClick(stock)}
                    className="p-2.5 rounded-xl border border-ui-border/70 hover:border-emerald-500/50 bg-ui-surface hover:bg-emerald-500/5 transition-all cursor-pointer group space-y-1.5"
                    title={`Click to inspect ${stock.symbol}`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 text-[10px] font-bold text-text-muted">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-text-main group-hover:text-emerald-500 transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[11px] text-text-muted truncate max-w-[110px] sm:max-w-[150px]">
                          {stock.name}
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-text-muted">
                          {formatCurrency(stock.price, indexDef.region)}
                        </span>
                        <span className="font-bold text-emerald-500">
                          +{formatNum(stock.changePercent)}%
                        </span>
                      </div>
                    </div>

                    {/* Intuitive Bidirectional Visualization: Positive extends to the RIGHT */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-20 text-[10px] font-mono text-text-muted">
                        Wt: {formatNum(stock.weight, 1)}%
                      </div>
                      <div className="flex-1 bg-ui-bg rounded-full h-2.5 overflow-hidden flex items-center border border-ui-border/40">
                        {/* Positive bar extends right from start */}
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        />
                      </div>
                      <div className="w-20 sm:w-24 text-right font-mono text-xs font-black text-emerald-500 tabular-nums">
                        {stock.pointsContribution != null && !isNaN(stock.pointsContribution) ? (
                          `+${formatNum(stock.pointsContribution)} pts`
                        ) : (
                          <span className="text-[10px] text-text-muted font-normal">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* TOP NEGATIVE CONTRIBUTORS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <TrendingDown size={13} />
              </div>
              <h4 className="text-xs font-mono font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Top Negative Contributors
              </h4>
            </div>
            <span className="text-[10px] font-mono text-text-muted font-bold">
              {contributionData.topNegativeContributors.length} Declining
            </span>
          </div>

          {contributionData.topNegativeContributors.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-ui-bg/50 border border-ui-border/60 text-xs font-mono text-text-muted">
              No negative contributors in current session.
            </div>
          ) : (
            <div className="space-y-2">
              {contributionData.topNegativeContributors.slice(0, 5).map((stock, idx) => {
                const magnitude = Math.abs(stock.pointsContribution ?? 0);
                const barWidth = Math.min(
                  100,
                  Math.max(10, (magnitude / contributionData.maxMagnitude) * 100)
                );

                return (
                  <div
                    key={stock.symbol}
                    onClick={() => handleConstituentClick(stock)}
                    className="p-2.5 rounded-xl border border-ui-border/70 hover:border-rose-500/50 bg-ui-surface hover:bg-rose-500/5 transition-all cursor-pointer group space-y-1.5"
                    title={`Click to inspect ${stock.symbol}`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 text-[10px] font-bold text-text-muted">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-text-main group-hover:text-rose-500 transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[11px] text-text-muted truncate max-w-[110px] sm:max-w-[150px]">
                          {stock.name}
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-text-muted">
                          {formatCurrency(stock.price, indexDef.region)}
                        </span>
                        <span className="font-bold text-rose-500">
                          {formatNum(stock.changePercent)}%
                        </span>
                      </div>
                    </div>

                    {/* Intuitive Bidirectional Visualization: Negative extends to the LEFT */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 sm:w-20 text-[10px] font-mono text-text-muted">
                        Wt: {formatNum(stock.weight, 1)}%
                      </div>
                      <div className="flex-1 bg-ui-bg rounded-full h-2.5 overflow-hidden flex items-center justify-end border border-ui-border/40">
                        {/* Negative bar extends left from right edge */}
                        <div
                          style={{ width: `${barWidth}%` }}
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                        />
                      </div>
                      <div className="w-20 sm:w-24 text-right font-mono text-xs font-black text-rose-500 tabular-nums">
                        {stock.pointsContribution != null && !isNaN(stock.pointsContribution) ? (
                          `${formatNum(stock.pointsContribution)} pts`
                        ) : (
                          <span className="text-[10px] text-text-muted font-normal">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Footer Bar with "View All Constituents" Button */}
      <div className="p-3 sm:p-4 border-t border-ui-border bg-ui-bg/40 flex items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-text-muted">
          Showing top {Math.min(5, contributionData.topPositiveContributors.length)} positive &{' '}
          {Math.min(5, contributionData.topNegativeContributors.length)} negative movers of{' '}
          {constituents.length} constituents.
        </div>

        <button
          onClick={() => setShowAllModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-ui-surface border border-ui-border hover:border-[#C9A227] text-xs font-mono font-bold text-text-main flex items-center gap-1.5 transition-all shadow-xs hover:text-[#C9A227]"
        >
          <BarChart3 size={13} />
          <span>View All Constituents</span>
        </button>
      </div>

      {/* 4. "VIEW ALL CONSTITUENTS" MODAL / SHEET */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-ui-surface border border-ui-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-ui-border flex items-center justify-between gap-3 bg-ui-bg/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {indexDef.region === 'IN' ? '🇮🇳' : '🇺🇸'}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                    {indexDef.name} ({indexDef.displaySymbol})
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text-main mt-0.5">
                  All Index Constituents & Point Contributions
                </h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-lg border border-ui-border text-text-muted hover:text-text-main hover:bg-ui-bg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 sm:p-4 border-b border-ui-border bg-ui-surface flex flex-wrap items-center justify-between gap-3">
              {/* Search ticker/company */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={allSearchQuery}
                  onChange={e => setAllSearchQuery(e.target.value)}
                  placeholder="Search ticker, company, or sector..."
                  className="w-full bg-ui-bg border border-ui-border rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-[#C9A227]"
                />
                {allSearchQuery && (
                  <button
                    onClick={() => setAllSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex items-center p-1 rounded-xl bg-ui-bg border border-ui-border text-xs font-mono font-bold overflow-x-auto">
                <button
                  onClick={() => setAllFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    allFilterTab === 'all'
                      ? 'bg-[#C9A227] text-[#14213D] dark:bg-[#D4AF37] dark:text-[#080D16]'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  All ({contributionData.allContributors.length})
                </button>
                <button
                  onClick={() => setAllFilterTab('positive')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    allFilterTab === 'positive'
                      ? 'bg-emerald-500 text-white'
                      : 'text-text-muted hover:text-emerald-500'
                  }`}
                >
                  Positive ({contributionData.topPositiveContributors.length})
                </button>
                <button
                  onClick={() => setAllFilterTab('negative')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    allFilterTab === 'negative'
                      ? 'bg-rose-500 text-white'
                      : 'text-text-muted hover:text-rose-500'
                  }`}
                >
                  Negative ({contributionData.topNegativeContributors.length})
                </button>
                <button
                  onClick={() => setAllFilterTab('top_gain')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    allFilterTab === 'top_gain'
                      ? 'bg-ui-surface border border-[#C9A227] text-text-main'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Largest Gain
                </button>
                <button
                  onClick={() => setAllFilterTab('top_drag')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    allFilterTab === 'top_drag'
                      ? 'bg-ui-surface border border-[#C9A227] text-text-main'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Largest Drag
                </button>
              </div>
            </div>

            {/* Table of Constituents */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-ui-border text-[10px] uppercase font-bold text-text-muted">
                    <th className="py-2 px-2.5">Stock</th>
                    <th className="py-2 px-2.5">Sector</th>
                    <th className="py-2 px-2.5 text-right">Weight</th>
                    <th className="py-2 px-2.5 text-right">Price</th>
                    <th className="py-2 px-2.5 text-right">% Change</th>
                    <th className="py-2 px-2.5 text-right">Index Contrib</th>
                    <th className="py-2 px-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {filteredAllList.map(item => {
                    const isPos = (item.pointsContribution ?? 0) >= 0;
                    return (
                      <tr
                        key={item.symbol}
                        className="hover:bg-ui-bg/70 transition-colors group cursor-pointer"
                        onClick={() => {
                          handleConstituentClick(item);
                          setShowAllModal(false);
                        }}
                      >
                        <td className="py-2 px-2.5">
                          <div className="font-bold text-text-main group-hover:text-[#C9A227] transition-colors">
                            {item.symbol}
                          </div>
                          <div className="text-[10px] text-text-muted truncate max-w-[120px] sm:max-w-[180px]">
                            {item.name}
                          </div>
                        </td>
                        <td className="py-2 px-2.5 text-text-muted text-[11px]">
                          {item.sector}
                        </td>
                        <td className="py-2 px-2.5 text-right text-text-main font-semibold">
                          {item.weight}%
                        </td>
                        <td className="py-2 px-2.5 text-right text-text-main tabular-nums">
                          {formatCurrency(item.price, indexDef.region)}
                        </td>
                        <td
                          className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                            (item.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {(item.changePercent ?? 0) >= 0 ? '+' : ''}
                          {formatNum(item.changePercent)}%
                        </td>
                        <td
                          className={`py-2 px-2.5 text-right font-bold tabular-nums ${
                            item.pointsContribution == null
                              ? 'text-text-muted italic'
                              : isPos
                              ? 'text-emerald-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {item.pointsContribution != null && !isNaN(item.pointsContribution) ? (
                            <span>
                              {isPos ? '+' : ''}
                              {formatNum(item.pointsContribution)} pts
                            </span>
                          ) : (
                            <span className="text-[10px]">Contribution unavailable</span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <button
                            type="button"
                            className="p-1 rounded-md text-text-muted hover:text-[#C9A227] hover:bg-ui-surface"
                            title="Inspect stock"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAllList.length === 0 && (
                <div className="p-8 text-center text-text-muted font-mono text-xs">
                  No constituents match the search query "{allSearchQuery}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-ui-border bg-ui-bg/40 flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Showing {filteredAllList.length} of {contributionData.allContributors.length} constituents</span>
              <button
                onClick={() => setShowAllModal(false)}
                className="px-3 py-1 rounded-lg bg-ui-surface border border-ui-border text-xs font-bold text-text-main hover:bg-ui-bg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
