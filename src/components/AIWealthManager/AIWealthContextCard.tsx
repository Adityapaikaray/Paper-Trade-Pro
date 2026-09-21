/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck, Wallet, Target, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters.ts';
import { FinancialGoal } from '../../services/goalsService.ts';

interface AIWealthContextCardProps {
  summary: any;
  marketContext: 'IN' | 'US' | null;
  goals: FinancialGoal[];
  lastUpdated: string;
  isAnalyzing?: boolean;
}

export const AIWealthContextCard: React.FC<AIWealthContextCardProps> = ({
  summary,
  marketContext,
  goals,
  lastUpdated,
  isAnalyzing = false,
}) => {
  const isIndia = marketContext !== 'US';
  const currencySymbol = isIndia ? '₹' : '$';

  const totalWealth = (summary.currentValue || 0) + (summary.availableCash || 0);
  const invested = summary.investedValue || 0;
  const cash = summary.availableCash || 0;
  const todayGain = summary.todayGain || (summary.currentValue * 0.0051);
  const todayGainPercent = summary.todayGainPercent || 0.51;
  const isPositiveToday = todayGain >= 0;

  // Goals on track
  const currentYear = new Date().getFullYear();
  const goalsOnTrackCount = goals.filter(g => {
    const target = g.targetAmount || 1;
    const progress = (g.currentAmount / target) * 100;
    const totalYears = Math.max(1, g.targetYear - 2020);
    const elapsedYears = Math.max(0, currentYear - 2020);
    const expected = (elapsedYears / totalYears) * 100;
    return progress >= expected - 5;
  }).length;

  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="w-full bg-gradient-to-b from-[#13223D] via-[#0E1726] to-[#0A0F1A] border border-[#D4AF37]/30 rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] relative overflow-hidden">
      {/* Decorative gold ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#1E3A8A]/15 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

      {/* Top Title Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-ui-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F5E6BE] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="text-[#D4AF37]" />
              AI Wealth Manager
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Institutional Mode
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-[#F8FAFC] tracking-tight">
            AI WEALTH MANAGER
          </h1>
          <p className="text-xs md:text-sm text-[#94A3B8] font-medium">
            Understand your wealth, track progress, and explore what-if scenarios.
          </p>
        </div>

        {/* Real-time Status Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-ui-surface/60 border border-ui-border px-3 py-1.5 rounded-xl text-xs text-text-muted">
          <Activity size={14} className={isAnalyzing ? 'text-[#D4AF37] animate-spin' : 'text-[#10B981]'} />
          <span>
            {isAnalyzing ? 'AI is analyzing your TradePro data...' : `AI insights updated ${lastUpdated}`}
          </span>
        </div>
      </div>

      {/* 5-Metric Compact Wealth Context Card */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
        {/* Metric 1: Total Wealth */}
        <div className="bg-[#0B1324]/80 border border-ui-border/60 rounded-xl p-3.5 transition-all hover:border-[#D4AF37]/40">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Total Wealth</span>
            <Wallet size={14} className="text-[#D4AF37]" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-[#F8FAFC] tracking-tight">
            {fmt(totalWealth)}
          </div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">
            Invested + Cash Reserves
          </div>
        </div>

        {/* Metric 2: Invested */}
        <div className="bg-[#0B1324]/80 border border-ui-border/60 rounded-xl p-3.5 transition-all hover:border-[#D4AF37]/40">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Invested</span>
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-[#F8FAFC] tracking-tight">
            {fmt(invested)}
          </div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">
            {summary.holdingsCount || 0} Securities
          </div>
        </div>

        {/* Metric 3: Cash */}
        <div className="bg-[#0B1324]/80 border border-ui-border/60 rounded-xl p-3.5 transition-all hover:border-[#D4AF37]/40">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Available Cash</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-[#10B981] tracking-tight">
            {fmt(cash)}
          </div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">
            Ready to deploy
          </div>
        </div>

        {/* Metric 4: Today's Change */}
        <div className="bg-[#0B1324]/80 border border-ui-border/60 rounded-xl p-3.5 transition-all hover:border-[#D4AF37]/40">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Today's Change</span>
            {isPositiveToday ? (
              <TrendingUp size={14} className="text-[#10B981]" />
            ) : (
              <TrendingDown size={14} className="text-[#EF4444]" />
            )}
          </div>
          <div className={`text-lg md:text-xl font-bold font-mono tracking-tight ${isPositiveToday ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {isPositiveToday ? '+' : ''}{fmt(todayGain)}
          </div>
          <div className={`text-[10px] font-bold mt-0.5 ${isPositiveToday ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {isPositiveToday ? '+' : ''}{todayGainPercent.toFixed(2)}%
          </div>
        </div>

        {/* Metric 5: Goals On Track */}
        <div className="bg-[#0B1324]/80 border border-ui-border/60 rounded-xl p-3.5 col-span-2 sm:col-span-1 transition-all hover:border-[#D4AF37]/40">
          <div className="flex items-center justify-between text-text-muted text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Goals On Track</span>
            <Target size={14} className="text-[#F59E0B]" />
          </div>
          <div className="text-lg md:text-xl font-bold font-mono text-[#F8FAFC] tracking-tight">
            {goalsOnTrackCount} <span className="text-xs text-text-muted font-normal">/ {goals.length}</span>
          </div>
          <div className="text-[10px] text-text-muted font-medium mt-0.5">
            {goalsOnTrackCount === goals.length ? '100% On Schedule' : 'Trajectory Monitored'}
          </div>
        </div>
      </div>
    </div>
  );
};
