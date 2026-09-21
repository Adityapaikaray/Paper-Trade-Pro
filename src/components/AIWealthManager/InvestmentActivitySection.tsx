/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { formatCurrency as globalFormatCurrency } from '../../utils/formatters.ts';

interface InvestmentActivitySectionProps {
  contextPayload: AIWealthContextPayload;
  marketContext: 'IN' | 'US' | null;
  onAskActivityQuery?: (query: string) => void;
}

export const InvestmentActivitySection: React.FC<InvestmentActivitySectionProps> = ({
  contextPayload,
  marketContext,
  onAskActivityQuery,
}) => {
  const { transactions, cashFlow, portfolioSummary } = contextPayload;
  const sym = portfolioSummary.currencySymbol;

  const fmt = (val: number) =>
    globalFormatCurrency(val, marketContext, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="bg-[#0D1629] border border-ui-border rounded-2xl p-5 md:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ui-border">
        <div>
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#D4AF37]" />
            <h2 className="text-base md:text-lg font-bold text-[#F8FAFC]">
              INVESTMENT ACTIVITY & CASH FLOW
            </h2>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Audit trail of orders, capital deployment, dividend accruals, and cash movements
          </p>
        </div>

        {/* Quick Activity Prompts */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {onAskActivityQuery && (
            <>
              <button
                onClick={() => onAskActivityQuery('What did I invest this month?')}
                className="text-[11px] px-2.5 py-1 rounded bg-[#070C16] hover:bg-[#101A2E] border border-ui-border hover:border-[#D4AF37]/40 text-[#CBD5E1] transition-all flex items-center gap-1"
              >
                <Sparkles size={11} className="text-[#D4AF37]" />
                <span>Invested this month?</span>
              </button>
              <button
                onClick={() => onAskActivityQuery('How much dividend income did I receive?')}
                className="text-[11px] px-2.5 py-1 rounded bg-[#070C16] hover:bg-[#101A2E] border border-ui-border hover:border-[#D4AF37]/40 text-[#CBD5E1] transition-all flex items-center gap-1"
              >
                <Sparkles size={11} className="text-[#D4AF37]" />
                <span>Dividend income?</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Cash Flow Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Total Working Capital
          </div>
          <div className="text-base font-bold font-mono text-[#F8FAFC] mt-0.5">
            {fmt(cashFlow.moneyAdded)}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">Deposits & Practice Funds</div>
        </div>

        <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Active Invested
          </div>
          <div className="text-base font-bold font-mono text-[#3B82F6] mt-0.5">
            {fmt(cashFlow.investments)}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">In Working Assets</div>
        </div>

        <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Estimated Yield
          </div>
          <div className="text-base font-bold font-mono text-[#10B981] mt-0.5">
            {fmt(cashFlow.dividends)}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">Annualized Passive Income</div>
        </div>

        <div className="bg-[#070C16] border border-ui-border p-3 rounded-xl">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Monthly Run-Rate
          </div>
          <div className="text-base font-bold font-mono text-[#D4AF37] mt-0.5">
            {fmt(cashFlow.averageMonthlyInvestment)}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">Average Contribution Pace</div>
        </div>
      </div>

      {/* Recent Executed Activity List */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold text-[#F8FAFC] mb-2.5">
          <span>Recent Execution Log (Chronological)</span>
          <span className="text-[10px] text-text-muted font-normal">
            {transactions.length > 0 ? `${transactions.length} Recorded Entries` : 'No Recent Trades'}
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {transactions.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#070C16] border border-ui-border/70 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold ${
                      tx.type === 'BUY'
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                        : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                    }`}
                  >
                    {tx.type === 'BUY' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[#F8FAFC]">
                      <span>{tx.type}</span>
                      <span>{tx.shares} shs of {tx.symbol}</span>
                    </div>
                    <div className="text-[10px] text-text-muted">
                      Executed at {fmt(tx.price)} • {tx.date}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-[#F8FAFC]">
                  {fmt(tx.totalValue)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#070C16] p-6 rounded-xl text-center text-xs text-text-muted border border-dashed border-ui-border">
            No executed market transactions recorded yet. Trade history will automatically synchronize here once orders are executed.
          </div>
        )}
      </div>
    </div>
  );
};
