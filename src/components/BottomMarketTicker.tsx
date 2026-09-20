/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketData } from '../contexts/MarketContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { getRegionalMarketStatus } from '../utils/marketHours.ts';
import { Stock } from '../types.ts';

interface BottomMarketTickerProps {
  onTrade?: (stock: Stock) => void;
}

interface TickerDisplayItem {
  id: string;
  symbol: string;
  name?: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  isPositive: boolean;
  tick?: 'up' | 'down' | null;
  stockRef?: Stock;
  isIndex?: boolean;
}

export const BottomMarketTicker: React.FC<BottomMarketTickerProps> = ({ onTrade }) => {
  const { stocks, indices, priceTicks, indexTicks, marketStatus, lastUpdated } = useMarketData();
  const { isWatchlisted, marketContext } = usePortfolio();
  const isIndia = marketContext === 'IN';

  // Combine real-time indices and highlighted market stocks for active region
  const tickerItems = useMemo<TickerDisplayItem[]>(() => {
    const list: TickerDisplayItem[] = [];

    // 1. Major indices strictly matching the active market region
    indices
      .filter(idx => isIndia ? (idx.region === 'India' || idx.currency === '₹') : (idx.region === 'US' || idx.currency === '$'))
      .forEach(idx => {
        const isPos = (idx.percentChange ?? 0) >= 0;
        list.push({
          id: `idx-${idx.key}`,
          symbol: idx.displaySymbol || idx.symbol || idx.name,
          name: idx.name,
          currency: idx.currency || (idx.region === 'India' ? '₹' : '$'),
          price: idx.price,
          change: idx.change,
          percentChange: idx.percentChange,
          isPositive: isPos,
          tick: indexTicks[idx.key],
          isIndex: true,
        });
      });

    // 2. Actively traded stocks for the active region
    const prioritySymbols = isIndia
      ? ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TITAN', 'TATAMOTORS', 'ICICIBANK', 'BHARTIARTL', 'WIPRO', 'ITC']
      : ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ', 'AMD', 'BRK-B', 'AVGO'];

    stocks
      .filter(stock => isIndia ? (stock.currency === '₹' || stock.country === 'India') : (stock.currency === '$' || stock.country === 'USA'))
      .forEach(stock => {
        if (prioritySymbols.includes(stock.symbol.toUpperCase())) {
          const isPos = (stock.changePercent ?? 0) >= 0;
          list.push({
            id: `stock-${stock.symbol}`,
            symbol: stock.symbol,
            name: stock.name,
            currency: stock.currency || (stock.country === 'India' ? '₹' : '$'),
            price: stock.price,
            change: stock.change,
            percentChange: stock.changePercent,
            isPositive: isPos,
            tick: priceTicks[stock.symbol],
            stockRef: stock,
            isIndex: false,
          });
        }
      });

    return list;
  }, [stocks, indices, priceTicks, indexTicks, isIndia]);

  const formatPrice = (val: number, curr: string) => {
    if (val === undefined || isNaN(val)) return '—';
    return `${curr}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (pct: number) => {
    if (pct === undefined || isNaN(pct)) return '0.00%';
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  const renderItem = (item: TickerDisplayItem, keyPrefix: string) => {
    const hasTick = !!item.tick;
    const isTickUp = item.tick === 'up';

    // Tailored styling for high-contrast presentation on black background
    const baseChipClass = item.stockRef
      ? 'cursor-pointer bg-[#111622] border-[#1E2638] hover:bg-[#182030] hover:border-[#2C3850]'
      : 'bg-[#111622] border-[#1E2638] hover:bg-[#182030]';

    const tickClass = hasTick
      ? isTickUp
        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(0,208,132,0.2)]'
        : 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_8px_rgba(255,92,92,0.2)]'
      : '';

    return (
      <button
        key={`${keyPrefix}-${item.id}`}
        onClick={() => {
          if (item.stockRef && onTrade) {
            onTrade(item.stockRef);
          }
        }}
        tabIndex={0}
        aria-label={`${item.name || item.symbol}, price ${item.price}, ${item.isPositive ? 'up' : 'down'} ${Math.abs(item.percentChange || 0).toFixed(2)} percent`}
        title={item.stockRef ? `Click to trade ${item.symbol} (${formatPrice(item.price, item.currency)})` : item.name}
        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono border transition-all duration-200 shrink-0 select-none focus:outline-none focus:ring-1 focus:ring-primary ${baseChipClass} ${tickClass}`}
      >
        {/* Symbol badge */}
        <span className="font-bold tracking-tight text-white flex items-center gap-1.5">
          {item.symbol}
          {item.isIndex && (
            <span className="text-[8px] font-sans font-bold px-1 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10">
              IDX
            </span>
          )}
        </span>

        {/* Real-time Price */}
        <span
          className={`font-semibold tabular-nums text-slate-200 ${
            hasTick
              ? isTickUp
                ? 'text-emerald-300 font-bold'
                : 'text-rose-300 font-bold'
              : ''
          }`}
        >
          {formatPrice(item.price, item.currency)}
        </span>

        {/* Mini Sparkline indicator */}
        <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible opacity-80 shrink-0">
          <polyline
            fill="none"
            stroke={item.isPositive ? "#00D084" : "#FF5C5C"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={item.isPositive ? "0,10 6,8 12,9 18,3 24,1" : "0,2 6,4 12,3 18,9 24,11"}
          />
        </svg>

        {/* Percentage change */}
        <span
          className={`font-bold flex items-center text-[11px] tabular-nums ${
            item.isPositive ? 'text-[#00D084]' : 'text-[#FF5C5C]'
          }`}
        >
          {item.isPositive ? (
            <TrendingUp size={11} strokeWidth={2.5} className="mr-0.5" />
          ) : (
            <TrendingDown size={11} strokeWidth={2.5} className="mr-0.5" />
          )}
          {formatPercent(item.percentChange)}
        </span>

        {/* Active flash tick pill */}
        {hasTick && (
          <span
            className={`text-[8.5px] font-bold px-1 rounded uppercase tracking-wider ${
              isTickUp
                ? 'bg-emerald-500/25 text-emerald-300'
                : 'bg-rose-500/25 text-rose-300'
            }`}
          >
            {isTickUp ? '▲' : '▼'}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      aria-label="Live Market Ticker"
      className="fixed bottom-0 left-0 right-0 h-10 bg-[#07090E] border-t border-[#182030] z-40 flex items-center shadow-[0_-4px_25px_rgba(0,0,0,0.6)] overflow-hidden select-none"
    >
      {/* Real-time Status Anchor */}
      <div className="flex items-center h-full px-3 md:px-4 border-r border-[#182030] shrink-0 bg-[#07090E] z-20 shadow-[4px_0_12px_rgba(0,0,0,0.4)]">
        {(() => {
          const regStatus = getRegionalMarketStatus(marketContext);
          let label = 'CLOSED';
          let detail = regStatus.timezoneLabel;
          let color = 'bg-slate-500';
          let bgColor = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
          let ping = false;

          if (regStatus.isOpen) {
            label = 'LIVE';
            detail = 'STREAMING';
            color = 'bg-[#00D084]';
            bgColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            ping = true;
          } else if (regStatus.status === 'Pre-Market') {
            label = 'PRE-MKT';
            detail = 'SESSION ACTIVE';
            color = 'bg-amber-500';
            bgColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            ping = true;
          } else if (regStatus.status === 'After Hours' || regStatus.status === 'Post-Market') {
            label = 'AFTER-HRS';
            detail = 'POST-SESSION';
            color = 'bg-amber-500';
            bgColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            ping = false;
          } else {
            label = 'CLOSED';
            detail = regStatus.nextEvent.toUpperCase();
            color = 'bg-slate-500';
            bgColor = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
            ping = false;
          }

          return (
            <div className="flex items-center gap-2" title={`${regStatus.sessionNote} • ${regStatus.timeString}`}>
              <span className="relative flex h-2 w-2">
                {ping && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color}`} />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
                {label}
              </span>
              <span className={`hidden sm:inline-flex text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-tight ${bgColor}`}>
                {detail}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Ticker Continuous Marquee Track */}
      <div className="flex-1 flex items-center h-full overflow-x-auto overflow-y-hidden scrollbar-hide relative group touch-pan-x">
        {/* Soft edge gradients on black background */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#07090E] via-[#07090E]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#07090E] via-[#07090E]/80 to-transparent z-10 pointer-events-none" />

        {/* Marquee Animation Stream - 2 identical tracks for mathematically seamless loop */}
        <div className="flex items-center shrink-0 animate-[ticker_45s_linear_infinite] hover:[animation-play-state:paused] will-change-transform">
          {/* Primary Track */}
          <div className="flex items-center gap-2.5 pr-2.5 shrink-0">
            {tickerItems.map(item => renderItem(item, 'primary'))}
          </div>

          {/* Seamless Duplicate Track for Infinite Continuous Marquee */}
          <div className="flex items-center gap-2.5 pr-2.5 shrink-0" aria-hidden="true">
            {tickerItems.map(item => renderItem(item, 'duplicate'))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default BottomMarketTicker;
