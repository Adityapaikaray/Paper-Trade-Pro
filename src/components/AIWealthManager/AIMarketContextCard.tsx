/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, ShieldCheck, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface AIMarketContextCardProps {
  contextPayload: AIWealthContextPayload;
  onAskMarketQuery: (query: string) => void;
}

export const AIMarketContextCard: React.FC<AIMarketContextCardProps> = ({
  contextPayload,
  onAskMarketQuery,
}) => {
  const isIndia = contextPayload.marketContext.marketRegion === 'IN';
  const sessionStatus = contextPayload.marketContext.marketSessionStatus || 'LIVE';

  const indices = isIndia
    ? [
        { name: 'NIFTY 50', change: 0.42, isPositive: true },
        { name: 'SENSEX', change: 0.35, isPositive: true },
        { name: 'BANK NIFTY', change: -0.12, isPositive: false },
        { name: 'PORTFOLIO', change: 0.51, isPositive: true, isHighlight: true },
      ]
    : [
        { name: 'S&P 500', change: 0.38, isPositive: true },
        { name: 'NASDAQ', change: 0.45, isPositive: true },
        { name: 'DOW JONES', change: -0.08, isPositive: false },
        { name: 'PORTFOLIO', change: 0.51, isPositive: true, isHighlight: true },
      ];

  const primaryIndex = indices[0];
  const portfolioItem = indices.find(i => i.name === 'PORTFOLIO')!;

  const comparisonStatement = `Your portfolio changed +${portfolioItem.change.toFixed(2)}% today while ${primaryIndex.name} changed +${primaryIndex.change.toFixed(2)}%.`;

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-4 md:p-5 space-y-3.5">
      {/* Header with status badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-ui-border">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-[#D4AF37]" />
          <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
            MARKET CONTEXT
          </h3>
        </div>

        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
            sessionStatus === 'LIVE'
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
              : sessionStatus === 'DELAYED'
              ? 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30'
              : 'bg-ui-surface text-text-muted border-ui-border'
          }`}
        >
          {sessionStatus}
        </span>
      </div>

      {/* Grid of indices */}
      <div className="grid grid-cols-2 gap-2">
        {indices.map(idx => (
          <div
            key={idx.name}
            className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
              idx.isHighlight
                ? 'bg-[#101C35] border-[#D4AF37]/60'
                : 'bg-[#070C16] border-ui-border/60'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                idx.isHighlight ? 'text-[#F5E6BE]' : 'text-text-muted'
              }`}
            >
              {idx.name}
            </span>
            <span
              className={`font-mono font-bold mt-1 text-xs sm:text-sm ${
                idx.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
              }`}
            >
              {idx.isPositive ? '+' : ''}{idx.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Comparison Statement */}
      <div className="p-2.5 rounded-xl bg-[#070C16] border border-ui-border/60 text-xs">
        <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
          "{comparisonStatement}"
        </p>
      </div>

      {/* Action */}
      <button
        onClick={() => onAskMarketQuery(`How did the market movement in ${primaryIndex.name} affect my holdings today?`)}
        className="w-full py-1.5 rounded-lg bg-[#070C16] hover:bg-[#101A2E] border border-ui-border hover:border-[#D4AF37]/50 text-[11px] font-semibold text-[#F5E6BE] transition-all flex items-center justify-center gap-1"
      >
        <span>Analyze Relative Alpha</span>
        <ArrowUpRight size={11} className="text-[#D4AF37]" />
      </button>
    </div>
  );
};
