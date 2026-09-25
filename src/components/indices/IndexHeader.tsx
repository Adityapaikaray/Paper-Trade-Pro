/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Globe,
  ChevronDown,
  ShieldCheck,
  Calendar,
  Layers,
  LayoutGrid,
  BarChart2,
  PieChart,
  ListFilter
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters.ts';
import { US_INDEX_KEYS, INDIA_INDEX_KEYS, ALL_SUPPORTED_INDICES } from '../../data/indices/indexRegistry.ts';

export type IndexTabId = 'overview' | 'heatmap' | 'contributors' | 'all-stocks';

interface IndexHeaderProps {
  index: {
    id: string;
    name: string;
    symbol: string;
    displaySymbol: string;
    region: 'US' | 'IN';
    currency: '$' | '₹';
    currentValue: number;
    pointChange: number;
    percentChange: number;
    marketStatus: string;
    lastUpdated: number;
    totalConstituents?: number;
    asOfDate?: string;
    lastRebalanced?: string;
  };
  activeTab: IndexTabId;
  onTabChange: (tab: IndexTabId) => void;
  selectedIndexKey: string;
  onSelectIndexKey: (key: string) => void;
  activeRegion: 'US' | 'IN';
  onRegionChange: (region: 'US' | 'IN') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const IndexHeader: React.FC<IndexHeaderProps> = ({
  index,
  activeTab,
  onTabChange,
  selectedIndexKey,
  onSelectIndexKey,
  activeRegion,
  onRegionChange,
  onRefresh,
  isRefreshing
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPositive = index.pointChange >= 0;
  const currentKeys = activeRegion === 'US' ? US_INDEX_KEYS : INDIA_INDEX_KEYS;

  const tabs: { id: IndexTabId; label: string; icon: React.ReactNode; countBadge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <PieChart size={15} /> },
    { id: 'heatmap', label: 'Heatmap', icon: <LayoutGrid size={15} />, countBadge: index.totalConstituents },
    { id: 'contributors', label: 'Contributors', icon: <BarChart2 size={15} /> },
    { id: 'all-stocks', label: 'All Stocks', icon: <ListFilter size={15} />, countBadge: index.totalConstituents }
  ];

  return (
    <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Top bar: Market Region & Index Selector + Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Market Region switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-ui-surface-subtle p-1 border border-ui-border text-xs font-semibold">
            <button
              onClick={() => onRegionChange('US')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeRegion === 'US'
                  ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <span>🇺🇸</span>
              <span>U.S. Markets</span>
            </button>
            <button
              onClick={() => onRegionChange('IN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeRegion === 'IN'
                  ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <span>🇮🇳</span>
              <span>Indian Markets</span>
            </button>
          </div>

          {/* Quick Index Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ui-surface-subtle border border-ui-border hover:border-ui-border-hover text-text-main text-xs font-bold transition-all"
            >
              <span>{index.displaySymbol || index.name}</span>
              <ChevronDown size={14} className={`text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-80 overflow-y-auto bg-ui-surface border border-ui-border rounded-xl shadow-xl z-50 p-1.5 custom-scrollbar">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {activeRegion === 'US' ? 'U.S. Indices' : 'Indian Indices'}
                </div>
                {currentKeys.map(key => {
                  const item = ALL_SUPPORTED_INDICES[key];
                  if (!item) return null;
                  const isSelected = selectedIndexKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onSelectIndexKey(key);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-text-main hover:bg-ui-surface-subtle'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-[10px] text-text-muted">{item.displaySymbol} • {item.constituents?.length || item.totalConstituents || 0} stocks</span>
                      </div>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Last Updated & Refresh */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-text-muted" />
            <span className="hidden sm:inline">Updated:</span>
            <span className="font-mono text-text-main">
              {new Date(index.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ui-border hover:bg-ui-surface-subtle transition-all text-text-main text-xs font-medium disabled:opacity-50"
            title="Refresh Quotes"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-primary' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Index Header Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-ui-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
              {index.name}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-ui-surface-subtle border border-ui-border text-[11px] font-mono font-bold text-text-muted">
              {index.displaySymbol}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              {index.marketStatus}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
            <span>{index.totalConstituents || index.constituents?.length || 0} Constituents</span>
            <span>•</span>
            <span>Rebalance: {index.lastRebalanced || 'Q1 2025'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-text-muted/80">{index.dataSource || 'Institutional Market Feed'}</span>
          </div>
        </div>

        {/* Index Price & Point Change */}
        <div className="flex items-baseline gap-3">
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-text-main">
            {index.currency}{formatCurrency(index.currentValue, index.currency)}
          </div>
          <div
            className={`flex items-center gap-1 text-sm sm:text-base font-bold font-mono px-2.5 py-1 rounded-xl border ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>
              {isPositive ? '+' : ''}{index.pointChange.toFixed(2)}
            </span>
            <span className="text-xs opacity-90">
              ({isPositive ? '+' : ''}{index.percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs: [ Overview ] [ Heatmap ] [ Contributors ] [ All Stocks ] */}
      <div className="flex items-center gap-1.5 border-t border-ui-border pt-3 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-subtle'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.countBadge === 'number' && tab.countBadge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-ui-surface-subtle border border-ui-border text-text-muted'
                  }`}
                >
                  {tab.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
