/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LineChart,
  Crown,
  Activity,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Sliders,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import StockChart from './StockChart.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';
import { Stock } from '../types.ts';

export const ChartsView: React.FC = () => {
  const { isMax } = useUserTier();
  const { marketContext } = usePortfolio();
  const { stocks } = useMarketData();

  const isIN = marketContext === 'IN';
  const defaultSymbol = isIN ? 'RELIANCE' : 'AAPL';
  const [selectedSymbol, setSelectedSymbol] = useState<string>(defaultSymbol);
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [activeIndicators, setActiveIndicators] = useState<{
    rsi: boolean;
    macd: boolean;
    bollinger: boolean;
    volumeProfile: boolean;
  }>({
    rsi: true,
    macd: true,
    bollinger: false,
    volumeProfile: false
  });

  const activeStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0] || {
    symbol: defaultSymbol,
    name: isIN ? 'Reliance Industries' : 'Apple Inc.',
    price: isIN ? 2984.50 : 234.80,
    change: isIN ? 48.20 : 3.85,
    changePercent: 1.64,
    currency: isIN ? '₹' : '$',
    dayHigh: isIN ? 3010.00 : 236.40,
    dayLow: isIN ? 2940.00 : 231.20,
    prevClose: isIN ? 2936.30 : 230.95,
    volume: '28.4M',
    marketCap: isIN ? '₹20.2T' : '$3.58T',
    history: []
  };

  const isPos = activeStock.change >= 0;

  const toggleIndicator = (ind: keyof typeof activeIndicators) => {
    setActiveIndicators(prev => ({ ...prev, [ind]: !prev[ind] }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              Interactive Technical Charts
            </h1>
            {isMax ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <Crown size={12} className="text-[#D4AF37]" />
                <span>Max Pro Studio</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-ui-surface-subtle text-text-muted border border-ui-border text-[11px] font-bold uppercase tracking-wider">
                Standard Feed (EOD)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            {isMax
              ? 'Multi-timeframe technical indicators, streaming tick precision, and AI support/resistance channels.'
              : 'Standard high-resolution price action and historical closing candles.'}
          </p>
        </div>

        {/* Stock Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-ui-surface border border-ui-border text-xs font-bold text-text-main focus:outline-none shadow-xs"
          >
            {stocks.slice(0, 15).map(s => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Free User Contextual Banner */}
      {!isMax && (
        <ContextualUpgradeCard
          compact
          title="Unlock Multi-Layer Technical Indicators & Live Ticks"
          subtitle="Upgrade to TradePro Max to unlock RSI, MACD, Volume Profile, AI pivot overlays, and sub-second live streaming data."
        />
      )}

      {/* Chart Canvas Card */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-6 shadow-sm space-y-6">
        {/* Asset Meta & Price Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ui-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-2xl text-[#0F172A]">{activeStock.symbol}</span>
              <span className="text-xs text-[#64748B]">{activeStock.name}</span>
              {isMax && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-black uppercase">
                  LIVE STREAM
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-2xl font-mono font-bold text-[#0F172A]">
                {activeStock.currency}{activeStock.price.toFixed(2)}
              </span>
              <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPos ? '+' : ''}{activeStock.change.toFixed(2)} ({isPos ? '+' : ''}{activeStock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Timeframe & Indicators toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs font-mono">
              {['1D', '1W', '1M', '3M', '1Y', '5Y'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeframe === tf
                      ? 'bg-ui-surface text-text-main shadow-xs border border-ui-border'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Max Only Indicators */}
            {isMax ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-ui-border">
                <button
                  onClick={() => toggleIndicator('rsi')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    activeIndicators.rsi
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#B88E1E]'
                      : 'bg-ui-surface-subtle border-ui-border text-text-muted'
                  }`}
                >
                  RSI (14)
                </button>
                <button
                  onClick={() => toggleIndicator('macd')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    activeIndicators.macd
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#B88E1E]'
                      : 'bg-ui-surface-subtle border-ui-border text-text-muted'
                  }`}
                >
                  MACD
                </button>
                <button
                  onClick={() => toggleIndicator('bollinger')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                    activeIndicators.bollinger
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#B88E1E]'
                      : 'bg-ui-surface-subtle border-ui-border text-text-muted'
                  }`}
                >
                  BB (20,2)
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Chart Element */}
        <div className="h-[420px] w-full rounded-xl bg-ui-surface-subtle/50 p-4 border border-ui-border">
          <StockChart stock={activeStock} showDetails={false} showTimeframes={false} />
        </div>

        {/* Bottom Technical Indicators Pane (Max view) */}
        {isMax && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-ui-surface-subtle border border-ui-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-bold">RSI (14-Day Momentum)</span>
                <span className="font-mono font-bold text-emerald-600">62.4 (Bullish)</span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="w-[62.4%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-ui-surface-subtle border border-ui-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-bold">MACD (12, 26, 9)</span>
                <span className="font-mono font-bold text-emerald-600">+1.42 (Bullish Crossover)</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Signal line expanding above zero baseline</p>
            </div>

            <div className="p-3.5 rounded-xl bg-ui-surface-subtle border border-ui-border space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-bold">200-Day EMA Alignment</span>
                <span className="font-mono font-bold text-[#B88E1E]">Above 200 EMA (+8.4%)</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Primary secular bull trend confirmed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartsView;
