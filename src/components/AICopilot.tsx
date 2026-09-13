import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';

export const AICopilot = () => {
  const { profile } = usePortfolio();
  const { stocks } = useMarketData();
  const { isCopilotOpen, setIsCopilotOpen } = useUI();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userText,
          context: { profile, stocks }
        })
      });

      if (!response.ok) throw new Error('Failed to fetch response');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't process your request right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isCopilotOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCopilotOpen(true)}
            className="fixed bottom-14 right-6 w-12 h-12 rounded-full bg-white dark:bg-[#1A1F29] text-text-main shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border border-ui-border"
            title="Chat / Support"
          >
            <MessageSquare size={20} strokeWidth={1.8} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCopilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-14 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] bg-ui-bg text-text-main rounded-[24px] shadow-2xl border border-ui-border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-ui-surface px-5 py-4 border-b border-ui-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center border border-primary">
                  <Bot size={16} className="text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-sans font-bold text-text-main tracking-wide leading-none">AI Portfolio Copilot</span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Terminal Active</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCopilotOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-ui-bg custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-left text-text-muted mt-2">
                  <p className="text-[13px] font-medium leading-relaxed">Welcome. I can provide intelligent insights, analyze your risk, and suggest opportunities based on your portfolio.</p>
                  <div className="mt-6 space-y-3">
                    {["Why is my portfolio up today?", "What are my biggest risks?", "Suggest next investment opportunities"].map(q => (
                      <button 
                        key={q} 
                        onClick={() => setInput(q)}
                        className="block w-full text-left text-[12px] font-medium bg-ui-surface border border-ui-border p-3.5 rounded-xl hover:border-primary/50 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all text-text-main group"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-ui-surface-hover border border-ui-border text-text-muted' : 'bg-ui-surface-hover border border-primary text-primary'}`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed max-w-[80%] ${m.role === 'user' ? 'bg-ui-surface-hover border border-ui-border text-text-main rounded-tr-sm' : 'bg-ui-surface border border-ui-border text-text-main rounded-tl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-ui-surface-hover border border-primary text-primary">
                    <Bot size={14} />
                  </div>
                  <div className="p-4 rounded-2xl text-sm bg-ui-surface border border-ui-border text-text-main rounded-tl-sm shadow-sm flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-ui-surface border-t border-ui-border shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Copilot..."
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-ui-bg border border-ui-border text-[13px] text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#A6822B] text-[#000000] hover:shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
