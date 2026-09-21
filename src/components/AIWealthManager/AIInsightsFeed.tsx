/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, Briefcase, Target, TrendingUp, Coins, 
  PieChart, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { generateContextualInsights, AIInsightItem } from '../../services/aiInsightService.ts';

interface AIInsightsFeedProps {
  contextPayload: AIWealthContextPayload;
  onSelectInsight: (query: string) => void;
}

export const AIInsightsFeed: React.FC<AIInsightsFeedProps> = ({
  contextPayload,
  onSelectInsight,
}) => {
  const insights = React.useMemo(() => {
    return generateContextualInsights(contextPayload);
  }, [contextPayload]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PORTFOLIO': return Briefcase;
      case 'GOAL': return Target;
      case 'CASH FLOW': return TrendingUp;
      case 'INCOME': return Coins;
      case 'ALLOCATION': return PieChart;
      default: return Sparkles;
    }
  };

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <span className="text-[#D4AF37] text-sm">✦</span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              AI INSIGHTS
            </h3>
            <span className="text-[10px] text-text-muted">
              Continuous Contextual Observations
            </span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
          <ShieldCheck size={12} className="text-[#10B981]" />
          <span>DATA GROUNDED</span>
        </span>
      </div>

      {/* Feed of Cards */}
      <div className="space-y-2.5">
        {insights.map(item => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#070C16] border border-ui-border/70 hover:border-[#D4AF37]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#0D1629] border border-ui-border/60 text-[#D4AF37] shrink-0 mt-0.5">
                  <Icon size={14} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
                      {item.category}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                        item.tag === 'ACTUAL'
                          ? 'bg-[#10B981]/15 text-[#10B981]'
                          : 'bg-[#3B82F6]/15 text-[#60A5FA]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] font-medium leading-relaxed">
                    "{item.insight}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectInsight(item.query)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#D4AF37]/20 border border-ui-border hover:border-[#D4AF37] text-xs font-bold text-[#F5E6BE] transition-all shrink-0 self-start sm:self-center active:scale-95"
              >
                <span>View Analysis</span>
                <ArrowRight size={12} className="text-[#D4AF37]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
