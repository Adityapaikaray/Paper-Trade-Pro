import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, X, Send, User, Bot, Loader2, TrendingUp, 
  TrendingDown, CheckCircle2, AlertTriangle, ArrowRight, 
  Trash2, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';
import { Stock } from '../types.ts';

export interface CopilotTradeExecution {
  symbol: string;
  name: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalCost: number;
  currency: string;
  orderType: 'Market' | 'Limit';
  status: 'FILLED' | 'PENDING' | 'FAILED';
  errorMessage?: string;
  timestamp: number;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  trade?: CopilotTradeExecution;
  timestamp: number;
}

interface AICopilotProps {
  onNavigate?: (tab: string) => void;
  onOpenTrade?: (stock: Stock) => void;
}

// Common stock aliases for instant client-side matching
const STOCK_ALIASES: Record<string, string> = {
  apple: "AAPL",
  microsoft: "MSFT",
  google: "GOOGL",
  alphabet: "GOOGL",
  amazon: "AMZN",
  nvidia: "NVDA",
  meta: "META",
  facebook: "META",
  tesla: "TSLA",
  broadcom: "AVGO",
  costco: "COST",
  pepsi: "PEP",
  netflix: "NFLX",
  adobe: "ADBE",
  cisco: "CSCO",
  intel: "INTC",
  amd: "AMD",
  qualcomm: "QCOM",
  disney: "DIS",
  nike: "NKE",
  starbucks: "SBUX",
  exxon: "XOM",
  gold: "GOLD",
  silver: "SILVER",
  reliance: "RELIANCE",
  tcs: "TCS",
  infosys: "INFY",
  infy: "INFY",
  hdfc: "HDFCBANK",
  icici: "ICICIBANK",
  sbi: "SBIN",
  airtel: "BHARTIARTL",
  itc: "ITC",
  kotak: "KOTAKBANK",
  lt: "LT",
  axis: "AXISBANK",
  hul: "HINDUNILVR",
  tatamotors: "TATAMOTORS",
  "tata motors": "TATAMOTORS",
  maruti: "MARUTI",
  sunpharma: "SUNPHARMA",
  titan: "TITAN",
  bajfinance: "BAJFINANCE",
  asianpaint: "ASIANPAINT",
  wipro: "WIPRO",
  hcltech: "HCLTECH",
  tatasteel: "TATASTEEL",
  ongc: "ONGC"
};

