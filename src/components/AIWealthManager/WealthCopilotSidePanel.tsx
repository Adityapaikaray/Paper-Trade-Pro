/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, ShieldCheck, ArrowRight, 
  HelpCircle, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface WealthCopilotSidePanelProps {
  contextPayload: AIWealthContextPayload;
  currentPageContext?: 'portfolio' | 'holding' | 'goals' | 'analytics' | 'projection' | 'general';
  onExecuteCopilotQuery: (query: string) => void;
}

export const WealthCopilotSidePanel: React.FC<WealthCopilotSidePanelProps> = ({
  contextPayload,
  currentPageContext = 'general',
  onExecuteCopilotQuery,
}) => {
  const [copilotInput, setCopilotInput] = useState('');
  const [activeTab, setActiveTab] = useState<'copilot' | 'snapshot'>('copilot');

  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';
  const curVal = contextPayload.portfolioSummary.currentValue || 0;

  // Context-specific intelligent action prompts
  const CONTEXT_ACTIONS = {
    portfolio: [
      { label: 'Analyze this portfolio', query: 'Analyze my complete portfolio performance and risks' },
      { label: 'Show top gainers & losers', query: 'Which holdings are driving my gains and losses?' },
      { label: 'Check concentration', query: 'Analyze concentration in my largest positions' },
    ],
    holding: [
      { label: 'Explain this holding', query: 'Explain my largest holding and its investment thesis' },
      { label: 'Check position weight', query: 'What percentage of my wealth is in this holding?' },
    ],
    goals: [
      { label: 'Analyze this goal', query: 'Am I on track for my primary retirement and wealth goals?' },
      { label: 'Run savings run-rate check', query: 'Calculate required monthly contributions for all goals' },
    ],
    analytics: [
      { label: 'Explain this cash flow', query: 'Explain my cash inflows, investments, and net flow' },
      { label: 'Analyze contribution trend', query: 'Analyze my monthly investment contribution trend' },
    ],
    projection: [
      { label: 'Explain this projection', query: 'Explain the mathematical assumptions of my 10-year projection' },
      { label: 'Simulate higher SIP', query: 'What happens if I increase my monthly contribution by 20%?' },
    ],
    general: [
      { label: 'Analyze this portfolio', query: 'Analyze my overall portfolio health and balance' },
      { label: 'Explain this cash flow', query: 'Explain my cash movement and investment pace' },
      { label: 'Analyze this goal', query: 'Analyze my goal progress and funding velocity' },
      { label: 'Explain this projection', query: 'Explain my long-term illustrative projection' },
    ],
  }[currentPageContext] || [];

  const handleSend = () => {
    if (!copilotInput.trim()) return;
    onExecuteCopilotQuery(copilotInput.trim());
    setCopilotInput('');
  };

  return (
    <div className="rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-4 md:p-5 space-y-4">
      {/* Copilot Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Bot size={14} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F8FAFC]">
              WEALTH COPILOT
            </h3>
            <span className="text-[10px] text-text-muted">
              Persistent Institutional Assistant
            </span>
          </div>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
          ACTIVE
        </span>
      </div>

      {/* Context Indicator */}
      <div className="p-2.5 rounded-xl bg-[#070C16] border border-ui-border/60 text-xs flex items-center justify-between">
        <span className="text-text-muted text-[10px] uppercase font-bold">Current Focus:</span>
        <span className="font-semibold text-[#F5E6BE] text-[11px] capitalize">
          {currentPageContext} View
        </span>
      </div>

      {/* Instant Action Prompts */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
          Contextual Actions
        </span>
        {CONTEXT_ACTIONS.map(a => (
          <button
            key={a.label}
            onClick={() => onExecuteCopilotQuery(a.query)}
            className="w-full p-2.5 rounded-xl bg-[#070C16] hover:bg-[#101C35] border border-ui-border/70 hover:border-[#D4AF37]/50 text-left text-xs font-semibold text-[#CBD5E1] hover:text-[#F5E6BE] transition-all flex items-center justify-between group active:scale-[0.98]"
          >
            <span>{a.label}</span>
            <ChevronRight size={12} className="text-text-muted group-hover:text-[#D4AF37] transition-colors" />
          </button>
        ))}
      </div>

      {/* Copilot Input */}
      <div className="pt-2 border-t border-ui-border/40">
        <div className="relative flex items-center">
          <input
            type="text"
            value={copilotInput}
            onChange={e => setCopilotInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask Copilot..."
            className="w-full bg-[#070C16] border border-ui-border rounded-xl py-2 pl-3 pr-10 text-xs text-[#F8FAFC] placeholder-text-muted focus:outline-none focus:border-[#D4AF37] transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!copilotInput.trim()}
            className="absolute right-1.5 p-1.5 rounded-lg bg-[#D4AF37] text-[#0A0F1A] hover:bg-[#E5C158] transition-all disabled:opacity-40"
          >
            <Send size={11} />
          </button>
        </div>
      </div>

      {/* Privacy note */}
      <div className="text-[10px] text-text-muted flex items-center gap-1 pt-1">
        <ShieldCheck size={11} className="text-[#D4AF37]" />
        <span>Strictly isolated to your authenticated session</span>
      </div>
    </div>
  );
};
