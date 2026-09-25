/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  LayoutGrid,
  ListFilter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { IndexConstituent } from '../../data/indices/types.ts';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters.ts';
import { Stock } from '../../types.ts';
import { IndexTabId } from './IndexHeader.tsx';

interface IndexOverviewTabProps {
  index: {
    id: string;
    name: string;
    currency: '$' | '₹';
    currentValue: number;
    pointChange: number;
    percentChange: number;
    prevClose: number;
    region: 'US' | 'IN';
    totalConstituents?: number;
    description?: string;
  };
  constituents: IndexConstituent[];
  onTabChange: (tab: IndexTabId) => void;
  onSelectStock: (stock: Stock) => void;
}

export const IndexOverviewTab: React.FC<IndexOverviewTabProps> = ({
  index,
  constituents,
  onTabChange,
  onSelectStock
}) => {
  // Advance / Decline breakdown
  const stats = useMemo(() => {
    let advances = 0;
    let declines = 0;
    let unchanged = 0;
    let totalCap = 0;

    const sortedByContrib = [...constituents].sort(
      (a, b) => (b.pointsContribution || 0) - (a.pointsContribution || 0)
    );

    const topContributors = sortedByContrib.filter(c => (c.pointsContribution || 0) > 0).slice(0, 5);
    const topDetractors = [...sortedByContrib].reverse().filter(c => (c.pointsContribution || 0) < 0).slice(0, 5);

    const sectorsMap: Record<string, { count: number; totalWeight: number; avgChange: number; sumChange: number }> = {};

    constituents.forEach(c => {
      if (c.changePercent > 0) advances++;
      else if (c.changePercent < 0) declines++;
      else unchanged++;

      const sec = c.sector || 'Other';
      if (!sectorsMap[sec]) {
        sectorsMap[sec] = { count: 0, totalWeight: 0, avgChange: 0, sumChange: 0 };
      }
      sectorsMap[sec].count++;
      sectorsMap[sec].totalWeight += c.weight || 0;
      sectorsMap[sec].sumChange += c.changePercent || 0;
    });

    const sectors = Object.entries(sectorsMap).map(([name, val]) => ({
      name,
      count: val.count,
      weight: val.totalWeight,
      avgChange: val.count > 0 ? val.sumChange / val.count : 0
    })).sort((a, b) => b.weight - a.weight);

    return {
      advances,
      declines,
      unchanged,
      topContributors,
      topDetractors,
      sectors
    };
  }, [constituents]);

  const openStockModal = (c: IndexConstituent) => {
    const stock: Stock = {
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
    };
    onSelectStock(stock);
  };

  const totalStocks = constituents.length || 1;
  const advancePct = Math.round((stats.advances / totalStocks) * 100);
  const declinePct = Math.round((stats.declines / totalStocks) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: Market Breadth & Methodology Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Advance / Decline card */}
        <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Market Breadth
            </span>
            <span className="text-xs font-mono font-bold text-text-main">
              {stats.advances} Adv / {stats.declines} Dec
            </span>
          </div>

          {/* Breadth Bar */}
          <div className="h-3 w-full rounded-full bg-ui-surface-subtle overflow-hidden flex">
            <div
              style={{ width: `${advancePct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Advances: ${stats.advances} (${advancePct}%)`}
            />
            <div
              style={{ width: `${declinePct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Declines: ${stats.declines} (${declinePct}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span className="text-emerald-400 font-bold">▲ {stats.advances} ({advancePct}%)</span>
            <span>{stats.unchanged} Unch</span>
            <span className="text-rose-400 font-bold">▼ {stats.declines} ({declinePct}%)</span>
          </div>
        </div>

        {/* Index Methodology card */}
        <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
            <ShieldCheck size={14} className="text-primary" />
            <span>Methodology</span>
          </div>
          <div className="text-sm font-bold text-text-main">
            {index.id === 'dow'
              ? 'Price-Weighted Index (Dow Divisor)'
              : 'Free-Float Market-Cap Weighted'}
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {index.id === 'dow'
              ? 'Point contribution is calibrated directly from individual stock price movement divided by the current Dow Divisor (~0.1517).'
              : 'Constituent weight in the index and percentage stock delta jointly determine exact point contribution to the benchmark.'}
          </p>
        </div>

        {/* Quick Launch Cards */}
        <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Quick Actions
            </span>
            <div className="text-sm font-bold text-text-main mt-1">
              Explore Complete Constituent Universe
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => onTabChange('heatmap')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-ui-surface-subtle border border-ui-border hover:border-primary/40 text-xs font-bold text-text-main transition-all"
            >
              <LayoutGrid size={14} />
              <span>Heatmap</span>
            </button>
            <button
              onClick={() => onTabChange('all-stocks')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold transition-all shadow-xs"
            >
              <ListFilter size={14} />
              <span>All Stocks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column: Top Movers vs Detractors & Sector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors & Detractors Spotlight */}
        <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-text-main">
                Top Contributors & Detractors
              </h3>
            </div>
            <button
              onClick={() => onTabChange('contributors')}
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
            >
              <span>View all contributors</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Top positive contributors */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Top Impact Contributors
            </div>
            <div className="space-y-1.5">
              {stats.topContributors.map(c => (
                <div
                  key={c.symbol}
                  onClick={() => openStockModal(c)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-ui-surface-subtle hover:bg-ui-surface-subtle/80 cursor-pointer transition-all border border-ui-border/40 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-text-main group-hover:text-primary transition-colors">
                      {c.symbol}
                    </span>
                    <span className="text-xs text-text-muted truncate max-w-[150px]">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs font-mono font-bold text-text-main">
                      {index.currency}{formatCurrency(c.price, index.currency)}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{c.changePercent.toFixed(2)}%
                    </span>
                    {typeof c.pointsContribution === 'number' && (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +{c.pointsContribution.toFixed(2)} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top detractors */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
              Top Impact Detractors
            </div>
            <div className="space-y-1.5">
              {stats.topDetractors.map(c => (
                <div
                  key={c.symbol}
                  onClick={() => openStockModal(c)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-ui-surface-subtle hover:bg-ui-surface-subtle/80 cursor-pointer transition-all border border-ui-border/40 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-text-main group-hover:text-primary transition-colors">
                      {c.symbol}
                    </span>
                    <span className="text-xs text-text-muted truncate max-w-[150px]">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-xs font-mono font-bold text-text-main">
                      {index.currency}{formatCurrency(c.price, index.currency)}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {c.changePercent.toFixed(2)}%
                    </span>
                    {typeof c.pointsContribution === 'number' && (
                      <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        {c.pointsContribution.toFixed(2)} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border">
            <div className="flex items-center gap-2">
              <PieChart size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-text-main">
                Sector Weight & Performance
              </h3>
            </div>
            <span className="text-xs text-text-muted font-mono">
              {stats.sectors.length} Sectors
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {stats.sectors.map(sec => {
              const isSecPos = sec.avgChange >= 0;
              return (
                <div key={sec.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-main">
                      {sec.name}{' '}
                      <span className="text-text-muted font-normal">({sec.count})</span>
                    </span>
                    <div className="flex items-center gap-2.5 font-mono">
                      <span className="text-text-muted font-medium">
                        {sec.weight.toFixed(1)}% weight
                      </span>
                      <span
                        className={`font-bold ${
                          isSecPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isSecPos ? '+' : ''}{sec.avgChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-ui-surface-subtle overflow-hidden">
                    <div
                      style={{ width: `${Math.min(sec.weight, 100)}%` }}
                      className={`h-full rounded-full ${
                        isSecPos ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
