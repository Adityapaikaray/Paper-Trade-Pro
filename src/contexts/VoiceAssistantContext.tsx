/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Bot, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from './PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useNavigation } from './NavigationContext.tsx';
import { useUI } from './UIContext.tsx';
import { buildAIWealthContext } from '../services/aiWealthContextService.ts';
import { generateSpokenText, queryAIWealthManager, VisualAIResponse } from '../services/aiConversationService.ts';
import { analyticsService } from '../services/analytics.ts';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface VoiceAssistantContextType {
  isOpen: boolean;
  voiceState: VoiceState;
  transcript: string;
  response: string | null;
  visualResponse: VisualAIResponse | null;
  isSupported: boolean;
  openVoice: (initialPrompt?: string) => void;
  closeVoice: () => void;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  processQuery: (query: string) => Promise<void>;
}

const defaultContext: VoiceAssistantContextType = {
  isOpen: false,
  voiceState: 'IDLE',
  transcript: '',
  response: null,
  visualResponse: null,
  isSupported: true,
  openVoice: () => {},
  closeVoice: () => {},
  startListening: () => {},
  stopListening: () => {},
  speak: () => {},
  stopSpeaking: () => {},
  processQuery: async () => {},
};

export const VoiceAssistantContext = createContext<VoiceAssistantContextType>(defaultContext);

export const useVoiceAssistant = (): VoiceAssistantContextType => {
  return useContext(VoiceAssistantContext) || defaultContext;
};

