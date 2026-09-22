/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Bot, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

interface WealthCopilotSidePanelProps {
  contextPayload: AIWealthContextPayload;
  currentPageContext?: 'portfolio' | 'goals' | 'projection' | 'analytics' | 'investment' | 'general';
  onExecuteCopilotQuery: (query: string) => void;
}

export const WealthCopilotSidePanel: React.FC<WealthCopilotSidePanelProps> = ({
  contextPayload,
  currentPageContext = 'general',
  onExecuteCopilotQuery,
}) => {
  const [copilotInput, setCopilotInput] = useState('');
  const c = contextPayload.canonicalSnapshot;
  const market = c.marketSnapshot;

  // Context-aware dynamic Quick Actions per Section 19
  const getContextActions = () => {
    switch (currentPageContext) {
      case 'portfolio':
        return [
          { label: 'Analyze this portfolio', query: 'Analyze this portfolio concentration and risk' },
          { label: 'Explain concentration', query: 'Explain concentration in HDFCBANK at 55.4%' },
          { label: 'Explain sector exposure', query: 'Explain my exposure across Financials, Energy, and Tech' },
        ];
      case 'goals':
        return [
          { label: 'Analyze this goal', query: 'Analyze my retirement goal and funding pace' },
          { label: 'Review goals', query: 'Review all 4 financial goals and milestones' },
          { label: 'Explain required run-rate', query: 'Explain the required monthly contributions to reach my goals' },
        ];
      case 'projection':
        return [
          { label: 'Explain this projection', query: 'Explain this illustrative wealth projection model' },
          { label: 'Simulate higher SIP', query: 'What happens if I increase my monthly investment by 20%?' },
          { label: 'Explain compounding', query: 'Explain how compounding impacts my 10-year wealth path' },
        ];
      case 'analytics':
        return [
          { label: 'Explain this cash flow', query: 'Explain this cash flow and capital deployment' },
          { label: 'Analyze liquidity', query: 'Analyze my available cash balance and liquidity' },
          { label: 'Explain investment income', query: 'Explain my annual dividend and interest yield' },
        ];
      case 'investment':
        return [
          { label: 'Explain this holding', query: 'Explain my top holding HDFCBANK and its role' },
          { label: 'Explain tech allocation', query: 'Explain my technology holdings in INFY and TCS' },
          { label: 'Review cost basis', query: 'Analyze my cost basis and total P&L across holdings' },
        ];
      case 'general':
      default:
        return [
          { label: 'Analyze Portfolio', query: 'Analyze my complete portfolio performance, concentration, and risk' },
          { label: 'Review Goals', query: 'Review my active wealth goals and current progress' },
          { label: 'Explain Wealth Change', query: 'Explain why my wealth changed today and what moved it' },
        ];
    }
  };

  const contextTitleMap: Record<string, string> = {
    portfolio: 'Portfolio Intelligence',
    goals: 'Goal Intelligence',
    projection: 'AI What-If Lab',
    analytics: 'Cash Flow Intelligence',
    investment: 'Investment Intelligence',
    general: 'AI Wealth Manager',
  };

  const handleSend = () => {
    const text = copilotInput.trim();
    if (!text) return;
    onExecuteCopilotQuery(text);
    setCopilotInput('');
  };

  const quickActions = getContextActions();

  return (
    <div 
      id="tradepro-ai-copilot-sticky" 
      className="sticky top-20 rounded-2xl bg-[#0D1629] border border-ui-border shadow-xl p-4 md:p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ui-border">
        <div className="flex items-center gap-2">
          <span className="text-[#D4AF37] font-bold">✦</span>
          <h3 className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
            TRADEPRO AI COPILOT
          </h3>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
      </div>

      {/* Current Context */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold text-text-muted block">
          Current Context:
        </span>
        <div className="text-xs font-semibold text-[#F8FAFC] bg-[#070C16] border border-ui-border/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
          <span>{contextTitleMap[currentPageContext] || 'AI Wealth Manager'}</span>
          <span className="text-[9px] font-mono text-[#D4AF37]">LIVE</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-text-muted block">
          Quick Actions:
        </span>
        <div className="space-y-1.5">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onExecuteCopilotQuery(action.query)}
              className="w-full text-left px-3 py-2 rounded-lg bg-[#070C16] hover:bg-[#1A2744] border border-ui-border hover:border-[#D4AF37]/50 text-xs font-medium text-[#CBD5E1] hover:text-[#F5E6BE] transition-all flex items-center justify-between group"
            >
              <span>{action.label}</span>
              <Sparkles size={11} className="text-text-muted group-hover:text-[#D4AF37] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Ask Copilot Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative pt-1"
      >
        <div className="relative">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            placeholder="Ask Copilot..."
            className="w-full bg-[#070C16] border border-ui-border focus:border-[#D4AF37] text-xs text-[#F8FAFC] placeholder-text-muted rounded-xl pl-3 pr-9 py-2.5 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!copilotInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#D4AF37] disabled:opacity-30 hover:text-[#F5E6BE] transition-all"
          >
            <Send size={13} />
          </button>
        </div>
      </form>

      {/* Compact Market Section */}
      <div className="pt-3 border-t border-ui-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            MARKET
          </span>
          <span className="text-[9px] font-mono text-text-muted">
            {market.timestamp}
          </span>
        </div>

        <div className="bg-[#070C16] border border-ui-border/70 rounded-xl p-2.5 space-y-2">
          {market.indices.slice(0, 3).map((idx) => {
            const isPos = idx.changePercent >= 0;
            return (
              <div key={idx.key} className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#F8FAFC]">
                  {idx.displaySymbol}
                </span>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className={`font-bold ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
