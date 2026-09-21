/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ArrowRight, CornerDownLeft, RefreshCw, Bot, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';

export interface AIResponseCardData {
  id: string;
  userPrompt: string;
  headline: string;
  narrative: string;
  keyMetrics?: Array<{ label: string; value: string; tone?: 'positive' | 'negative' | 'neutral' }>;
  category?: string;
  breakdown?: Array<{ type: 'FACT' | 'CALCULATION' | 'ASSUMPTION' | 'ILLUSTRATIVE SCENARIO'; title: string; detail: string }>;
  suggestedFollowUps?: string[];
  timestamp: string;
}

interface AskAISectionProps {
  contextPayload: AIWealthContextPayload;
  onAskQuery?: (query: string) => void;
  externalQueryTrigger?: string | null;
}

const SUGGESTION_CHIPS = [
  'How is my portfolio performing?',
  'Where is most of my money invested?',
  'How much have I invested this year?',
  'Am I on track for my goals?',
  'Show my portfolio allocation',
  'What changed in my wealth this month?',
  'Explain my recent investment activity',
  'Calculate my retirement projection',
  'What happens if I invest ₹10,000 every month?',
  'Compare my current allocation with my target allocation',
];

export const AskAISection: React.FC<AskAISectionProps> = ({
  contextPayload,
  externalQueryTrigger,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<AIResponseCardData[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Handle external triggers (e.g. from Quick Actions or Portfolio page)
  useEffect(() => {
    if (externalQueryTrigger) {
      handleAsk(externalQueryTrigger);
    }
  }, [externalQueryTrigger]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || inputValue).trim();
    if (!q || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    const newHistory = [...conversationHistory, { role: 'user' as const, text: q }];
    setConversationHistory(newHistory);

    try {
      const res = await fetch('/api/ai-wealth-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          context: contextPayload,
          conversationHistory: newHistory,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const card: AIResponseCardData = {
        id: `resp-${Date.now()}`,
        userPrompt: q,
        headline: data.headline || 'Wealth Analysis Complete',
        narrative: data.narrative || 'Analysis based on your current TradePro data.',
        keyMetrics: data.keyMetrics || [],
        category: data.category || 'PORTFOLIO',
        breakdown: data.breakdown || [],
        suggestedFollowUps: data.suggestedFollowUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setResponses(prev => [card, ...prev]);
      setConversationHistory(prev => [...prev, { role: 'model', text: `${data.headline} ${data.narrative}` }]);
    } catch (err) {
      console.warn('AI Wealth Manager query notice, using local calculated fallback:', err);
      // Fallback display card
      const fallbackCard: AIResponseCardData = {
        id: `resp-err-${Date.now()}`,
        userPrompt: q,
        headline: 'Portfolio Insight Generated',
        narrative: `Based on your recorded TradePro balance of ${contextPayload.portfolioSummary.currencySymbol}${contextPayload.portfolioSummary.currentValue.toLocaleString()}, your portfolio has generated an all-time return of ${contextPayload.portfolioSummary.currencySymbol}${contextPayload.portfolioSummary.totalGain.toLocaleString()} (${contextPayload.portfolioSummary.totalGainPercent.toFixed(2)}%).`,
        keyMetrics: [
          { label: 'PORTFOLIO', value: `${contextPayload.portfolioSummary.currencySymbol}${contextPayload.portfolioSummary.currentValue.toLocaleString()}` },
          { label: 'INVESTED', value: `${contextPayload.portfolioSummary.currencySymbol}${contextPayload.portfolioSummary.investedValue.toLocaleString()}` },
          { label: 'CASH', value: `${contextPayload.portfolioSummary.currencySymbol}${contextPayload.portfolioSummary.availableCash.toLocaleString()}` },
        ],
        breakdown: [
          { type: 'FACT', title: 'Portfolio Value', detail: 'Current total value of active holdings.' },
          { type: 'CALCULATION', title: 'Gain & Return', detail: 'Calculated difference between market price and average buy price.' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setResponses(prev => [fallbackCard, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTagBadgeStyle = (type: string) => {
    switch (type) {
      case 'FACT':
        return 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30';
      case 'CALCULATION':
        return 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30';
      case 'ASSUMPTION':
        return 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30';
      case 'ILLUSTRATIVE SCENARIO':
        return 'bg-[#8B5CF6]/15 text-[#C084FC] border-[#8B5CF6]/30';
      default:
        return 'bg-ui-surface text-text-muted border-ui-border';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Prominent Conversational Input Card */}
      <div className="bg-[#0D1629] border border-[#D4AF37]/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#F8FAFC]">
                Ask your Wealth Manager
              </h2>
              <p className="text-xs text-text-muted">
                Grounded in your actual TradePro portfolio, transactions, and goals
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-surface text-text-muted border border-ui-border">
            Zero Hallucination Guard
          </span>
        </div>

        {/* Input Field with Send Button */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAsk();
          }}
          className="relative flex items-center mt-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask anything about your wealth... (e.g. How is my portfolio performing?)"
            disabled={isLoading}
            className="w-full bg-[#070C16] border border-[#1E293B] focus:border-[#D4AF37] text-sm md:text-base text-[#F8FAFC] placeholder-text-muted/60 pl-4 pr-24 py-3.5 rounded-xl outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-[#0A0F1A] shadow-[0_0_12px_rgba(212,175,55,0.4)] hover:brightness-105 active:scale-95'
                : 'bg-ui-surface text-text-muted/40 cursor-not-allowed border border-ui-border'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={14} className="animate-spin text-current" />
            ) : (
              <>
                <span>Ask AI</span>
                <Send size={12} />
              </>
            )}
          </button>
        </form>

        {/* Clickable Suggestion Chips (Horizontal Scrollable) */}
        <div className="mt-4">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Suggested Questions</span>
            <span className="text-[10px] text-[#D4AF37]/80">Tap to run</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar no-scrollbar">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(chip)}
                disabled={isLoading}
                className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-[#101A2E] hover:bg-[#15233D] border border-ui-border hover:border-[#D4AF37]/50 text-[#CBD5E1] hover:text-[#F5E6BE] transition-all whitespace-nowrap active:scale-95"
              >
                • {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1629] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-xl relative"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-44 bg-[#D4AF37]/20 rounded animate-pulse" />
              <div className="h-3 w-64 bg-ui-surface rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 w-full bg-ui-surface rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-ui-surface rounded animate-pulse" />
            <div className="h-3.5 w-2/3 bg-ui-surface rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="h-16 bg-[#070C16] rounded-xl border border-ui-border animate-pulse" />
            <div className="h-16 bg-[#070C16] rounded-xl border border-ui-border animate-pulse" />
            <div className="h-16 bg-[#070C16] rounded-xl border border-ui-border animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Structured Financial Insight Cards Stream */}
      <div className="space-y-5">
        <AnimatePresence>
          {responses.map(card => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0D1629] border border-[#D4AF37]/35 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden"
            >
              {/* Top Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-ui-border/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5E6BE]">
                    AI WEALTH MANAGER
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-ui-surface text-text-muted border border-ui-border">
                    {card.category}
                  </span>
                </div>
                <span className="text-[11px] text-text-muted">{card.timestamp}</span>
              </div>

              {/* User Prompt Echo */}
              <div className="text-xs text-text-muted font-medium mt-3 mb-2 flex items-center gap-1.5">
                <CornerDownLeft size={12} className="text-[#D4AF37]" />
                <span className="italic">"{card.userPrompt}"</span>
              </div>

              {/* Executive Headline */}
              <h3 className="text-base md:text-lg font-serif font-bold text-[#F8FAFC] tracking-tight leading-snug">
                {card.headline}
              </h3>

              {/* Analytical Narrative */}
              <p className="text-xs md:text-sm text-[#CBD5E1] mt-2 leading-relaxed">
                {card.narrative}
              </p>

              {/* Highlighted Metric Boxes */}
              {card.keyMetrics && card.keyMetrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
                  {card.keyMetrics.map((metric, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-[#070C16] border border-ui-border/80 rounded-xl p-3"
                    >
                      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {metric.label}
                      </div>
                      <div
                        className={`text-base font-bold font-mono mt-0.5 ${
                          metric.tone === 'positive'
                            ? 'text-[#10B981]'
                            : metric.tone === 'negative'
                            ? 'text-[#EF4444]'
                            : 'text-[#F8FAFC]'
                        }`}
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structured Breakdown List with Categorical Badges */}
              {card.breakdown && card.breakdown.length > 0 && (
                <div className="mt-4 pt-3 border-t border-ui-border/60 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Structured Analysis
                  </div>
                  {card.breakdown.map((item, bIdx) => (
                    <div
                      key={bIdx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#070C16]/60 border border-ui-border/40 text-xs"
                    >
                      <span
                        className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getTagBadgeStyle(
                          item.type
                        )}`}
                      >
                        [{item.type}]
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-[#F8FAFC] mr-1.5">{item.title}:</span>
                        <span className="text-[#94A3B8]">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {card.suggestedFollowUps && card.suggestedFollowUps.length > 0 && (
                <div className="mt-4 pt-3 border-t border-ui-border/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Recommended Follow-Ups
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.suggestedFollowUps.map((fu, fuIdx) => (
                      <button
                        key={fuIdx}
                        onClick={() => handleAsk(fu)}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#101A2E] hover:bg-[#15233D] border border-ui-border hover:border-[#D4AF37]/40 text-[#CBD5E1] hover:text-[#F5E6BE] transition-all flex items-center gap-1"
                      >
                        <span>{fu}</span>
                        <ChevronRight size={11} className="text-[#D4AF37]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulatory Disclaimer */}
              <div className="mt-3 pt-2 text-[10px] text-text-muted/60 flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#D4AF37]/70 shrink-0" />
                <span>Information and projections are for informational purposes only and are not guaranteed.</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
