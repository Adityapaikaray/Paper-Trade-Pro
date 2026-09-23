/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { TrendingUp, TrendingDown, Globe, Activity, RefreshCw } from 'lucide-react';
import { IndexQuote } from '../types.ts';

interface KeyIndicesBarProps {
  className?: string;
}

export const KeyIndicesBar: React.FC<KeyIndicesBarProps> = ({ className = '' }) => {
  const { indices, indexTicks, isLive, refresh, isLoading } = useMarketData();
  const { marketContext } = usePortfolio();
  const [selectedRegion, setSelectedRegion] = useState<string>(() => marketContext === 'IN' ? 'India' : 'US');

  useEffect(() => {
    setSelectedRegion(marketContext === 'IN' ? 'India' : 'US');
  }, [marketContext]);

  const regions = [
    { id: marketContext === 'IN' ? 'India' : 'US', label: marketContext === 'IN' ? '🇮🇳 Indian Benchmarks' : '🇺🇸 U.S. Benchmarks' },
    { id: 'ALL', label: 'All Benchmarks' },
    { id: marketContext === 'IN' ? 'US' : 'India', label: marketContext === 'IN' ? '🇺🇸 U.S. Benchmarks' : '🇮🇳 Indian Benchmarks' },
  ];

  const filteredIndices = selectedRegion === 'ALL'
    ? indices
    : indices.filter(idx => idx.region === selectedRegion);

  return (
    <section id="key-indices-section" className={`bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-xl backdrop-blur-xl ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-ui-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Activity size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif italic font-black text-lg text-text-main tracking-tight">
                Global & Domestic Key Indices
              </h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Real-Time
              </span>
            </div>
            <p className="text-[10px] font-mono text-text-muted mt-0.5">
              Live quotes for Dow, S&P 500, Nasdaq, DAX, Nifty 50, Sensex & Nifty Bank
            </p>
          </div>
        </div>

        {/* Region filter and refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border overflow-x-auto no-scrollbar max-w-[calc(100vw-3rem)] sm:max-w-md md:max-w-lg lg:max-w-none">
              {regions.map((r, rIdx) => (
                <button
                  key={`${r.id}-${rIdx}`}
                  id={`region-filter-${r.id.toLowerCase()}`}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all whitespace-nowrap shrink-0 ${
                    selectedRegion === r.id
                      ? 'bg-primary text-ui-bg shadow-sm font-black'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              id="refresh-indices-btn"
              onClick={() => refresh()}
              disabled={isLoading}
              className="w-8 h-8 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shrink-0"
              title="Refresh Index Quotes"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 pt-5">
        {filteredIndices.map((idx: IndexQuote, iIdx: number) => {
          const tick = indexTicks[idx.key];
          const isPositive = idx.change >= 0;

          return (
            <div
              key={`${idx.key}-${iIdx}`}
              id={`index-card-${idx.key}`}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                tick === 'up'
                  ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : tick === 'down'
                  ? 'bg-rose-500/10 border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'bg-ui-bg border-ui-border hover:border-primary/30 hover:shadow-md'
              }`}
            >
              {/* Header: Tag + Region */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-serif italic font-black text-xs text-text-main tracking-tight">
                  {idx.displaySymbol}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-ui-surface border border-ui-border text-text-muted uppercase">
                  {idx.region}
                </span>
              </div>

              {/* Sub-name */}
              <p className="text-[10px] text-text-muted truncate mb-2">
                {idx.name}
              </p>

              {/* Real-time Price */}
              <div className="my-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-mono font-bold text-text-muted">{idx.currency}</span>
                  <span className="text-base font-mono font-black italic tracking-tight text-text-main">
                    {idx.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>

              {/* Real-time Change & Pct */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-ui-border/60 mt-1">
                <div className={`flex items-center gap-1 text-[11px] font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isPositive ? '+' : ''}{idx.change.toFixed(2)}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isPositive ? '+' : ''}{idx.percentChange.toFixed(2)}%
                </span>
              </div>

              {/* Intraday Range if available */}
              {idx.dayHigh !== undefined && idx.dayLow !== undefined && idx.dayHigh > idx.dayLow && (
                <div className="mt-2 pt-1.5 border-t border-ui-border/40 text-[8px] font-mono text-text-muted flex justify-between">
                  <span>L: {idx.dayLow.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  <span>H: {idx.dayHigh.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KeyIndicesBar;
