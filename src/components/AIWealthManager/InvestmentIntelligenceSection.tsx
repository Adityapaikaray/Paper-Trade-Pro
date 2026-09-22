/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface InvestmentIntelligenceSectionProps {
  contextPayload: AIWealthContextPayload;
  onAskInvestmentQuery: (query: string) => void;
  onViewPortfolio?: () => void;
}

export const InvestmentIntelligenceSection: React.FC<InvestmentIntelligenceSectionProps> = ({
  contextPayload,
  onAskInvestmentQuery,
  onViewPortfolio,
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const c = contextPayload.canonicalSnapshot;

  const QUESTIONS = [
    { label: 'Why do I own HDFCBANK?', query: 'Why do I own HDFCBANK and what is its role in my portfolio?' },
    { label: 'Is my portfolio too concentrated?', query: 'Is my portfolio too concentrated with 55.4% in HDFCBANK?' },
    { label: 'Explain my technology exposure', query: 'Explain my technology holdings in INFY and TCS' },
  ];

  return (
    <div className="space-y-4">
      {/* Compact Top Holdings Table */}
      <div className="bg-[#070C16] border border-ui-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0D1629] text-text-muted text-[10px] font-bold uppercase tracking-wider border-b border-ui-border">
            <tr>
              <th className="py-2.5 px-4">Holding</th>
              <th className="py-2.5 px-4">Sector</th>
              <th className="py-2.5 px-4 text-right">Value</th>
              <th className="py-2.5 px-4 text-right">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ui-border/50">
            {c.topHoldings.map((h) => (
              <tr key={h.symbol} className="hover:bg-[#0D1629]/50 transition-colors">
                <td className="py-2.5 px-4 font-bold text-[#F8FAFC]">
                  {h.symbol}
                  <span className="text-[10px] font-normal text-text-muted ml-1.5 hidden sm:inline">
                    {h.name}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-text-muted">{h.sector}</td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-[#F8FAFC]">
                  {h.formattedValue}
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-[#D4AF37] font-semibold">
                  {h.formattedWeight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskInvestmentQuery('Explain my top holdings, concentration, and role of each position')}
            className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#F5E6BE] text-[#070C16] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Explain Holdings</span>
          </button>
          <button
            onClick={onViewPortfolio}
            className="px-3 py-1.5 rounded-lg bg-[#0D1629] hover:bg-[#1A2744] text-[#F8FAFC] border border-ui-border text-xs font-semibold transition-all flex items-center gap-1"
          >
            <span>View Portfolio</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Natural Language questions hidden behind toggle */}
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
        >
          <span>Ask about your investments</span>
          <ChevronRight size={13} className={`transition-transform ${showQuestions ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expandable Natural-Language questions */}
      {showQuestions && (
        <div className="p-3 rounded-xl bg-[#070C16] border border-ui-border/70 space-y-2 animate-fadeIn">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Suggested Investment Queries
          </span>
          <div className="flex flex-wrap gap-2">
            {QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onAskInvestmentQuery(q.query)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#0D1629] hover:bg-[#1A2744] text-[#CBD5E1] hover:text-[#F5E6BE] border border-ui-border transition-all flex items-center gap-1"
              >
                <Sparkles size={11} className="text-[#D4AF37]" />
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
