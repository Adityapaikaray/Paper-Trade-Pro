/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface AIWealthBriefCardProps {
  contextPayload: AIWealthContextPayload;
  onViewAnalysis: () => void;
  onAskAI: (query: string) => void;
}

export const AIWealthBriefCard: React.FC<AIWealthBriefCardProps> = ({
  contextPayload,
  onViewAnalysis,
  onAskAI,
}) => {
  const c = contextPayload.canonicalSnapshot;

  return (
    <div 
      id="ai-wealth-brief-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1629] via-[#0A1020] to-[#070C16] border border-[#D4AF37]/30 shadow-2xl p-6 transition-all hover:border-[#D4AF37]/50"
    >
      {/* Subtle gold glow in corner */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-ui-border/70">
        <div className="flex items-center gap-2">
          <span className="text-[#D4AF37] text-lg font-bold">✦</span>
          <span className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
            AI WEALTH BRIEF
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/25 text-[10px] font-mono font-bold text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>DATA VERIFIED</span>
        </div>
      </div>

      {/* Main Wealth Numbers */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Your Wealth & Today's Performance */}
        <div className="md:col-span-6 space-y-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted block">
              YOUR WEALTH
            </span>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-[#F8FAFC] tracking-tight mt-0.5">
              {c.formatted.portfolioValue}
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-sm sm:text-base font-bold font-mono text-[#10B981] flex items-center gap-1">
              <TrendingUp size={16} />
              {c.formatted.intradayGainLoss}
            </span>
            <span className="text-xs sm:text-sm font-semibold font-mono text-[#10B981]">
              {c.formatted.intradayReturn}
            </span>
            <span className="text-[10px] uppercase font-bold text-text-muted bg-[#070C16] px-2 py-0.5 rounded border border-ui-border">
              TODAY
            </span>
          </div>

          <div className="text-xs text-text-muted pt-1">
            <span className="text-[#94A3B8]">Reference: Previous trading-day close </span>
            <span className="font-mono font-medium text-[#CBD5E1]">{c.formatted.previousTradingDayClose}</span>
          </div>
        </div>

        {/* Right: Why It Moved (Top 2-3 contributors) */}
        <div className="md:col-span-6 bg-[#070C16]/90 border border-ui-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
              WHY IT MOVED
            </span>
            <span className="text-[9px] uppercase font-bold text-text-muted">
              Top Contributors
            </span>
          </div>

          {/* 3 Contributors */}
          <div className="grid grid-cols-3 gap-2">
            {c.whyItMoved.map((item) => (
              <div 
                key={item.symbol} 
                className="bg-[#0D1629] border border-ui-border/70 rounded-lg p-2 text-center"
              >
                <div className="text-[11px] font-bold text-[#F8FAFC]">{item.symbol}</div>
                <div className={`text-xs font-mono font-bold mt-0.5 ${item.direction === 'up' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {item.formattedChange}
                </div>
              </div>
            ))}
          </div>

          {/* Concise AI Summary */}
          <div className="pt-2 border-t border-ui-border/50 text-xs text-[#CBD5E1] italic">
            "{c.whyItMovedSummary}"
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-ui-border/60 flex flex-wrap items-center gap-3">
        <button
          onClick={onViewAnalysis}
          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F5E6BE] text-[#070C16] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <span>View Analysis</span>
          <ArrowUpRight size={14} />
        </button>
        <button
          onClick={() => onAskAI("Why did my portfolio move today?")}
          className="px-4 py-2 rounded-xl bg-[#0D1629] hover:bg-[#1A2744] text-[#F8FAFC] border border-ui-border text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Sparkles size={13} className="text-[#D4AF37]" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};
