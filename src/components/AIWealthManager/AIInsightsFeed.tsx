/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface AIInsightsFeedProps {
  contextPayload: AIWealthContextPayload;
  onSelectInsight: (query: string) => void;
}

export const AIInsightsFeed: React.FC<AIInsightsFeedProps> = ({
  contextPayload,
  onSelectInsight,
}) => {
  const [showAll, setShowAll] = useState(false);
  const c = contextPayload.canonicalSnapshot;

  const extraInsights = [
    {
      id: 'ins-4',
      category: 'ALLOCATION' as const,
      text: 'Financials sector represents 55.4% of total equity holdings.',
      query: 'Explain my financial sector exposure',
      tag: 'ACTUAL' as const,
    },
    {
      id: 'ins-5',
      category: 'INCOME' as const,
      text: `Accrued ₹${c.investmentIncome.toLocaleString('en-IN')} in annual dividend & liquid interest yield.`,
      query: 'Show my dividend and investment income details',
      tag: 'CALCULATED' as const,
    },
  ];

  const displayedInsights = showAll ? [...c.insights, ...extraInsights] : c.insights;

  return (
    <div className="space-y-3">
      {/* 3 Most Relevant Insights */}
      <div className="space-y-2.5">
        {displayedInsights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-xl bg-[#070C16] border border-ui-border hover:border-[#D4AF37]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-wider">
                  {ins.category}
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                    ins.tag === 'ACTUAL'
                      ? 'bg-[#10B981]/15 text-[#10B981]'
                      : 'bg-[#3B82F6]/15 text-[#60A5FA]'
                  }`}
                >
                  {ins.tag}
                </span>
              </div>
              <p className="text-xs font-medium text-[#F8FAFC]">
                "{ins.text}"
              </p>
            </div>

            <button
              onClick={() => onSelectInsight(ins.query)}
              className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1 shrink-0 self-start sm:self-auto"
            >
              <span>View Analysis</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* View All Action */}
      <div className="pt-1 flex items-center justify-between">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-[#CBD5E1] hover:text-[#F5E6BE] font-semibold transition-colors"
        >
          {showAll ? 'Show Top 3 Insights Only' : 'View All Insights'}
        </button>
        <span className="text-[10px] text-text-muted">
          Continuous AI Surveillance
        </span>
      </div>
    </div>
  );
};
