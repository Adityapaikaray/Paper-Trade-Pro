/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, Loader2, Bot, ArrowRight, 
  ShieldCheck, RefreshCw, BarChart2, Layers, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { AIWealthContextPayload } from '../../services/aiWealthContextService.ts';
import { queryAIWealthManager, VisualAIResponse } from '../../services/aiConversationService.ts';

interface AskAICommandBarProps {
  contextPayload: AIWealthContextPayload;
  externalQueryTrigger?: string | null;
  onExecuteFollowUp?: (query: string) => void;
}

export const AskAICommandBar: React.FC<AskAICommandBarProps> = ({
  contextPayload,
  externalQueryTrigger,
  onExecuteFollowUp,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<VisualAIResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API if supported
  useEffect(() => {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputQuery(transcript);
            handleSubmit(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init error:', e);
      }
    }
  }, []);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Analyze My Portfolio', query: 'Analyze my complete portfolio performance, risk profile, and returns' },
    { label: 'Why Did My Wealth Change?', query: 'Why did my wealth change today and what were the main contributors?' },
    { label: 'Am I On Track For My Goals?', query: 'Am I on track for my goals and what monthly contribution is required?' },
    { label: 'Analyze My Allocation', query: 'Analyze my asset allocation across equities, cash, ETFs, and sectors' },
    { label: 'Project My Wealth', query: 'Project my wealth over 10 years with my current monthly contribution' },
    { label: 'Analyze My Investments', query: 'Analyze my recent investments, top holdings, and concentration' },
    { label: 'Analyze My Cash Flow', query: 'Analyze my cash flow, deposits, withdrawals, and liquidity reserves' },
    { label: 'Explain My Returns', query: 'Explain my lifetime investment returns and profit & loss vs index benchmark' },
  ];

  const handleSubmit = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery || isLoading) return;

    setIsLoading(true);
    setInputQuery('');

    const history = conversation.slice(0, 4).map(c => ({
      role: 'model' as const,
      text: `${c.headline} ${c.narrative}`,
    }));

    try {
      const response = await queryAIWealthManager(cleanQuery, contextPayload, history);
      setConversation(prev => [response, ...prev]);
    } catch (err) {
      console.warn('Error during query execution:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger when external action passes query
  useEffect(() => {
    if (externalQueryTrigger) {
      handleSubmit(externalQueryTrigger);
    }
  }, [externalQueryTrigger]);

  const sym = contextPayload.portfolioSummary.currencySymbol || '₹';

  return (
    <div className="space-y-4" id="ask-ai-command-container">
      {/* Central AI Command Bar Container */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0D1629] to-[#070C16] border border-[#D4AF37]/40 shadow-2xl p-4 md:p-5 transition-all focus-within:border-[#D4AF37]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] text-sm">✦</span>
            <label 
              htmlFor="ai-wealth-input"
              className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]"
            >
              ASK YOUR WEALTH MANAGER
            </label>
          </div>
          <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            CONTEXT AWARE
          </span>
        </div>

        {/* Large Input Box */}
        <div className="relative flex items-center">
          <input
            id="ai-wealth-input"
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSubmit(inputQuery);
              }
            }}
            placeholder="Ask about your portfolio, goals, investments or wealth..."
            className="w-full bg-[#070C16] border border-ui-border rounded-xl py-3.5 pl-4 pr-24 text-sm text-[#F8FAFC] placeholder-text-muted focus:outline-none focus:border-[#D4AF37] transition-all font-sans shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Mic button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeech}
                title={isListening ? 'Listening... click to stop' : 'Voice input'}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-[#EF4444] text-white animate-pulse'
                    : 'bg-ui-surface hover:bg-ui-surface-hover text-text-muted hover:text-[#D4AF37]'
                }`}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}

            {/* Send Button */}
            <button
              type="button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSubmit(inputQuery)}
              className="px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0F1A] font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-md active:scale-95"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin text-[#0A0F1A]" />
              ) : (
                <>
                  <span>Ask</span>
                  <Send size={12} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Intelligent Quick Prompts */}
        <div className="mt-3.5 pt-3 border-t border-ui-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Suggested Contextual Queries
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(p => (
              <button
                key={p.label}
                onClick={() => handleSubmit(p.query)}
                className="px-2.5 py-1 rounded-lg bg-[#070C16] hover:bg-[#101A2E] border border-ui-border hover:border-[#D4AF37]/50 text-[11px] font-semibold text-[#CBD5E1] hover:text-[#F5E6BE] transition-all active:scale-95 whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Thread: Visual Responses (Never giant text walls!) */}
      {conversation.length > 0 && (
        <div className="space-y-4 pt-1">
          {conversation.map(resp => (
            <div
              key={resp.id}
              className="rounded-2xl bg-[#0D1629] border border-ui-border/80 shadow-xl p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Query Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ui-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] text-xs">✦</span>
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    "{resp.query}"
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted">
                    {resp.timestamp}
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {resp.category}
                  </span>
                </div>
              </div>

              {/* Headline & Narrative */}
              <div>
                <h4 className="text-sm md:text-base font-bold text-[#F8FAFC] leading-snug">
                  {resp.headline}
                </h4>
                {resp.narrative && (
                  <p className="text-xs md:text-sm text-[#94A3B8] mt-1 leading-relaxed">
                    {resp.narrative}
                  </p>
                )}
              </div>

              {/* 1. Visual KPI Cards */}
              {resp.keyMetrics && resp.keyMetrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {resp.keyMetrics.map((km, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#070C16] border border-ui-border/60 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        {km.label}
                      </span>
                      <span
                        className={`text-sm md:text-base font-mono font-bold mt-1 ${
                          km.tone === 'positive'
                            ? 'text-[#10B981]'
                            : km.tone === 'negative'
                            ? 'text-[#EF4444]'
                            : 'text-[#F8FAFC]'
                        }`}
                      >
                        {km.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Visual Contributors Breakdown (e.g. Why did wealth change?) */}
              {resp.contributors && resp.contributors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#070C16] border border-ui-border/60 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider pb-1.5 border-b border-ui-border/40">
                    <span>CONTRIBUTORS</span>
                    <span>NET IMPACT</span>
                  </div>
                  <div className="space-y-1.5">
                    {resp.contributors.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span className="text-[#CBD5E1] font-medium">{c.name}</span>
                          {c.note && (
                            <span className="text-[10px] text-text-muted hidden sm:inline">
                              ({c.note})
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            c.tone === 'positive'
                              ? 'text-[#10B981]'
                              : c.tone === 'negative'
                              ? 'text-[#EF4444]'
                              : 'text-text-muted'
                          }`}
                        >
                          {c.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Factual & Transparent Breakdown (FACT / CALCULATION / ASSUMPTION / ILLUSTRATIVE SCENARIO) */}
              {resp.breakdown && resp.breakdown.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {resp.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#070C16] border border-ui-border/40 text-xs flex items-start gap-2.5"
                    >
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          item.type === 'FACT'
                            ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                            : item.type === 'CALCULATION'
                            ? 'bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30'
                            : item.type === 'ASSUMPTION'
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                            : 'bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold text-[#F8FAFC] mr-1.5">{item.title}:</span>
                        <span className="text-[#94A3B8]">{item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Smart Follow-Up Contextual Actions */}
              {resp.suggestedFollowUps && resp.suggestedFollowUps.length > 0 && (
                <div className="pt-2 border-t border-ui-border/50">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                    Follow-Up Actions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {resp.suggestedFollowUps.map((actionText, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onExecuteFollowUp) {
                            onExecuteFollowUp(actionText);
                          }
                          handleSubmit(actionText);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#070C16] hover:bg-[#101A2E] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[11px] font-semibold text-[#F5E6BE] transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>{actionText}</span>
                        <ChevronRight size={11} className="text-[#D4AF37]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Transparency Footer */}
              <div className="flex items-center justify-between text-[10px] text-text-muted pt-2 border-t border-ui-border/30">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className="text-[#D4AF37]" />
                  <span>ⓘ Based on TradePro data</span>
                </span>
                <span className="font-mono text-text-muted/80">
                  Sources: {resp.dataSources.join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
