/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Target, 
  Coins, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface WealthCommandMetricsProps {
  contextPayload: AIWealthContextPayload;
  onSelectMetric: (metricName: string, queryPrompt: string) => void;
}

export const WealthCommandMetrics: React.FC<WealthCommandMetricsProps> = ({
  contextPayload,
  onSelectMetric,
}) => {
  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;
  const invVal = contextPayload.portfolioSummary.investedValue || 0;
  const availCash = contextPayload.portfolioSummary.availableCash || 0;
  const totalPnl = contextPayload.portfolioSummary.totalGain || 0;
  const totalPnlPct = contextPayload.portfolioSummary.totalGainPercent || 0;
  const isPnlPositive = totalPnl >= 0;

  const todayGain = contextPayload.portfolioSummary.todayGain || 0;
  const todayGainPct = contextPayload.portfolioSummary.todayGainPercent || 0.51;
  const isTodayPositive = todayGain >= 0;

  // Goals
  const goals = contextPayload.goals || [];
  const onTrackCount = goals.filter(g => g.isOnTrack).length;
  const goalsText = `${onTrackCount} / ${goals.length || 1} ON TRACK`;

  // Investment income
  const investmentIncome = (contextPayload.cashFlow?.dividends || 0) + (contextPayload.cashFlow?.interestIncome || 0);

  const metrics = [
    {
      id: 'total-wealth',
      label: 'TOTAL WEALTH',
      value: `${sym}${curVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subBadge: `${isTodayPositive ? '+' : ''}${todayGainPct.toFixed(2)}% Today`,
      subBadgePositive: isTodayPositive,
      icon: Wallet,
      query: 'Explain my total wealth breakdown and today changes in detail',
    },
    {
      id: 'invested',
      label: 'INVESTED',
      value: `${sym}${invVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subBadge: `${contextPayload.holdings.length} Assets`,
      subBadgePositive: true,
      icon: DollarSign,
      query: 'Analyze my invested capital and cost basis across all holdings',
    },
    {
      id: 'available-cash',
      label: 'AVAILABLE CASH',
      value: `${sym}${availCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subBadge: 'Unallocated',
      subBadgePositive: true,
      icon: Coins,
      query: 'What is my current cash ratio and is there cash drag?',
    },
    {
      id: 'total-pnl',
      label: 'TOTAL P&L',
      value: `${isPnlPositive ? '+' : ''}${sym}${Math.abs(totalPnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subBadge: `${isPnlPositive ? '+' : ''}${totalPnlPct.toFixed(2)}% Lifetime`,
      subBadgePositive: isPnlPositive,
      icon: isPnlPositive ? TrendingUp : TrendingDown,
      query: 'Explain my lifetime investment returns and profit & loss',
    },
    {
      id: 'goals',
      label: 'GOALS',
      value: goalsText,
      subBadge: `${goals.length} Active Targets`,
      subBadgePositive: onTrackCount >= goals.length / 2,
      icon: Target,
      query: 'Am I on track for all my financial goals and what is the required monthly savings?',
    },
    {
      id: 'investment-income',
      label: 'INVESTMENT INCOME',
      value: `${sym}${investmentIncome.toLocaleString('en-IN')}`,
      subBadge: 'Dividends & Yield',
      subBadgePositive: true,
      icon: Coins,
      query: 'How much dividend and interest income am I generating from my investments?',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          COMMAND CENTER METRICS
        </span>
        <span className="text-[10px] text-text-muted flex items-center gap-1">
          <ShieldCheck size={11} className="text-[#D4AF37]" />
          <span>Click any card to analyze with AI</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMetric(m.label, m.query)}
              className="p-3.5 rounded-2xl bg-[#0D1629] hover:bg-[#101C35] border border-ui-border hover:border-[#D4AF37]/60 text-left transition-all group flex flex-col justify-between shadow-lg active:scale-[0.98] min-h-[92px]"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider group-hover:text-[#F5E6BE] transition-colors truncate">
                  {m.label}
                </span>
                <ArrowUpRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-all shrink-0 ml-1" />
              </div>

              <div className="font-mono text-sm md:text-base font-bold text-[#F8FAFC] truncate">
                {m.value}
              </div>

              <div className="mt-1 flex items-center justify-between">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  m.subBadgePositive ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                }`}>
                  {m.subBadge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
