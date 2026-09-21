/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, ArrowRight, DollarSign, Coins } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { extractCashFlowAnalytics } from '../../services/aiAnalyticsAdapter.ts';
import { usePortfolio } from '../../contexts/PortfolioContext.tsx';

interface CashFlowIntelligenceSectionProps {
  contextPayload: AIWealthContextPayload;
  onAskCashFlowQuery: (query: string) => void;
}

export const CashFlowIntelligenceSection: React.FC<CashFlowIntelligenceSectionProps> = ({
  contextPayload,
  onAskCashFlowQuery,
}) => {
  const { profile } = usePortfolio();
  const [timeRange, setTimeRange] = useState<'6M' | '1Y'>('6M');

  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;
  const availCash = contextPayload.portfolioSummary.availableCash || 0;

  const cashFlow = React.useMemo(() => {
    return extractCashFlowAnalytics(
      profile.transactions || [],
      curVal,
      availCash,
      sym,
      timeRange
    );
  }, [profile.transactions, curVal, availCash, sym, timeRange]);

  const metrics = [
    { label: 'MONEY ADDED', value: `${sym}${cashFlow.moneyAdded.toLocaleString()}`, color: 'text-[#38BDF8]' },
    { label: 'INVESTMENTS', value: `${sym}${cashFlow.investments.toLocaleString()}`, color: 'text-[#D4AF37]' },
    { label: 'WITHDRAWALS', value: `${sym}${cashFlow.withdrawals.toLocaleString()}`, color: 'text-text-muted' },
    { label: 'DIVIDENDS', value: `${sym}${cashFlow.dividends.toLocaleString()}`, color: 'text-[#10B981]' },
    { label: 'INTEREST', value: `${sym}${cashFlow.interestIncome.toLocaleString()}`, color: 'text-[#10B981]' },
    { label: 'NET CASH FLOW', value: `${sym}${cashFlow.netCashFlow.toLocaleString()}`, color: 'text-[#F5E6BE]' },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[#D4AF37]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              CASH FLOW INTELLIGENCE
            </h3>
            <span className="text-[10px] text-text-muted">
              Liquidity Dynamics & Investment Run-Rate
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-[#070C16] p-1 rounded-xl border border-ui-border text-xs">
          {(['6M', '1Y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-[#D4AF37] text-[#0A0F1A]'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {metrics.map(m => (
          <div key={m.label} className="p-3 rounded-xl bg-[#070C16] border border-ui-border/60">
            <span className="text-[9px] font-bold uppercase text-text-muted tracking-wider block">
              {m.label}
            </span>
            <span className={`font-mono text-xs md:text-sm font-bold mt-1 block ${m.color}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="p-4 rounded-xl bg-[#070C16] border border-ui-border/60 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase">
          <span>Monthly Capital Deployed vs Money Added</span>
          <span className="text-[#D4AF37] font-mono">Actual Transaction History</span>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1629',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: number) => [`${sym}${val.toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="invested" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Invested" />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Explanation Box */}
      <div className="p-3.5 rounded-xl bg-[#070C16] border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#D4AF37] block">
            ✦ AI CASH FLOW SUMMARY
          </span>
          <p className="text-xs text-[#CBD5E1] font-medium leading-relaxed">
            "{cashFlow.aiNarrative}"
          </p>
        </div>

        <button
          onClick={() => onAskCashFlowQuery('Explain my cash flow patterns, liquidity buffers, and investment velocity in detail')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-xs font-bold text-[#F5E6BE] transition-all self-start sm:self-center shrink-0 active:scale-95"
        >
          <span>Deep Analysis</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
