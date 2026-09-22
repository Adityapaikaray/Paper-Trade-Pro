/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface CashFlowIntelligenceSectionProps {
  contextPayload: AIWealthContextPayload;
  onAskCashFlowQuery?: (query: string) => void;
}

export const CashFlowIntelligenceSection: React.FC<CashFlowIntelligenceSectionProps> = ({
  contextPayload,
  onAskCashFlowQuery,
}) => {
  const [timeRange, setTimeRange] = useState<'6M' | '1Y' | '3Y' | 'ALL'>('6M');
  const c = contextPayload.canonicalSnapshot;

  const summaryMetrics = [
    { label: 'Money Added', value: c.cashFlow.formattedMoneyAdded, color: 'text-[#38BDF8]' },
    { label: 'Investments', value: c.cashFlow.formattedInvestments, color: 'text-[#D4AF37]' },
    { label: 'Withdrawals', value: c.cashFlow.formattedWithdrawals, color: 'text-text-muted' },
    { label: 'Investment Income', value: c.cashFlow.formattedInvestmentIncome, color: 'text-[#10B981]' },
    { label: 'Net Cash Flow', value: c.cashFlow.formattedNetCashFlow, color: 'text-[#F5E6BE]' },
  ];

  // Illustrative monthly chart points consistent with cash flow
  const chartData = [
    { month: 'Apr', invested: 150000, added: 150000 },
    { month: 'May', invested: 200000, added: 200000 },
    { month: 'Jun', invested: 180000, added: 180000 },
    { month: 'Jul', invested: 220000, added: 220000 },
    { month: 'Aug', invested: 140000, added: 140000 },
    { month: 'Sep', invested: 109532, added: 110000 },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {summaryMetrics.map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-[#070C16] border border-ui-border">
            <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
              {m.label}
            </span>
            <span className={`font-mono text-xs sm:text-sm font-bold mt-1 block ${m.color}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Chart with Period Selectors */}
      <div className="p-4 rounded-xl bg-[#070C16] border border-ui-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Monthly Capital Deployed
          </span>

          {/* Period Selectors: 6M, 1Y, 3Y, ALL */}
          <div className="flex items-center gap-1 bg-[#0D1629] p-1 rounded-lg border border-ui-border text-xs">
            {(['6M', '1Y', '3Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  timeRange === range
                    ? 'bg-[#D4AF37] text-[#070C16]'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0A0F1A] border border-ui-border p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                        <div className="font-bold text-[#F8FAFC]">{label}</div>
                        <div className="text-[#D4AF37] font-mono">
                          Deployed: ₹{(payload[0]?.value as number)?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="invested" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
