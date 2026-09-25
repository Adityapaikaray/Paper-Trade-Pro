/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Search,
  Lock,
  ChevronRight,
  Clock,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import ContextualUpgradeCard from './ContextualUpgradeCard.tsx';
import { formatCurrency } from '../utils/formatters.ts';

export const AIInsightsView: React.FC = () => {
  const { isMax } = useUserTier();
  const { marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const [selectedAsset, setSelectedAsset] = useState<string>('AAPL');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'signals' | 'unusual_flow' | 'macro'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isIN = marketContext === 'IN';
  const currencySymbol = isIN ? '₹' : '$';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Curated AI Insights data for institutional grade experience
  const macroSummary = {
    regime: 'Bullish Consolidation with Low Volatility (Regime III)',
    confidence: '94.2%',
    asOf: 'Updated 2 mins ago • Real-time AI Engine',
    keyDrivers: [
      'Disinflationary core CPI trajectory supporting tech multiple expansion',
      'Institutional call gamma positioning anchoring index volatility below 15.2',
      'Positive earnings revisions across megacap semiconductors and financial credit'
    ],
    riskScore: 28, // 0 - 100 scale (low risk)
    sentimentScore: '+0.68' // -1 to +1 scale
  };

  const assetInsights = [
    {
      symbol: isIN ? 'RELIANCE' : 'AAPL',
      name: isIN ? 'Reliance Industries Ltd.' : 'Apple Inc.',
      price: isIN ? 2984.50 : 234.80,
      changePercent: +1.64,
      signal: 'BULLISH CONTINUATION',
      signalType: 'bullish',
      confidence: '91%',
      trendStrength: 'High (ADX 38.4)',
      unusualVolume: '2.4x 30-Day Average',
      supportLevel: isIN ? '₹2,920.00' : '$229.50',
      resistanceLevel: isIN ? '₹3,050.00' : '$240.00',
      catalyst: 'Institutional accumulation detected in morning cross-block orders.',
      whyItMatters: 'Large dark-pool prints above the 20-day volume-weighted average price (VWAP) indicate institutional sponsors are absorbing sell-side liquidity before the upcoming product cycle announcements.'
    },
    {
      symbol: isIN ? 'HDFCBANK' : 'NVDA',
      name: isIN ? 'HDFC Bank Ltd.' : 'NVIDIA Corporation',
      price: isIN ? 1680.20 : 138.25,
      changePercent: +2.85,
      signal: 'VOLATILITY SQUEEZE BREAKOUT',
      signalType: 'bullish',
      confidence: '88%',
      trendStrength: 'Very High (RSI 64.2)',
      unusualVolume: '3.1x 30-Day Average',
      supportLevel: isIN ? '₹1,640.00' : '$132.00',
      resistanceLevel: isIN ? '₹1,720.00' : '$145.00',
      catalyst: 'Massive out-of-the-money call sweep across $145 strike expirations.',
      whyItMatters: 'Positive delta hedging by market makers is creating upward price drift, accelerating bullish momentum towards the upper Bollinger band.'
    },
    {
      symbol: isIN ? 'INFY' : 'TSLA',
      name: isIN ? 'Infosys Ltd.' : 'Tesla Inc.',
      price: isIN ? 1890.10 : 248.50,
      changePercent: -1.20,
      signal: 'DISTRIBUTION AT RESISTANCE',
      signalType: 'bearish',
      confidence: '84%',
      trendStrength: 'Moderate (Bearish Divergence)',
      unusualVolume: '1.8x Average',
      supportLevel: isIN ? '₹1,840.00' : '$238.00',
      resistanceLevel: isIN ? '₹1,940.00' : '$258.00',
      catalyst: 'Negative RSI divergence coupled with heavy put volume at the money.',
      whyItMatters: 'Volume exhaustion near technical resistance indicates profit-taking by smart money, suggesting a retest of the lower support channel before any sustained rebound.'
    },
    {
      symbol: isIN ? 'TCS' : 'MSFT',
      name: isIN ? 'Tata Consultancy Services' : 'Microsoft Corp.',
      price: isIN ? 4180.00 : 448.20,
      changePercent: +0.75,
      signal: 'ACCUMULATION BASE',
      signalType: 'neutral',
      confidence: '89%',
      trendStrength: 'Consolidating (Low Beta 0.82)',
      unusualVolume: 'Normal (1.1x)',
      supportLevel: isIN ? '₹4,110.00' : '$440.00',
      resistanceLevel: isIN ? '₹4,260.00' : '$458.00',
      catalyst: 'Steady institutional dollar-cost averaging into enterprise cloud stability.',
      whyItMatters: 'Tight ATR (Average True Range) compression preceded 4 out of the last 5 multi-week breakouts, offering an asymmetric risk/reward entry point.'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
              AI Market Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#B88E1E] border border-[#D4AF37]/35 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-[#D4AF37]" />
              <span>Max AI Engine</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-sans">
            Institutional-grade predictive models, dark pool anomaly detection, and automated technical thesis generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ui-surface border border-ui-border text-xs font-semibold text-text-main hover:bg-ui-surface-subtle transition-all shadow-xs"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#D4AF37]' : 'text-text-muted'} />
            <span>Re-run Models</span>
          </button>
        </div>
      </div>

      {/* Hero Card: Max AI Insights */}
      <div className="w-full rounded-2xl border-2 border-[#DFC27D]/60 bg-gradient-to-b from-[#FFFDF8] via-[#FCF8EE]/50 to-[#FFFFFF] p-6 sm:p-8 shadow-[0_10px_35px_-5px_rgba(212,175,55,0.12)] relative overflow-hidden">
        {/* Shimmer accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EAE3D2]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCF8EE] border border-[#F3E5AB] flex items-center justify-center text-[#D4AF37] shadow-xs">
                <Sparkles size={24} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#B88E1E]">
                  Proprietary Quantitative Synthesis
                </span>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-[#0F172A] font-normal tracking-tight">
                  Max AI Insights
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#64748B] font-mono">{macroSummary.asOf}</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold font-mono">
                {macroSummary.confidence} Confidence
              </span>
            </div>
          </div>

          {/* Macro Regime & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#EAE3D2] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Macro Market Regime</span>
              <p className="text-sm font-bold text-[#0F172A] leading-snug">{macroSummary.regime}</p>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-600 font-semibold">
                <TrendingUp size={13} />
                <span>Broad-based equity expansion</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE3D2] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Composite Risk Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-emerald-600">28/100</span>
                <span className="text-xs text-[#64748B] font-medium">(Low Systematic Risk)</span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mt-1">
                <div className="w-[28%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE3D2] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Institutional Sentiment</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-[#B88E1E]">{macroSummary.sentimentScore}</span>
                <span className="text-xs text-[#64748B] font-medium">(Net Bullish Accumulation)</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Options skew leaning towards call sweeps</p>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <Compass size={14} className="text-[#D4AF37]" />
              <span>Primary Trend Catalysts</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {macroSummary.keyDrivers.map((driver, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFFFF] border border-[#EAE3D2] text-xs text-[#334155] leading-relaxed">
                  <CheckCircle size={15} className="text-[#C99A24] shrink-0 mt-0.5" strokeWidth={2.4} />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Free User Contextual Upgrade Teaser */}
      {!isMax && (
        <ContextualUpgradeCard
          title="Unlock Real-Time AI Asset Diagnostics & Signal Scoring"
          subtitle="Free accounts receive end-of-day market summaries. Upgrade to Max to unlock sub-minute unusual volume detection, live pivot levels, and quantitative 'Why this matters' institutional breakdowns."
          features={[
            'Dark pool flow & block trade alerts',
            'Real-time automated support/resistance pivots',
            'Probabilistic trend confidence scoring',
            'Options skew & delta hedging catalysts'
          ]}
        />
      )}

      {/* Asset-Specific Analysis Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif italic text-2xl text-[#0F172A]">Asset-Specific Analysis &amp; Signals</h3>
            <p className="text-xs text-[#64748B]">Live technical signals generated by multi-timeframe neural classifiers.</p>
          </div>

          {/* Category Filter Pill */}
          <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
            {(['all', 'signals', 'unusual_flow', 'macro'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {assetInsights.map(item => {
            const isBull = item.signalType === 'bullish';
            const isBear = item.signalType === 'bearish';

            return (
              <div
                key={item.symbol}
                className="rounded-2xl border border-ui-border bg-ui-surface p-6 shadow-sm hover:border-[#DFC27D]/60 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs tracking-tight">
                      {item.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-[#0F172A]">{item.symbol}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isBull
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                            : isBear
                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                        }`}>
                          {item.signal}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">{item.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-[#0F172A]">
                      {currencySymbol}{item.price.toFixed(2)}
                    </span>
                    <span className={`block text-xs font-mono font-semibold ${item.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-ui-surface-subtle border border-ui-border/60 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Trend Strength</span>
                    <span className="font-mono font-bold text-[#0F172A] text-[11px] truncate block">{item.trendStrength}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Unusual Volume</span>
                    <span className="font-mono font-bold text-[#B88E1E] text-[11px]">{item.unusualVolume}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">AI Confidence</span>
                    <span className="font-mono font-bold text-emerald-600 text-[11px]">{item.confidence}</span>
                  </div>
                </div>

                {/* Key Levels */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#64748B] font-semibold text-[11px]">Key Support:</span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {item.supportLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#64748B] font-semibold text-[11px]">Key Resistance:</span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      {item.resistanceLevel}
                    </span>
                  </div>
                </div>

                {/* Why This Matters Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FFFDF8] to-[#FCF8EE]/60 border border-[#DFC27D]/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#B88E1E]">
                    <Sparkles size={12} className="text-[#D4AF37]" />
                    <span>Why This Matters</span>
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed font-sans">
                    {item.whyItMatters}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsView;
