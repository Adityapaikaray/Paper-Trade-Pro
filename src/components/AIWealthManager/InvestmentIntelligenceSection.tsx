/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  PieChart, Layers, ShieldCheck, ArrowRight, 
  HelpCircle, ChevronRight, TrendingUp, DollarSign, Coins 
} from 'lucide-react';
import { AIWealthContextPayload, AIWealthHoldingContext } from '../../services/aiWealthContextService.ts';

interface InvestmentIntelligenceSectionProps {
  contextPayload: AIWealthContextPayload;
  onAskInvestmentQuery: (query: string) => void;
}

export const InvestmentIntelligenceSection: React.FC<InvestmentIntelligenceSectionProps> = ({
  contextPayload,
  onAskInvestmentQuery,
}) => {
  const [selectedHolding, setSelectedHolding] = useState<AIWealthHoldingContext | null>(
    contextPayload.holdings[0] || null
  );

  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const holdings = contextPayload.holdings || [];

  // Top holdings (sorted by value)
  const topHoldings = [...holdings].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);

  // Sector Exposure breakdown
  const sectorMap: Record<string, number> = {};
  holdings.forEach(h => {
    sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue;
  });
  const totalHoldingsVal = holdings.reduce((s, h) => s + h.currentValue, 0);

  // Natural language query templates for the selected holding or general
  const symOrTech = selectedHolding ? selectedHolding.symbol : 'technology';
  const NL_QUESTIONS = [
    {
      label: `Why do I own ${selectedHolding ? selectedHolding.symbol : 'this'}?`,
      query: `Why do I own ${selectedHolding ? selectedHolding.symbol : 'my largest holding'} and what is its role in my portfolio?`,
    },
    {
      label: `What percentage is ${selectedHolding ? selectedHolding.symbol : 'this'}?`,
      query: `What percentage of my portfolio is ${selectedHolding ? selectedHolding.symbol : 'my top asset'} and is it overweight?`,
    },
    {
      label: `How much invested in ${selectedHolding ? selectedHolding.symbol : 'this'}?`,
      query: `How much have I invested in ${selectedHolding ? selectedHolding.symbol : 'this holding'} and what is my cost basis?`,
    },
    {
      label: `Dividend from ${selectedHolding ? selectedHolding.symbol : 'this'}?`,
      query: `How much dividend did ${selectedHolding ? selectedHolding.symbol : 'my holdings'} generate?`,
    },
    {
      label: 'Show exposure to technology',
      query: 'Show my exposure to technology and all key sectors across holdings',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#D4AF37]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              INVESTMENT INTELLIGENCE
            </h3>
            <span className="text-[10px] text-text-muted">
              Holdings Deep-Dive & Natural Language Query Assistant
            </span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span>REAL ASSET LEVEL</span>
        </span>
      </div>

      {/* Natural Language Exploration Chips */}
      <div className="p-3.5 rounded-xl bg-[#070C16] border border-[#D4AF37]/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#F5E6BE] flex items-center gap-1.5">
            <span className="text-[#D4AF37]">✦</span>
            <span>Natural-Language Questions</span>
          </span>
          <span className="text-[10px] text-text-muted">
            Click any question to ask AI
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NL_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onAskInvestmentQuery(q.query)}
              className="px-2.5 py-1 rounded-lg bg-[#0D1629] hover:bg-[#101C35] border border-ui-border hover:border-[#D4AF37] text-xs font-semibold text-[#CBD5E1] hover:text-[#F5E6BE] transition-all flex items-center gap-1 active:scale-95"
            >
              <span>{q.label}</span>
              <ChevronRight size={11} className="text-[#D4AF37]" />
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Grid: Top Holdings & Sector Exposure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Holdings */}
        <div className="p-4 rounded-xl bg-[#070C16] border border-ui-border/60 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border/40">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              TOP HOLDINGS ({topHoldings.length})
            </span>
            <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
              WEIGHT %
            </span>
          </div>

          <div className="space-y-2">
            {topHoldings.map(h => {
              const isSelected = selectedHolding?.symbol === h.symbol;
              const isPnlPos = h.pnl >= 0;
              return (
                <div
                  key={h.symbol}
                  onClick={() => setSelectedHolding(h)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#101C35] border-[#D4AF37]'
                      : 'bg-[#0D1629] border-ui-border/50 hover:border-ui-border'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#F8FAFC]">
                        {h.symbol}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {h.shares} shs
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted block truncate max-w-[140px]">
                      {h.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#F8FAFC] block">
                      {sym}{h.currentValue.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold ${isPnlPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {isPnlPos ? '+' : ''}{h.pnlPercent.toFixed(1)}% ({h.weightPercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Exposure */}
        <div className="p-4 rounded-xl bg-[#070C16] border border-ui-border/60 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ui-border/40">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              SECTOR EXPOSURE
            </span>
            <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
              EQUITY SHARE
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(sectorMap).map(([sec, val]) => {
              const pct = totalHoldingsVal > 0 ? (val / totalHoldingsVal) * 100 : 0;
              return (
                <div key={sec} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#CBD5E1]">{sec}</span>
                    <span className="font-mono font-bold text-[#F8FAFC]">
                      {sym}{val.toLocaleString()} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-ui-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6BE] rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
