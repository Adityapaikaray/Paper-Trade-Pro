import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../contexts/MarketContext.tsx';

export const AICopilot = () => {
  const { profile } = usePortfolio();
  const { stocks } = useMarketData();
  const [isOpen, setIsOpen] = useState(false);
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
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-dark text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 border border-primary-light/30"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] max-h-[80vh] bg-white dark:bg-ui-surface text-black dark:text-text-main rounded-2xl shadow-2xl border border-ui-border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#D4AF37] px-4 py-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Bot size={20} />
                <span className="font-bold tracking-wide">TRADEPRO Copilot</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-ui-bg">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-text-muted mt-4">
                  <p className="text-sm">Ask me about your portfolio performance, risk, or diversification.</p>
                  <div className="mt-4 space-y-2">
                    {["Why is my portfolio down?", "How diversified am I?", "Show my best investments"].map(q => (
                      <button 
                        key={q} 
                        onClick={() => setInput(q)}
                        className="block w-full text-left text-xs bg-gray-50 dark:bg-ui-surface border border-gray-200 dark:border-ui-border p-2 rounded-lg hover:border-primary-dark hover:text-primary-dark transition-colors text-black dark:text-text-main"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-100 dark:bg-ui-surface border border-gray-200 dark:border-ui-border text-black dark:text-text-main' : 'bg-primary-dark text-white'}`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap max-w-[75%] ${m.role === 'user' ? 'bg-gray-100 dark:bg-ui-surface border border-gray-200 dark:border-ui-border text-black dark:text-text-main rounded-tr-sm' : 'bg-white dark:bg-ui-surface border border-gray-200 dark:border-ui-border text-black dark:text-text-main rounded-tl-sm shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary-dark text-white">
                    <Bot size={14} />
                  </div>
                  <div className="p-3 rounded-2xl text-sm bg-white dark:bg-ui-surface border border-gray-200 dark:border-ui-border text-black dark:text-text-main rounded-tl-sm shadow-sm">
                    <Loader2 size={16} className="animate-spin text-primary-dark" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-ui-surface border-t border-gray-200 dark:border-ui-border shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Copilot..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-ui-bg border border-gray-200 dark:border-ui-border text-sm text-black dark:text-text-main placeholder:text-gray-500 dark:placeholder:text-text-muted focus:outline-none focus:border-primary-dark transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-dark text-white rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:hover:bg-primary-dark"
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
