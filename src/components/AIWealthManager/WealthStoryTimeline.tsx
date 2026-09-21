/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, ShieldCheck, ArrowRight, CircleDot } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { buildWealthStoryEvents } from '../../services/aiAnalyticsAdapter.ts';
import { usePortfolio } from '../../contexts/PortfolioContext.tsx';

interface WealthStoryTimelineProps {
  contextPayload: AIWealthContextPayload;
  onAskTimelineQuery: (query: string) => void;
}

export const WealthStoryTimeline: React.FC<WealthStoryTimelineProps> = ({
  contextPayload,
  onAskTimelineQuery,
}) => {
  const { profile } = usePortfolio();
  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;

  const events = React.useMemo(() => {
    return buildWealthStoryEvents(profile.transactions || [], curVal, sym);
  }, [profile.transactions, curVal, sym]);

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#D4AF37]" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              YOUR WEALTH STORY
            </h3>
            <span className="text-[10px] text-text-muted">
              Factual Event Timeline • Verified TradePro Records
            </span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span>NO FABRICATED EVENTS</span>
        </span>
      </div>

      {/* Visual Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ui-border">
        {events.slice(0, 6).map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#070C16] border-2 border-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            </div>

            {/* Event Card */}
            <div className="p-3 rounded-xl bg-[#070C16] border border-ui-border/70 hover:border-[#D4AF37]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-[#D4AF37]">
                    {evt.date}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                      evt.tag === 'ACTUAL'
                        ? 'bg-[#10B981]/15 text-[#10B981]'
                        : 'bg-[#3B82F6]/15 text-[#60A5FA]'
                    }`}
                  >
                    {evt.tag}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#F8FAFC]">
                  {evt.title}
                </p>
              </div>

              <button
                onClick={() => onAskTimelineQuery(`Explain the financial impact of event: "${evt.title}"`)}
                className="text-[10px] text-[#D4AF37] hover:underline font-bold flex items-center gap-1 self-start sm:self-center"
              >
                <span>Analyze</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-ui-border/40 text-[10px] text-text-muted flex items-center justify-between">
        <span>Timeline synthesized chronologically from {events.length} ledger milestones.</span>
        <button
          onClick={() => onAskTimelineQuery('Explain my complete wealth milestone story from start to today')}
          className="text-[#D4AF37] hover:underline font-bold"
        >
          Full Story Analysis →
        </button>
      </div>
    </div>
  );
};