export const AICopilot: React.FC<AICopilotProps> = ({ onNavigate, onOpenTrade }) => {
  const { profile, executeTrade, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { 
    isCopilotOpen, 
    setIsCopilotOpen, 
    copilotPrompt, 
    setCopilotPrompt, 
    addToast 
  } = useUI();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isIndia = marketContext === 'IN';
  const defaultCurrency = isIndia ? '₹' : '$';

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isCopilotOpen]);

  // Find a stock by symbol, name, or common alias
  const resolveStock = useCallback((query: string): Stock | undefined => {
    if (!query) return undefined;
    const clean = query.trim().toLowerCase();

    // 1. Check direct alias
    if (STOCK_ALIASES[clean]) {
      const aliasSym = STOCK_ALIASES[clean];
      const match = stocks.find(s => s.symbol.toUpperCase() === aliasSym.toUpperCase());
      if (match) return match;
    }

    // 2. Exact symbol match
    const exactSym = stocks.find(s => s.symbol.toLowerCase() === clean);
    if (exactSym) return exactSym;

    // 3. Exact company name match
    const exactName = stocks.find(s => s.name.toLowerCase() === clean);
    if (exactName) return exactName;

    // 4. Substring in symbol or name
    const subMatch = stocks.find(s => 
      s.symbol.toLowerCase().includes(clean) || 
      clean.includes(s.symbol.toLowerCase()) ||
      s.name.toLowerCase().includes(clean)
    );
    return subMatch;
  }, [stocks]);

  // Execute paper trade based on structured command
  const handleExecuteTrade = useCallback((tradeData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    orderType?: 'Market' | 'Limit';
    limitPrice?: number | null;
  }): CopilotTradeExecution => {
    const symbol = tradeData.symbol.toUpperCase();
    const side = tradeData.side === 'SELL' ? 'SELL' : 'BUY';
    const quantity = Math.max(1, Number(tradeData.quantity) || 1);
    const orderType = tradeData.orderType === 'Limit' ? 'Limit' : 'Market';
    const limitPrice = tradeData.limitPrice ? Number(tradeData.limitPrice) : undefined;

    const stock = resolveStock(symbol);

    if (!stock) {
      return {
        symbol,
        name: symbol,
        side,
        quantity,
        price: 0,
        totalCost: 0,
        currency: defaultCurrency,
        orderType,
        status: 'FAILED',
        errorMessage: `Asset "${symbol}" could not be resolved from active market data.`,
        timestamp: Date.now()
      };
    }

    const price = (orderType === 'Limit' && limitPrice) ? limitPrice : stock.price;
    const totalCost = price * quantity;
    const currency = stock.currency || (stock.country === 'India' ? '₹' : '$');

    try {
      executeTrade(stock, quantity, side, orderType, limitPrice);
      addToast(
        `Copilot placed: ${side} ${quantity} ${stock.symbol} @ ${currency}${price.toFixed(2)}`,
        'success',
        'Trade Filled'
      );

      return {
        symbol: stock.symbol,
        name: stock.name,
        side,
        quantity,
        price,
        totalCost,
        currency,
        orderType,
        status: orderType === 'Limit' ? 'PENDING' : 'FILLED',
        timestamp: Date.now()
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Trade order failed risk checks.';
      addToast(errorMsg, 'error', 'Trade Declined');
      return {
        symbol: stock.symbol,
        name: stock.name,
        side,
        quantity,
        price,
        totalCost,
        currency,
        orderType,
        status: 'FAILED',
        errorMessage: errorMsg,
        timestamp: Date.now()
      };
    }
  }, [stocks, resolveStock, executeTrade, addToast, defaultCurrency]);

  // Client-side fallback trade extraction in case server does not provide structured trade
  const parseClientTradeIntent = useCallback((prompt: string) => {
    const clean = prompt.toLowerCase();
    const isBuy = /\b(buy|purchase|acquire|get|order|long)\b/i.test(clean);
    const isSell = /\b(sell|dump|liquidate|dispose|exit|short)\b/i.test(clean);

    if (!isBuy && !isSell) return null;
    const side: 'BUY' | 'SELL' = isBuy ? 'BUY' : 'SELL';

    // Find stock target
    let targetStock: Stock | undefined = undefined;

    // Check alias keys
    for (const [alias, sym] of Object.entries(STOCK_ALIASES)) {
      if (new RegExp(`\\b${alias}\\b`, 'i').test(clean)) {
        targetStock = stocks.find(s => s.symbol.toUpperCase() === sym.toUpperCase());
        if (targetStock) break;
      }
    }

    // Check symbols and names
    if (!targetStock) {
      for (const s of stocks) {
        if (new RegExp(`\\b${s.symbol}\\b`, 'i').test(clean) || new RegExp(`\\b${s.name.replace(/[^a-zA-Z0-9 ]/g, '')}\\b`, 'i').test(clean)) {
          targetStock = s;
          break;
        }
      }
    }

    if (!targetStock) return null;

    // Quantity
    let quantity = 1;
    if (/\b(all|entire|everything)\b/i.test(clean) && isSell) {
      const holding = (profile.holdings || []).find(h => h.symbol.toUpperCase() === targetStock!.symbol.toUpperCase());
      quantity = holding && holding.shares > 0 ? holding.shares : 1;
    } else {
      const match = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:shares?|stocks?|units?|qty)?\b/);
      if (match && match[1]) {
        quantity = Math.max(1, Math.floor(parseFloat(match[1])));
      }
    }

    return {
      symbol: targetStock.symbol,
      side,
      quantity,
      orderType: 'Market' as const
    };
  }, [stocks, profile.holdings]);

  // Core send prompt function
  const sendPrompt = useCallback(async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: trimmed,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: trimmed,
          context: { profile, stocks, marketContext }
        })
      });

      let responseData: { text: string; trade?: any } = { text: "" };

      if (response.ok) {
        responseData = await response.json();
      } else {
        throw new Error('Server request failed');
      }

      // Check if structured trade is present
      let tradeResult: CopilotTradeExecution | undefined = undefined;

      if (responseData.trade && responseData.trade.symbol) {
        tradeResult = handleExecuteTrade(responseData.trade);
      } else {
        // Run client-side safety parser
        const clientParsed = parseClientTradeIntent(trimmed);
        if (clientParsed) {
          tradeResult = handleExecuteTrade(clientParsed);
        }
      }

      let finalText = responseData.text;
      if (!finalText) {
        if (tradeResult) {
          finalText = tradeResult.status === 'FILLED'
            ? `Successfully executed order: ${tradeResult.side} ${tradeResult.quantity} shares of ${tradeResult.name} (${tradeResult.symbol}) at ${tradeResult.currency}${tradeResult.price.toFixed(2)}.`
            : `Order could not be filled: ${tradeResult.errorMessage}`;
        } else {
          finalText = "I have processed your inquiry. Your portfolio is currently synchronized with active market rates.";
        }
      }

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'ai',
        text: finalText,
        trade: tradeResult,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.warn("Copilot fetch failed, running local executor fallback:", error);

      // Even if network or server fails, execute the trade locally if the prompt intended it
      const clientParsed = parseClientTradeIntent(trimmed);
      let tradeResult: CopilotTradeExecution | undefined = undefined;

      if (clientParsed) {
        tradeResult = handleExecuteTrade(clientParsed);
      }

      const fallbackText = tradeResult 
        ? (tradeResult.status === 'FILLED' 
            ? `Paper trade executed offline: ${tradeResult.side} ${tradeResult.quantity} shares of ${tradeResult.name} (${tradeResult.symbol}) at ${tradeResult.currency}${tradeResult.price.toFixed(2)}.`
            : `Trade declined: ${tradeResult.errorMessage}`)
        : "I'm ready to execute paper orders or analyze your portfolio. Try prompting: 'Buy 10 shares of Apple' or 'Sell 5 NVDA'.";

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'ai',
        text: fallbackText,
        trade: tradeResult,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, profile, stocks, marketContext, handleExecuteTrade, parseClientTradeIntent]);

  // Listen for copilotPrompt triggers (e.g. from Dashboard or Quick Prompts)
  useEffect(() => {
    if (copilotPrompt && isCopilotOpen) {
      const promptToRun = copilotPrompt;
      setCopilotPrompt(null);
      sendPrompt(promptToRun);
    }
  }, [copilotPrompt, isCopilotOpen, setCopilotPrompt, sendPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendPrompt(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Quick Action Prompts tailored for the active region
  const quickPrompts = isIndia ? [
    { label: "Buy 10 RELIANCE", prompt: "Buy 10 shares of Reliance (RELIANCE)" },
    { label: "Buy 5 TCS", prompt: "Buy 5 shares of TCS" },
    { label: "Buy 15 TITAN", prompt: "Buy 15 shares of Titan" },
    { label: "Sell 5 RELIANCE", prompt: "Sell 5 shares of Reliance" },
    { label: "Portfolio Risk", prompt: "What are my biggest portfolio risks?" },
  ] : [
    { label: "Buy 10 AAPL", prompt: "Buy 10 shares of Apple (AAPL)" },
    { label: "Buy 5 NVDA", prompt: "Buy 5 shares of NVIDIA (NVDA)" },
    { label: "Buy 8 MSFT", prompt: "Buy 8 shares of Microsoft (MSFT)" },
    { label: "Sell 5 AMD", prompt: "Sell 5 shares of AMD" },
    { label: "Portfolio Risk", prompt: "What are my biggest portfolio risks?" },
  ];

  return (
    <>
      <AnimatePresence>
        {!isCopilotOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCopilotOpen(true)}
            className="fixed bottom-14 right-6 w-13 h-13 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C9A227] to-[#A6822B] text-black shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 border border-white/20 group"
            title="Open AI Trading Copilot"
          >
            <Bot size={22} className="group-hover:rotate-6 transition-transform text-black stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#12141A] animate-pulse" />
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
            className="fixed bottom-12 right-4 md:right-6 w-[calc(100vw-32px)] sm:w-96 md:w-[420px] h-[580px] max-h-[85vh] bg-ui-bg text-text-main rounded-3xl shadow-2xl border border-ui-border flex flex-col z-50 overflow-hidden"
          >
            {/* Terminal Header */}
            <div className="bg-ui-surface px-5 py-3.5 border-b border-ui-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#A6822B] flex items-center justify-center text-black shadow-sm shrink-0">
                  <Bot size={18} className="stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-sans font-bold text-text-main tracking-wide leading-none">
                      TRADEPRO AI Copilot
                    </span>
                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded font-mono">
                      AUTONOMOUS
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted mt-0.5">
                    Prompt to buy & sell • Market intelligence
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button 
                    onClick={clearChat}
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors"
                    title="Clear history"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button 
                  onClick={() => setIsCopilotOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors"
                  title="Close Terminal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Trading Prompt Chips */}
            <div className="px-4 py-2 bg-ui-surface/60 border-b border-ui-border/70 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles size={10} className="text-primary" /> Prompts:
              </span>
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => sendPrompt(item.prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-[10px] font-medium whitespace-nowrap bg-ui-bg hover:bg-ui-surface-hover border border-ui-border text-text-main rounded-lg transition-all active:scale-95 shrink-0 hover:border-primary/50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ui-bg custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-left text-text-muted mt-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-ui-surface border border-ui-border/80 space-y-2">
                    <div className="flex items-center gap-2 text-text-main font-bold text-xs">
                      <Sparkles size={14} className="text-primary" />
                      <span>Natural Language Paper Trading Enabled</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-text-muted">
                      You can instruct me to execute paper trades directly through text. I analyze real-time market quotes and manage your virtual portfolio immediately.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      Try prompts like:
                    </p>
                    <div className="space-y-2">
                      {[
                        isIndia ? "Buy 10 shares of Reliance (RELIANCE)" : "Buy 10 shares of Apple (AAPL)",
                        isIndia ? "Buy 5 shares of TCS at market price" : "Buy 5 shares of NVIDIA (NVDA)",
                        isIndia ? "Sell 5 shares of Reliance" : "Sell 5 shares of AMD",
                        "What is my portfolio breakdown and risk?"
                      ].map((promptText, i) => (
                        <button
                          key={i}
                          onClick={() => sendPrompt(promptText)}
                          className="w-full text-left p-3 rounded-xl bg-ui-surface border border-ui-border text-[11px] font-medium text-text-main hover:border-primary/50 hover:bg-ui-surface-hover transition-all flex items-center justify-between group"
                        >
                          <span>"{promptText}"</span>
                          <ArrowRight size={12} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    m.role === 'user' 
                      ? 'bg-ui-surface-hover border border-ui-border text-text-muted' 
                      : 'bg-gradient-to-br from-[#D4AF37] to-[#A6822B] text-black shadow-sm'
                  }`}>
                    {m.role === 'user' ? <User size={13} /> : <Bot size={14} />}
                  </div>

                  <div className="flex flex-col gap-2 max-w-[85%]">
                    {/* Conversational Text */}
                    <div className={`p-3.5 rounded-2xl text-[12px] font-medium leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-primary/10 border border-primary/20 text-text-main rounded-tr-xs' 
                        : 'bg-ui-surface border border-ui-border text-text-main rounded-tl-xs'
                    }`}>
                      {m.text}
                    </div>

                    {/* Interactive Trade Execution Card */}
                    {m.trade && (
                      <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-2xl border text-xs overflow-hidden ${
                          m.trade.status === 'FILLED'
                            ? (m.trade.side === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30')
                            : 'bg-amber-500/5 border-amber-500/30'
                        }`}
                      >
                        {/* Status Ribbon */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {m.trade.status === 'FILLED' ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                m.trade.side === 'BUY' 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {m.trade.side === 'BUY' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                {m.trade.side} ORDER
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                <AlertTriangle size={11} />
                                {m.trade.status}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-text-muted">
                              {m.trade.orderType}
                            </span>
                          </div>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            m.trade.status === 'FILLED'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            {m.trade.status === 'FILLED' ? '✓ EXECUTED' : 'DECLINED'}
                          </span>
                        </div>

                        {/* Trade Details Header */}
                        <div className="flex items-center justify-between border-b border-ui-border/50 pb-2 mb-2">
                          <div>
                            <div className="font-bold text-[13px] text-text-main flex items-center gap-1.5">
                              <span>{m.trade.symbol}</span>
                              <span className="text-[11px] font-normal text-text-muted truncate max-w-[150px]">
                                {m.trade.name}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-[13px] text-text-main">
                              {m.trade.currency}{m.trade.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Order Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted mb-3">
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-text-muted">Shares</span>
                            <span className="font-semibold text-text-main">{m.trade.quantity} Units</span>
                          </div>
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-text-muted">Fill Price</span>
                            <span className="font-semibold text-text-main">{m.trade.currency}{m.trade.price.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Error message display if trade failed */}
                        {m.trade.errorMessage && (
                          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 mb-2 leading-relaxed">
                            {m.trade.errorMessage}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {m.trade.status === 'FILLED' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-ui-border/40">
                            {onNavigate && (
                              <button
                                onClick={() => onNavigate('portfolio')}
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-ui-surface hover:bg-ui-surface-hover border border-ui-border text-[10px] font-bold text-text-main transition-colors flex items-center justify-center gap-1"
                              >
                                View Portfolio <ExternalLink size={10} />
                              </button>
                            )}
                            {onOpenTrade && (
                              <button
                                onClick={() => {
                                  const s = resolveStock(m.trade!.symbol);
                                  if (s) onOpenTrade(s);
                                }}
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary transition-colors flex items-center justify-center gap-1"
                              >
                                Trade Ticket
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#D4AF37] to-[#A6822B] text-black">
                    <Bot size={14} />
                  </div>
                  <div className="p-3.5 rounded-2xl text-xs bg-ui-surface border border-ui-border text-text-main rounded-tl-xs shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span className="text-[11px] text-text-muted">Analyzing order &amp; calculating execution...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-ui-surface border-t border-ui-border shrink-0 space-y-1.5">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask copilot or prompt: 'Buy 10 Apple' / 'Sell 5 NVDA'..."
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-11 py-3 rounded-xl bg-ui-bg border border-ui-border text-[12px] text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#A6822B] text-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                  title="Execute prompt"
                >
                  <Send size={13} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-muted px-1">
                <span>Direct paper trade execution supported</span>
                <span className="font-mono">
                  Cash: {defaultCurrency}{profile.balances?.[defaultCurrency]?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '1,000,000'}
                </span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
