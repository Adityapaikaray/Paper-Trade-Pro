/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Crown,
  Bell,
  BarChart2,
  Layers,
  Zap,
  Activity,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stock } from '../types.ts';
import StockChart from './StockChart.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';
import { AskTradeProAIChip } from './VoiceAssistant/AskTradeProAIChip.tsx';

interface AssetDetailPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onTrade?: (stock: Stock, side?: 'BUY' | 'SELL') => void;
}

export const AssetDetailPageModal: React.FC<AssetDetailPageModalProps> = ({
  isOpen,
  onClose,
  stock,
  onTrade,
}) => {
  const { toggleWatchlist, isWatchlisted, marketContext } = usePortfolio();
  const { isMax } = useUserTier();
  const { openModal } = useUI();
  const [activeTab, setActiveTab] = useState<'overview' | 'level2' | 'options' | 'ai_analysis' | 'news'>('overview');
  const [timeframe, setTimeframe] = useState<string>('1M');

  if (!isOpen || !stock) return null;

  const isPositive = stock.change >= 0;
  const currencySymbol = stock.currency || (marketContext === 'IN' ? '₹' : '$');
  const inWatchlist = isWatchlisted(stock.symbol);

  // Key Statistics
  const keyStats = [
    { label: 'Market Cap', value: stock.marketCap || (currencySymbol === '₹' ? '₹18.4T' : '$2.98T') },
    { label: 'Volume (24h)', value: stock.volume || '14.2M' },
    { label: 'Day Range', value: `${currencySymbol}${(stock.dayLow || stock.price * 0.985).toFixed(2)} - ${currencySymbol}${(stock.dayHigh || stock.price * 1.015).toFixed(2)}` },
    { label: '52-Week Range', value: stock.fiftyTwoWeekHigh ? `${currencySymbol}${stock.fiftyTwoWeekLow?.toFixed(2)} - ${currencySymbol}${stock.fiftyTwoWeekHigh?.toFixed(2)}` : `${currencySymbol}${(stock.price * 0.78).toFixed(2)} - ${currencySymbol}${(stock.price * 1.25).toFixed(2)}` },
    { label: 'P/E Ratio', value: '28.4' },
    { label: 'Beta (1Y)', value: '1.14' },
    { label: 'Avg Volume (30D)', value: '18.9M' },
    { label: 'Div Yield', value: '1.24%' },
  ];

  // Synthetic Level 2 Order Book
  const orderBookBids = [
    { price: (stock.price * 0.9995).toFixed(2), size: 1420, total: 1420 },
    { price: (stock.price * 0.9990).toFixed(2), size: 2850, total: 4270 },
    { price: (stock.price * 0.9985).toFixed(2), size: 4120, total: 8390 },
    { price: (stock.price * 0.9980).toFixed(2), size: 5890, total: 14280 },
    { price: (stock.price * 0.9975).toFixed(2), size: 8400, total: 22680 },
  ];

  const orderBookAsks = [
    { price: (stock.price * 1.0005).toFixed(2), size: 1250, total: 1250 },
    { price: (stock.price * 1.0010).toFixed(2), size: 3100, total: 4350 },
    { price: (stock.price * 1.0015).toFixed(2), size: 4980, total: 9330 },
    { price: (stock.price * 1.0020).toFixed(2), size: 6200, total: 15530 },
    { price: (stock.price * 1.0025).toFixed(2), size: 9100, total: 24630 },
  ];

  // News items
  const stockNews = [
    {
      title: `${stock.symbol} Q3 Earnings Beat Expectations as Institutional Demand Surges`,
      source: 'Bloomberg Markets',
      time: '42m ago',
      sentiment: 'positive',
    },
    {
      title: `Analyst Upgrades ${stock.symbol} to Overweight with Raised 12-Month Price Target`,
      source: 'Wall Street Journal',
      time: '3h ago',
      sentiment: 'positive',
    },
    {
      title: `Global Sector Rebalancing Drives Substantial Dark Pool Inflows into ${stock.symbol}`,
      source: 'Financial Times',
      time: '7h ago',
      sentiment: 'neutral',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#091122]/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-ui-surface rounded-2xl border border-ui-border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 pb-4 border-b border-ui-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ui-surface">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-main font-mono font-bold text-base shadow-xs shrink-0">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-text-main">{stock.symbol}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg">
                  {stock.exchange || (marketContext === 'IN' ? 'NSE' : 'NASDAQ')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg">
                  {stock.sector || 'Equities'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-text-muted font-medium">{stock.name}</p>
                <AskTradeProAIChip prompt={`What is the institutional outlook and key levels for ${stock.symbol}?`} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5">
            {/* Price & Change */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">Current Price</span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-text-main">
                  {currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
                <span>{isPositive ? '+' : ''}{currencySymbol}{stock.change.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
                {isMax && (
                  <span className="ml-1.5 text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">
                    LIVE 6ms
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions & Close */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`p-2.5 rounded-xl border transition-all ${
                  inWatchlist
                    ? 'bg-primary/10 border-primary text-primary shadow-xs'
                    : 'bg-ui-bg border-ui-border text-text-muted hover:text-text-main'
                }`}
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star size={16} className={inWatchlist ? 'fill-primary' : ''} />
              </button>

              <button
                onClick={() => onTrade && onTrade(stock, 'BUY')}
                className="px-4 py-2 rounded-xl bg-positive hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all"
              >
                Buy
              </button>

              <button
                onClick={() => onTrade && onTrade(stock, 'SELL')}
                className="px-4 py-2 rounded-xl bg-negative hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all"
              >
                Sell
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-ui-bg transition-colors ml-1"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-ui-border bg-ui-surface-subtle overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview & Chart' },
            { id: 'level2', label: 'Level 2 Order Book', isMax: true },
            { id: 'options', label: 'Options Chain', isMax: true },
            { id: 'ai_analysis', label: 'Max AI Diagnostics', isMax: true },
            { id: 'news', label: 'News & Analyst Ratings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
              }`}
            >
              <span>{tab.label}</span>
              {tab.isMax && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/30">
                  MAX
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Interactive Price Chart */}
              <div className="bg-ui-surface rounded-2xl border border-ui-border p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={16} className="text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Interactive Price Action</h3>
                  </div>

                  {/* Timeframe Controls */}
                  <div className="flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border text-xs font-mono font-bold">
                    {['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'].map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          timeframe === tf
                            ? 'bg-ui-surface text-text-main shadow-xs border border-ui-border'
                            : 'text-text-muted hover:text-text-main'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full">
                  <StockChart stock={stock} showDetails={false} showTimeframes={false} height={280} />
                </div>
              </div>

              {/* Key Statistics Grid */}
              <div className="bg-ui-surface rounded-2xl border border-ui-border p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Key Financial Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {keyStats.map((stat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-ui-bg border border-ui-border/80">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                        {stat.label}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-text-main block">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Level 2 Order Book */}
          {activeTab === 'level2' && (
            <div className="space-y-6">
              {!isMax ? (
                <ContextualUpgradeCard
                  title="Unlock Real-Time Level 2 Market Depth"
                  subtitle="See live bid/ask queue depth, institutional dark pool order absorption, and tick-by-tick microsecond matching with TradePro Max."
                  features={[
                    'Depth of Market (DOM) 10-level bid/ask book',
                    'Dark pool block print detection',
                    'Cumulative volume delta histogram',
                    'Sub-millisecond direct feed access'
                  ]}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold font-sans text-text-main">Real-Time Level 2 Depth of Market</h3>
                      <p className="text-xs text-text-muted">Live consolidated order book across registered exchanges.</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      STREAMING DOM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bids */}
                    <div className="p-4 rounded-xl bg-ui-surface border border-ui-border space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-positive border-b border-ui-border pb-2">
                        <span>Bid Price</span>
                        <span>Size</span>
                        <span>Total Depth</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {orderBookBids.map((bid, i) => (
                          <div key={i} className="flex justify-between items-center py-1 px-1.5 rounded bg-positive/5 hover:bg-positive/10 transition-colors">
                            <span className="font-bold text-positive">{currencySymbol}{bid.price}</span>
                            <span className="text-text-main">{bid.size.toLocaleString()}</span>
                            <span className="text-text-muted text-[11px]">{bid.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Asks */}
                    <div className="p-4 rounded-xl bg-ui-surface border border-ui-border space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-negative border-b border-ui-border pb-2">
                        <span>Ask Price</span>
                        <span>Size</span>
                        <span>Total Depth</span>
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {orderBookAsks.map((ask, i) => (
                          <div key={i} className="flex justify-between items-center py-1 px-1.5 rounded bg-negative/5 hover:bg-negative/10 transition-colors">
                            <span className="font-bold text-negative">{currencySymbol}{ask.price}</span>
                            <span className="text-text-main">{ask.size.toLocaleString()}</span>
                            <span className="text-text-muted text-[11px]">{ask.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Options Chain Preview */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              {!isMax ? (
                <ContextualUpgradeCard
                  title="Unlock Institutional Options Chain & Greeks"
                  subtitle="Access strike ladders, implied volatility skews, open interest distributions, and Delta/Gamma neutral risk hedging with TradePro Max."
                  features={[
                    'Complete call/put strike chain with weekly/monthly expirations',
                    'Streaming Greeks: Delta, Gamma, Theta, Vega, Rho',
                    'Implied Volatility (IV) surface and historical percentile',
                    'Options volume & open interest concentration heatmaps'
                  ]}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold font-sans text-text-main">Near-The-Money Options Matrix ({stock.symbol})</h3>
                      <p className="text-xs text-text-muted">Weekly expiration contracts with streaming delta and implied volatility.</p>
                    </div>
                    <button
                      onClick={() => openModal('upgrade')}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      Full Options Terminal <ExternalLink size={12} />
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-ui-border rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-ui-surface-subtle border-b border-ui-border text-[10px] text-text-muted uppercase">
                        <tr>
                          <th className="py-2.5 px-3 text-positive font-bold">Call Bid/Ask</th>
                          <th className="py-2.5 px-3 text-positive font-bold">Call IV</th>
                          <th className="py-2.5 px-3 text-positive font-bold">Call Delta</th>
                          <th className="py-2.5 px-3 text-center bg-ui-bg font-black text-text-main">Strike</th>
                          <th className="py-2.5 px-3 text-negative font-bold">Put Delta</th>
                          <th className="py-2.5 px-3 text-negative font-bold">Put IV</th>
                          <th className="py-2.5 px-3 text-negative font-bold text-right">Put Bid/Ask</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ui-border">
                        {[
                          { strike: Math.round(stock.price * 0.96), cBid: (stock.price * 0.05).toFixed(2), cAsk: (stock.price * 0.052).toFixed(2), cIV: '14.2%', cDelta: '+0.78', pDelta: '-0.22', pIV: '15.1%', pBid: (stock.price * 0.008).toFixed(2), pAsk: (stock.price * 0.009).toFixed(2) },
                          { strike: Math.round(stock.price * 0.98), cBid: (stock.price * 0.034).toFixed(2), cAsk: (stock.price * 0.036).toFixed(2), cIV: '13.8%', cDelta: '+0.64', pDelta: '-0.36', pIV: '14.5%', pBid: (stock.price * 0.014).toFixed(2), pAsk: (stock.price * 0.015).toFixed(2) },
                          { strike: Math.round(stock.price), cBid: (stock.price * 0.021).toFixed(2), cAsk: (stock.price * 0.023).toFixed(2), cIV: '13.2%', cDelta: '+0.51', pDelta: '-0.49', pIV: '13.7%', pBid: (stock.price * 0.021).toFixed(2), pAsk: (stock.price * 0.023).toFixed(2), isATM: true },
                          { strike: Math.round(stock.price * 1.02), cBid: (stock.price * 0.012).toFixed(2), cAsk: (stock.price * 0.013).toFixed(2), cIV: '13.5%', cDelta: '+0.36', pDelta: '-0.64', pIV: '14.1%', pBid: (stock.price * 0.032).toFixed(2), pAsk: (stock.price * 0.034).toFixed(2) },
                          { strike: Math.round(stock.price * 1.04), cBid: (stock.price * 0.006).toFixed(2), cAsk: (stock.price * 0.007).toFixed(2), cIV: '14.0%', cDelta: '+0.21', pDelta: '-0.79', pIV: '14.8%', pBid: (stock.price * 0.048).toFixed(2), pAsk: (stock.price * 0.051).toFixed(2) },
                        ].map((row, i) => (
                          <tr key={i} className={`hover:bg-ui-surface-hover/60 transition-colors ${row.isATM ? 'bg-primary/5 font-bold' : ''}`}>
                            <td className="py-2.5 px-3 text-positive font-mono">{currencySymbol}{row.cBid} / {currencySymbol}{row.cAsk}</td>
                            <td className="py-2.5 px-3 text-text-muted">{row.cIV}</td>
                            <td className="py-2.5 px-3 text-positive">{row.cDelta}</td>
                            <td className="py-2.5 px-3 text-center bg-ui-bg font-bold text-text-main font-mono">{currencySymbol}{row.strike}</td>
                            <td className="py-2.5 px-3 text-negative">{row.pDelta}</td>
                            <td className="py-2.5 px-3 text-text-muted">{row.pIV}</td>
                            <td className="py-2.5 px-3 text-negative font-mono text-right">{currencySymbol}{row.pBid} / {currencySymbol}{row.pAsk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Max AI Diagnostics */}
          {activeTab === 'ai_analysis' && (
            <div className="space-y-6">
              {!isMax ? (
                <ContextualUpgradeCard
                  title="Unlock Proprietary AI Quantitative Diagnostics"
                  subtitle="Get AI-generated support/resistance pivots, unusual volume alert triggers, and probabilistic thesis generation for every asset."
                  features={[
                    'Algorithmic support & resistance levels updated intraday',
                    'Dark pool anomaly & block order tracking',
                    'Institutional sentiment & multi-factor momentum score',
                    'Automated "Why this matters" fundamental thesis'
                  ]}
                />
              ) : (
                <div className="rounded-2xl border-2 border-[#DFC27D]/60 bg-gradient-to-b from-[#FFFDF8] via-[#FCF8EE]/50 to-[#FFFFFF] p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D2]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FCF8EE] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37]">
                        <Sparkles size={20} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-lg text-[#0F172A]">Max AI Quantitative Thesis: {stock.symbol}</h4>
                        <span className="text-[10px] text-[#B88E1E] font-bold uppercase tracking-wider">Multi-Factor Neural Classification (Confidence 91%)</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-xs font-black uppercase">
                      BULLISH CONTINUATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-white border border-[#EAE3D2]">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Key Support</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm">{currencySymbol}{(stock.price * 0.965).toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#EAE3D2]">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Key Resistance</span>
                      <span className="font-mono font-bold text-rose-600 text-sm">{currencySymbol}{(stock.price * 1.045).toFixed(2)}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#EAE3D2]">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Unusual Flow</span>
                      <span className="font-mono font-bold text-[#B88E1E] text-sm">2.4x 30D Average</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#EAE3D2] space-y-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#B88E1E] flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#D4AF37]" />
                      Why This Matters
                    </span>
                    <p className="text-xs text-[#334155] leading-relaxed font-sans">
                      Volume-weighted average price (VWAP) cross-block orders suggest aggressive institutional accumulation above technical resistance. Delta-hedging dynamics in nearby weekly call options are creating structural upward drift.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: News & Analyst Ratings */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              {/* Analyst Consensus Card */}
              <div className="bg-ui-surface rounded-2xl border border-ui-border p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Wall Street Analyst Consensus</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-ui-bg border border-ui-border text-center">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Consensus Rating</span>
                    <span className="text-xl font-bold text-positive">Strong Buy</span>
                    <span className="text-[11px] text-text-muted block mt-1">Based on 32 analysts</span>
                  </div>
                  <div className="p-4 rounded-xl bg-ui-bg border border-ui-border text-center">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">12-Month Price Target</span>
                    <span className="text-xl font-mono font-bold text-text-main">{currencySymbol}{(stock.price * 1.18).toFixed(2)}</span>
                    <span className="text-[11px] text-positive block mt-1">+18.0% Upside</span>
                  </div>
                  <div className="p-4 rounded-xl bg-ui-bg border border-ui-border text-center">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Institutional Ownership</span>
                    <span className="text-xl font-mono font-bold text-text-main">74.6%</span>
                    <span className="text-[11px] text-text-muted block mt-1">4,120 Institutions</span>
                  </div>
                </div>
              </div>

              {/* News Articles */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent Headlines</h3>
                {stockNews.map((news, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-ui-surface border border-ui-border hover:border-primary/40 transition-colors space-y-1.5 cursor-pointer">
                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span className="font-semibold text-text-main">{news.source}</span>
                      <span className="font-mono">{news.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-text-main hover:text-primary transition-colors leading-snug">
                      {news.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-ui-border bg-ui-surface flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock size={13} className="text-primary" />
            <span>Market Session: {marketContext === 'IN' ? 'NSE / BSE Active' : 'NYSE / NASDAQ Active'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-ui-border text-xs font-semibold text-text-main hover:bg-ui-bg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onTrade) onTrade(stock, 'BUY');
              }}
              className="px-5 py-2 rounded-xl bg-primary text-text-dark font-bold text-xs hover:bg-primary-light transition-all shadow-xs"
            >
              Trade {stock.symbol}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AssetDetailPageModal;
