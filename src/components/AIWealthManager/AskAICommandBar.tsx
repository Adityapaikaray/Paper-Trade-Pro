/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, Loader2, Bot, ArrowRight, 
  ShieldCheck, Volume2, VolumeX, CheckCircle2, ChevronRight 
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = contextPayload.canonicalSnapshot.marketRegion === 'US' ? 'en-US' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
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
  }, [contextPayload.canonicalSnapshot.marketRegion]);

  // Handle external triggers (e.g. from buttons on other cards)
  useEffect(() => {
    if (externalQueryTrigger) {
      handleSubmit(externalQueryTrigger);
    }
  }, [externalQueryTrigger]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      // Fallback prompt simulation if SpeechRecognition not supported in environment
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const demoPrompt = "How is my wealth doing?";
        setInputQuery(demoPrompt);
        handleSubmit(demoPrompt);
      }, 1500);
      return;
    }

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

  // Play soothing synthesized audio
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const soothingVoice = voices.find(v => 
        v.lang.includes('en-IN') || 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('natural') || 
        v.lang.includes('en-US')
      );
      if (soothingVoice) utterance.voice = soothingVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Exactly 4 Quick Action Prompts per Section 9
  const QUICK_PROMPTS = [
    { label: 'Analyze Portfolio', query: 'Analyze my portfolio concentration, asset allocation and holdings' },
    { label: 'Why Did Wealth Change?', query: 'Why did my wealth change today and what moved it?' },
    { label: 'Review Goals', query: 'Am I on track for my goals and what is my progress?' },
    { label: 'Project Wealth', query: 'Project my wealth over 10 years based on my monthly investments' },
  ];

  const handleSubmit = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery || isLoading) return;

    setIsLoading(true);
    setInputQuery('');

    try {
      const history = conversation.map(item => ({
        role: 'user' as const,
        text: item.query,
      }));

      const response = await queryAIWealthManager(cleanQuery, contextPayload, history);
      setConversation(prev => [response, ...prev.slice(0, 4)]);

      // If voice response is available, speak it calmly
      if (response.spokenText) {
        speakText(response.spokenText);
      }
    } catch (err) {
      console.error('AI Conversation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ask-tradepro-ai-section" className="space-y-4">
      {/* Command Bar Container */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0D1629] via-[#0A1020] to-[#070C16] border border-[#D4AF37]/35 shadow-xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#D4AF37] text-base">✦</span>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#F5E6BE]">
              ASK TRADEPRO AI
            </h2>
          </div>
          <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            CONTEXT AWARE
          </span>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(inputQuery);
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your portfolio, wealth, goals or investments..."
              className="w-full bg-[#070C16] border border-ui-border focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-[#F8FAFC] placeholder-text-muted rounded-xl pl-4 pr-12 py-3 transition-all outline-none"
            />
            {/* Voice Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Speak to TradePro AI'}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                isListening 
                  ? 'bg-[#EF4444] text-white animate-pulse' 
                  : 'text-text-muted hover:text-[#D4AF37] hover:bg-[#0D1629]'
              }`}
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Ask Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F5E6BE] disabled:opacity-40 disabled:hover:bg-[#D4AF37] text-[#070C16] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-md"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Ask</span>
                <Send size={13} />
              </>
            )}
          </button>
        </form>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1.5 rounded-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>● LISTENING — Speak your question...</span>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex items-center justify-between text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 size={14} className="animate-pulse" />
              <span>TradePro Voice is reading analysis...</span>
            </div>
            <button
              onClick={stopSpeaking}
              className="text-[10px] uppercase font-bold text-text-muted hover:text-white underline"
            >
              Stop
            </button>
          </div>
        )}

        {/* Exactly 4 Quick Actions per Section 9 */}
        <div className="pt-2 border-t border-ui-border/50">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSubmit(prompt.query)}
                className="px-3 py-1.5 rounded-lg bg-[#070C16] hover:bg-[#1A2744] border border-ui-border hover:border-[#D4AF37]/50 text-xs font-semibold text-[#CBD5E1] hover:text-[#F5E6BE] transition-all"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual AI Response Card */}
      {conversation.length > 0 && (
        <div className="space-y-4">
          {conversation.map((resp) => (
            <div
              key={resp.id}
              className="rounded-2xl bg-[#0D1629] border border-[#D4AF37]/40 shadow-2xl p-5 md:p-6 space-y-4 transition-all"
            >
              {/* Query & Timestamp Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ui-border">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                    <Bot size={15} />
                  </span>
                  <span className="text-xs font-bold text-[#F8FAFC]">
                    "{resp.query}"
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted">
                    {resp.timestamp}
                  </span>
                  {resp.spokenText && (
                    <button
                      onClick={() => speakText(resp.spokenText!)}
                      className="p-1 rounded hover:bg-[#070C16] text-text-muted hover:text-[#D4AF37]"
                      title="Play spoken analysis"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-sm sm:text-base font-bold text-[#F5E6BE] leading-snug">
                {resp.headline}
              </h3>

              {/* Narrative */}
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {resp.narrative}
              </p>

              {/* Key Metrics Grid */}
              {resp.keyMetrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {resp.keyMetrics.map((km, i) => (
                    <div
                      key={i}
                      className="bg-[#070C16] border border-ui-border rounded-xl p-3"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted block">
                        {km.label}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-black font-mono mt-0.5 block ${
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

              {/* Breakdown Points with Strict Data Labeling */}
              {resp.breakdown.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-ui-border/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block mb-1">
                    Verified Analysis & Observations
                  </span>
                  {resp.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#070C16]/70 border border-ui-border/60 flex items-start gap-2.5"
                    >
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          item.type === 'FACT'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : item.type === 'CALCULATION'
                            ? 'bg-[#3B82F6]/15 text-[#60A5FA]'
                            : item.type === 'ASSUMPTION'
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24]'
                            : 'bg-[#8B5CF6]/15 text-[#C084FC]'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div className="text-xs">
                        <span className="font-bold text-[#F8FAFC] mr-1.5">
                          {item.title}:
                        </span>
                        <span className="text-[#94A3B8]">
                          {item.detail}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {resp.suggestedFollowUps.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-text-muted mr-1">
                    Follow-up:
                  </span>
                  {resp.suggestedFollowUps.map((fu, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(fu)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#070C16] hover:bg-[#1A2744] text-[#CBD5E1] hover:text-[#F5E6BE] border border-ui-border transition-colors flex items-center gap-1"
                    >
                      <span>{fu}</span>
                      <ChevronRight size={11} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
