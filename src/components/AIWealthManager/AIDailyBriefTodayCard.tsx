/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, TrendingUp, Briefcase, Target, 
  ArrowRight, Coins, History, ShieldCheck 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface AIDailyBriefTodayCardProps {
  contextPayload: AIWealthContextPayload;
  onAskSectionQuery: (query: string) => void;
}

export const AIDailyBriefTodayCard: React.FC<AIDailyBriefTodayCardProps> = ({
  contextPayload,
  onAskSectionQuery,
}) => {
  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;
  const todayGain = contextPayload.portfolioSummary.todayGain || 0;
  const todayGainPct = contextPayload.portfolioSummary.todayGainPercent || 0.51;
  const isUp = todayGain >= 0;

  const topHolding = contextPayload.holdings[0];
  const topGoal = contextPayload.goals[0];
  const totalIncome = (contextPayload.cashFlow?.dividends || 0) + (contextPayload.cashFlow?.interestIncome || 0);

  const sections = [
    {
      label: 'MARKET',
      detail: `Portfolio ${isUp ? '+' : ''}${todayGainPct.toFixed(2)}% vs ${contextPayload.marketContext.keyIndexName} +${contextPayload.marketContext.keyIndexChangePercent.toFixed(2)}%`,
      icon: TrendingUp,
      query: 'Compare my portfolio market return against benchmark',
    },
    {
      label: 'PORTFOLIO',
      detail: topHolding ? `Largest asset ${topHolding.symbol} valued at ${sym}${topHolding.currentValue.toLocaleString()}` : 'Distributed asset allocation',
      icon: Briefcase,
      query: 'Analyze my largest holdings and changes',
    },
    {
      label: 'GOALS',
      detail: topGoal ? `${topGoal.name} is ${topGoal.progressPercent.toFixed(0)}% funded toward ${topGoal.targetYear}` : 'Goals tracking on schedule',
      icon: Target,
      query: 'Review progress toward my primary goal',
    },
    {
      label: 'CASH FLOW',
      detail: `${sym}${contextPayload.portfolioSummary.availableCash.toLocaleString()} available liquidity`,
      icon: Coins,
      query: 'Explain my cash reserves and liquidity',
    },
    {
      label: 'INVESTMENTS',
      detail: `${contextPayload.holdings.length} active holdings across sectors`,
      icon: History,
      query: 'Analyze recent investment activity',
    },
    {
      label: 'INCOME',
      detail: `${sym}${totalIncome.toLocaleString()} estimated annual yield`,
      icon: Coins,
      query: 'How much dividend and interest income am I generating?',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-4 md:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-ui-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[#D4AF37] text-xs">✦</span>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
            TODAY WITH YOUR WEALTH
          </h3>
        </div>
        <span className="text-[10px] text-text-muted font-mono">
          DAILY DIGEST
        </span>
      </div>

      {/* Compact Rows */}
      <div className="space-y-1.5">
        {sections.map(sec => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.label}
              onClick={() => onAskSectionQuery(sec.query)}
              className="p-2 rounded-xl bg-[#070C16] hover:bg-[#101A2E] border border-ui-border/50 hover:border-[#D4AF37]/40 transition-all cursor-pointer flex items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase w-16 shrink-0">
                  {sec.label}
                </span>
                <span className="text-[11px] text-[#CBD5E1] group-hover:text-[#F8FAFC] truncate">
                  {sec.detail}
                </span>
              </div>
              <ArrowRight size={11} className="text-text-muted group-hover:text-[#D4AF37] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
