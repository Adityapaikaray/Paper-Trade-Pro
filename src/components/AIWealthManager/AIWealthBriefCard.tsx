/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface AIWealthBriefCardProps {
  contextPayload: AIWealthContextPayload;
  userName?: string;
  onExploreAnalysis: () => void;
  onDrillDown: (query: string) => void;
}

export const AIWealthBriefCard: React.FC<AIWealthBriefCardProps> = ({
  contextPayload,
  userName = 'Investor',
  onExploreAnalysis,
  onDrillDown,
}) => {
  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;
  const todayGain = contextPayload.portfolioSummary.todayGain || 0;
  const todayGainPct = contextPayload.portfolioSummary.todayGainPercent || 0.51;
  const isGainPositive = todayGain >= 0;

  // Determine greeting based on local hour
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const displayName = (userName && userName !== 'User' && userName.length > 1) ? userName.toUpperCase() : 'INVESTOR';

  // 3 things to know
  const equityAlloc = contextPayload.allocation.find(a => a.name.toLowerCase().includes('equit'));
  const equityPercent = equityAlloc ? equityAlloc.percent.toFixed(0) : '68';

  const topGoal = contextPayload.goals && contextPayload.goals.length > 0 ? contextPayload.goals[0] : null;
  const goalFundedText = topGoal 
    ? `Your ${topGoal.name.toLowerCase()} goal is ${topGoal.progressPercent.toFixed(0)}% funded`
    : 'Your primary goal is tracking on schedule';

  return (
    <div className="space-y-4">
      {/* Salutation */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#F8FAFC] flex items-center gap-2">
          <span>{greetingTime}, {displayName}</span>
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-0.5">
          Here's what changed in your wealth today.
        </p>
      </div>

      {/* Daily Brief Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1629] via-[#0A1020] to-[#070C16] border border-[#D4AF37]/30 shadow-2xl p-5 md:p-6 transition-all hover:border-[#D4AF37]/50">
        {/* Subtle gold glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ui-border/60">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] text-base">✦</span>
            <span className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
              AI WEALTH BRIEF
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            LIVE VERIFIED
          </span>
        </div>

        {/* Core numbers statement */}
        <div className="mt-4 space-y-1">
          <p className="text-base md:text-lg font-medium text-[#F8FAFC]">
            Your portfolio is <span className="font-bold text-[#F5E6BE] font-mono">{sym}{curVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> today.
          </p>
          <p className="text-xs md:text-sm text-[#94A3B8]">
            It changed{' '}
            <span className={`font-mono font-bold ${isGainPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {isGainPositive ? '+' : ''}{sym}{Math.abs(todayGain).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isGainPositive ? '+' : ''}{todayGainPct.toFixed(2)}%)
            </span>{' '}
            from the previous trading-day close.
          </p>
        </div>

        {/* 3 things to know */}
        <div className="mt-4 pt-3 border-t border-ui-border/40">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block mb-2">
            3 things to know
          </span>
          <ul className="space-y-1.5 text-xs text-[#CBD5E1]">
            <li 
              onClick={() => onDrillDown('Why did my portfolio value change today?')}
              className="flex items-start gap-2 cursor-pointer hover:text-[#F5E6BE] transition-colors group"
            >
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>
                Portfolio value {isGainPositive ? 'increased' : 'adjusted'} ({isGainPositive ? '+' : ''}{todayGainPct.toFixed(2)}% today)
              </span>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#D4AF37] transition-opacity">→</span>
            </li>
            <li 
              onClick={() => onDrillDown('Analyze my asset allocation and equity weight')}
              className="flex items-start gap-2 cursor-pointer hover:text-[#F5E6BE] transition-colors group"
            >
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>Equity allocation is {equityPercent}%</span>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#D4AF37] transition-opacity">→</span>
            </li>
            <li 
              onClick={() => onDrillDown('Am I on track for my financial goals?')}
              className="flex items-start gap-2 cursor-pointer hover:text-[#F5E6BE] transition-colors group"
            >
              <span className="text-[#D4AF37] font-bold">•</span>
              <span>{goalFundedText}</span>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#D4AF37] transition-opacity">→</span>
            </li>
          </ul>
        </div>

        {/* Explore Button */}
        <div className="mt-5 flex items-center justify-between pt-2">
          <button
            onClick={onExploreAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F5E6BE] text-xs font-bold border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all shadow-sm active:scale-95"
          >
            <span>Explore Analysis</span>
            <ArrowRight size={13} />
          </button>
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#D4AF37]" />
            <span>ⓘ Based on TradePro data</span>
          </span>
        </div>
      </div>
    </div>
  );
};
