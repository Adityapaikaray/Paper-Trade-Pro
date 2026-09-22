/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, PieChart as PieIcon, BarChart3, 
  Activity, ShieldCheck, ArrowUpRight, BarChart2, Globe, Radio, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { TradeProAnalyticsDashboard } from './TradeProAnalyticsDashboard.tsx';

export const AnalyticsView: React.FC = () => {
  const { marketContext } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'system' | 'portfolio'>('system');
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  // Portfolio performance metrics
  const portfolioMetrics = [
    { label: 'TOTAL RETURN', value: '+9.94%', sub: '+₹1,42,680.25 total gain', positive: true, icon: TrendingUp },
    { label: 'WIN RATE', value: '72.4%', sub: '21 won of 29 filled trades', positive: true, icon: Target },
    { label: 'AVERAGE TRADE', value: `${currencySymbol}8,240.00`, sub: 'Average net profit per execution', positive: true, icon: Activity },
    { label: 'BEST TRADE', value: `+${currencySymbol}62,686.25`, sub: 'TITAN (7.54% gain)', positive: true, icon: Award },
    { label: 'WORST TRADE', value: `-${currencySymbol}4,120.00`, sub: 'Contained loss via stop', positive: false, icon: TrendingDown },
    { label: 'MAX DRAWDOWN', value: '-3.42%', sub: 'Within conservative risk tolerance', positive: true, icon: ShieldCheck },
    { label: 'PROFIT FACTOR', value: '2.84', sub: 'Gross Profit / Gross Loss', positive: true, icon: BarChart3 },
    { label: 'SHARPE RATIO', value: '1.92', sub: 'Risk-adjusted return rating', positive: true, icon: Award },
  ];

  // Growth historical data
  const growthData = [
    { date: 'Aug 15', value: 1435000 },
    { date: 'Aug 20', value: 1452000 },
    { date: 'Aug 25', value: 1448000 },
    { date: 'Aug 30', value: 1478000 },
    { date: 'Sep 05', value: 1512000 },
    { date: 'Sep 10', value: 1545000 },
    { date: 'Sep 13', value: 1578420 },
  ];

  // Sector breakdown
  const sectorData = [
    { name: 'Consumer Goods (TITAN)', value: 56.6, color: '#D4A72C' },
    { name: 'Energy & Telecom (RELIANCE)', value: 14.9, color: '#3B82F6' },
    { name: 'Information Tech (TCS, INFY)', value: 12.3, color: '#8B5CF6' },
    { name: 'Semiconductors (AMD, NVDA)', value: 10.5, color: '#00B887' },
    { name: 'Indices & Others', value: 5.7, color: '#F59E0B' },
  ];

  // Trade outcome distribution
  const outcomeData = [
    { name: 'Winning Trades', value: 21, color: '#00B887' },
    { name: 'Breakeven', value: 2, color: '#6E7C90' },
    { name: 'Losing Trades', value: 6, color: '#E15B5B' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-16 px-2 sm:px-4">
      {/* Top Segmented Switcher: TradePro Analytics vs Portfolio Quant Analytics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ui-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Analytics Suite</span>
            <span className="text-text-muted">/</span>
            <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">
              {activeTab === 'system' ? 'TradePro Website & Product' : 'Portfolio Quantitative'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-text-main tracking-tight mt-1">
            {activeTab === 'system' ? 'TradePro Analytics' : 'Portfolio Quantitative Analytics'}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            {activeTab === 'system' 
              ? 'Real-time website and product usage analytics across users, sessions, routes, funnels, and infrastructure.' 
              : 'Quantitative risk metrics, win-rate attribution, and capital deployment telemetry.'}
          </p>
        </div>

        <div className="flex items-center bg-[#070C16] p-1.5 rounded-2xl border border-ui-border shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('system')}
            id="tab-btn-system-analytics"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'system'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Radio size={14} className={activeTab === 'system' ? 'animate-pulse text-black' : 'text-text-muted'} />
            <span>Website & Product Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            id="tab-btn-portfolio-analytics"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-md'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <BarChart2 size={14} />
            <span>Portfolio Returns & Risk</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'system' ? (
        <TradeProAnalyticsDashboard />
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* Portfolio Analytics Sub-Header with Timeframes */}
          <div className="flex justify-end">
            <div className="flex items-center bg-ui-surface p-1 rounded-xl border border-ui-border shadow-2xs">
              {['1W', '1M', '3M', '6M', 'YTD', 'ALL'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTimeframe === tf
                      ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {portfolioMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-text-muted mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider">{m.label}</span>
                    <div className="w-7 h-7 rounded-lg bg-ui-bg flex items-center justify-center text-text-muted">
                      <Icon size={14} />
                    </div>
                  </div>
                  <div>
                    <p className={`text-2xl font-mono font-bold ${m.positive ? 'text-text-main' : 'text-negative'}`}>
                      {m.value}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1 font-medium">{m.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Rows */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Over Time (2 cols) */}
            <div className="lg:col-span-2 bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-sans text-text-main">Equity Curve Growth</h3>
                  <p className="text-xs text-text-muted">Net portfolio value progression over time</p>
                </div>
                <span className="text-xs font-mono font-bold text-positive bg-positive/10 px-2.5 py-1 rounded-md">
                  +₹1,42,680 (+9.94%)
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B887" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00B887" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ui-border)" vertical={false} opacity={0.6} />
                    <XAxis dataKey="date" stroke="#6E7C90" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#6E7C90"
                      fontSize={11}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--ui-surface)',
                        borderColor: 'var(--ui-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Portfolio Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00B887" strokeWidth={2.5} fill="url(#growthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trade Outcome Distribution (1 col) */}
            <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold font-sans text-text-main">Trade Win/Loss Split</h3>
                <p className="text-xs text-text-muted">Distribution of simulated trade outcomes</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--ui-surface)',
                        borderColor: 'var(--ui-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-ui-border text-xs">
                {outcomeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-text-muted">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-text-main">{item.value} trades</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Allocation Breakdown */}
          <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold font-sans text-text-main">Sector Concentration</h3>
              <p className="text-xs text-text-muted">Current capital distribution across industry sectors</p>
            </div>

            <div className="space-y-3">
              {sectorData.map((sec) => (
                <div key={sec.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-main">{sec.name}</span>
                    <span className="font-mono font-bold text-text-main">{sec.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-ui-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sec.value}%`, backgroundColor: sec.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