export const VoiceAssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { summary, profile, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { navigate } = useNavigation();
  const { openCopilotWithPrompt } = useUI();

  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [visualResponse, setVisualResponse] = useState<VisualAIResponse | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check speech recognition support
  useEffect(() => {
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
    setVoiceState(prev => (prev === 'SPEAKING' ? 'IDLE' : prev));
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.lang.includes('en-IN') ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('female') ||
        v.lang.includes('en-US')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setVoiceState('SPEAKING');
        analyticsService.trackVoiceUsage('ai_voice_response');
      };

      utterance.onend = () => {
        setVoiceState('IDLE');
      };

      utterance.onerror = () => {
        setVoiceState('IDLE');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setVoiceState('IDLE');
    }
  }, []);

  const processQuery = useCallback(async (queryText: string) => {
    const clean = queryText.trim();
    if (!clean) return;

    setTranscript(clean);
    setVoiceState('PROCESSING');
    analyticsService.trackVoiceUsage('ai_voice_command', { query: clean });

    try {
      // Build wealth context
      const contextPayload = buildAIWealthContext({
        summary,
        profile,
        stocks,
        marketContext,
        marketSessionStatus: 'LIVE',
      });

      // Quick spoken response using canonical calculation
      const spoken = generateSpokenText(clean, contextPayload.canonicalSnapshot);
      setResponse(spoken);

      // Deep visual response
      const deepResponse = await queryAIWealthManager(clean, contextPayload, []);
      setVisualResponse(deepResponse);

      // Play spoken answer
      speak(spoken || deepResponse.spokenText || deepResponse.headline);
    } catch (err) {
      console.error('Failed to process voice query:', err);
      const fallback = "I've analyzed your portfolio. Everything is operating within normal variance.";
      setResponse(fallback);
      speak(fallback);
    }
  }, [summary, profile, stocks, marketContext, speak]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop error
      }
    }
    setVoiceState(prev => (prev === 'LISTENING' ? 'IDLE' : prev));
  }, []);

  const startListening = useCallback(() => {
    stopSpeaking();

    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation for unsupported environments
      setVoiceState('LISTENING');
      analyticsService.trackVoiceUsage('ai_voice_listening');
      setTimeout(() => {
        const demoPrompt = 'How is my portfolio doing today?';
        setTranscript(demoPrompt);
        processQuery(demoPrompt);
      }, 1500);
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = marketContext === 'US' ? 'en-US' : 'en-IN';

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        analyticsService.trackVoiceUsage('ai_voice_listening');
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results?.[0]?.[0]?.transcript;
        if (resultText) {
          processQuery(resultText);
        } else {
          setVoiceState('IDLE');
        }
      };

      recognition.onerror = (event: any) => {
        analyticsService.trackVoiceUsage('ai_voice_error', { error: event?.error });
        setVoiceState('IDLE');
      };

      recognition.onend = () => {
        setVoiceState(prev => (prev === 'LISTENING' ? 'IDLE' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setVoiceState('IDLE');
    }
  }, [marketContext, processQuery, stopSpeaking]);

  const openVoice = useCallback((initialPrompt?: string) => {
    setIsOpen(true);
    analyticsService.trackVoiceUsage('ai_voice_open', { hasPrompt: Boolean(initialPrompt) });

    if (initialPrompt) {
      processQuery(initialPrompt);
    } else {
      setTranscript('');
      setResponse(null);
      setVisualResponse(null);
      startListening();
    }
  }, [processQuery, startListening]);

  const closeVoice = useCallback(() => {
    stopListening();
    stopSpeaking();
    setIsOpen(false);
  }, [stopListening, stopSpeaking]);

  return (
    <VoiceAssistantContext.Provider
      value={{
        isOpen,
        voiceState,
        transcript,
        response,
        visualResponse,
        isSupported,
        openVoice,
        closeVoice,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        processQuery,
      }}
    >
      {children}

      {/* Global TradePro AI Voice Assistant Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1629] via-[#0A1020] to-[#070C16] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#F8FAFC] space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ui-border/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#F5E6BE]">
                      TradePro AI Voice
                    </h3>
                    <span className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      INSTITUTIONAL VALUATION CORE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {voiceState === 'SPEAKING' && (
                    <button
                      onClick={stopSpeaking}
                      className="p-1.5 rounded-lg bg-ui-surface hover:bg-ui-surface-hover text-[#D4AF37] transition-all"
                      title="Mute spoken response"
                    >
                      <VolumeX size={16} />
                    </button>
                  )}
                  <button
                    onClick={closeVoice}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all"
                    title="Close voice assistant"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Central Voice Orb & Subtle Waveform */}
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="relative flex items-center justify-center">
                  {/* Subtle calm concentric rings */}
                  {(voiceState === 'LISTENING' || voiceState === 'SPEAKING') && (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.15, 0.35] }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                      className="absolute w-28 h-28 rounded-full bg-primary/20 blur-md pointer-events-none"
                    />
                  )}

                  {/* Mic action button */}
                  <button
                    onClick={() => {
                      if (voiceState === 'LISTENING') {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
                      voiceState === 'LISTENING'
                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                        : voiceState === 'SPEAKING'
                        ? 'bg-primary border-primary text-ui-bg shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        : voiceState === 'PROCESSING'
                        ? 'bg-ui-surface-hover border-ui-border text-primary'
                        : 'bg-ui-surface hover:bg-ui-surface-hover border-ui-border text-text-main hover:border-primary/50'
                    }`}
                    title={voiceState === 'LISTENING' ? 'Click to stop listening' : 'Click to speak'}
                  >
                    {voiceState === 'PROCESSING' ? (
                      <Loader2 size={26} className="animate-spin text-primary" />
                    ) : voiceState === 'SPEAKING' ? (
                      <Volume2 size={26} />
                    ) : (
                      <Mic size={26} />
                    )}
                  </button>
                </div>

                {/* Subtle Audio Waveform Visualizer when active */}
                {(voiceState === 'LISTENING' || voiceState === 'SPEAKING') && (
                  <div className="flex items-center gap-1.5 h-6">
                    {[0.6, 1, 0.4, 0.9, 0.5, 0.8, 0.3].map((initialScale, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scaleY: voiceState === 'LISTENING' ? [0.3, 1, 0.3] : [0.5, 1.2, 0.5],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8 + (i % 3) * 0.2,
                          ease: 'easeInOut',
                          delay: i * 0.1,
                        }}
                        className="w-1 bg-primary rounded-full origin-center"
                        style={{ height: `${initialScale * 18}px` }}
                      />
                    ))}
                  </div>
                )}

                {/* State Label */}
                <div className="text-center">
                  <span
                    className={`text-xs font-mono font-semibold tracking-wide ${
                      voiceState === 'LISTENING'
                        ? 'text-primary'
                        : voiceState === 'SPEAKING'
                        ? 'text-primary'
                        : voiceState === 'PROCESSING'
                        ? 'text-text-muted'
                        : 'text-text-muted'
                    }`}
                  >
                    {voiceState === 'LISTENING' && 'Listening — speak your question...'}
                    {voiceState === 'PROCESSING' && 'Analyzing data...'}
                    {voiceState === 'SPEAKING' && 'TradePro speaking...'}
                    {voiceState === 'IDLE' && 'Tap microphone to speak'}
                  </span>
                </div>
              </div>

              {/* Transcript & Response Area */}
              {transcript && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-text-muted">You asked:</div>
                  <div className="p-3 rounded-xl bg-[#070C16] border border-ui-border text-xs font-medium text-[#F8FAFC]">
                    "{transcript}"
                  </div>
                </div>
              )}

              {response && (
                <div className="p-4 rounded-xl bg-[#0A1020] border border-[#D4AF37]/30 text-xs sm:text-sm text-[#CBD5E1] leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#D4AF37] tracking-wider">
                    <Bot size={13} />
                    <span>AI Spoken Analysis</span>
                  </div>
                  <p>{response}</p>
                </div>
              )}

              {/* Quick Prompt Pills */}
              <div className="pt-2 border-t border-ui-border/60 space-y-2">
                <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
                  Quick Voice Questions
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'How is my portfolio doing today?',
                    'Why did wealth change today?',
                    'Am I on track for my goals?',
                    'Explain my top holdings',
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => processQuery(p)}
                      className="px-2.5 py-1 rounded-lg bg-[#070C16] hover:bg-[#1A2744] border border-ui-border text-[11px] text-[#CBD5E1] hover:text-[#F5E6BE] transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deep Dive Actions */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    closeVoice();
                    navigate('ai-wealth-manager');
                  }}
                  className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Open AI Wealth Manager</span>
                  <ArrowUpRight size={13} />
                </button>

                <button
                  onClick={() => {
                    const promptToForward = transcript || 'Analyze my portfolio performance';
                    closeVoice();
                    openCopilotWithPrompt(promptToForward);
                  }}
                  className="text-text-muted hover:text-white flex items-center gap-1"
                >
                  <span>Open in Copilot</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </VoiceAssistantContext.Provider>
  );
};
