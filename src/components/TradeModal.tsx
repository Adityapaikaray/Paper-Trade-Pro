/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Info, Sparkles, Loader2, CheckCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stock } from '../types.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { getStockAnalysis } from '../services/geminiService.ts';
import StockChart from './StockChart.tsx';

interface TradeModalProps {
  stock: Stock | null;
  onClose: () => void;
  onBack?: () => void;
}

import { ArrowLeft } from "lucide-react";

const TradeModal: React.FC<TradeModalProps> = ({ stock, onClose, onBack }) => {
  const { profile, buyStock, sellStock } = usePortfolio();
  const { stocks, priceTicks, isLive } = useMarketData();
  const [type, setType] = React.useState<'BUY' | 'SELL'>('BUY');
  const [sharesStr, setSharesStr] = React.useState('1');
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!stock) return null;

  // Always use the latest live stock data if available
  const liveStock = stocks.find(s => s.symbol === stock.symbol) || stock;
  const tick = priceTicks[liveStock.symbol];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await getStockAnalysis(liveStock);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const shares = parseInt(sharesStr) || 0;
  const total = liveStock.price * shares;
  const holding = (profile?.holdings || []).find(h => h.symbol === liveStock.symbol);
  const currentShares = holding?.shares || 0;

  const handleAction = () => {
    if (shares <= 0) {
      setMessage({ text: 'Please enter a valid amount of shares.', type: 'error' });
      return;
    }

    let success = false;
    if (type === 'BUY') {
      success = buyStock(liveStock, shares);
      if (!success) setMessage({ text: 'Insufficient balance to complete the trade.', type: 'error' });
    } else {
      success = sellStock(liveStock, shares);
      if (!success) setMessage({ text: 'Insufficient shares to complete the trade.', type: 'error' });
    }

    if (success) {
      setIsSuccess(true);
      setTimeout(onClose, 3000);
    }
  };

  // Calculate day range progress
  const dayLow = liveStock.dayLow ?? (liveStock.price * 0.985);
  const dayHigh = liveStock.dayHigh ?? (liveStock.price * 1.015);
  const rangeSpan = dayHigh - dayLow;
  const rangePercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((liveStock.price - dayLow) / rangeSpan) * 100)) : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-ui-surface w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-ui-border relative"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[450px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(197,160,89,0.2)]"
              >
                <CheckCircle size={48} strokeWidth={1} />
              </motion.div>
              <div>
                <h2 className="text-4xl font-serif italic text-text-main tracking-tight leading-none">Acquisition Validated</h2>
                <p className="text-[10px] font-black text-text-muted mt-4 uppercase tracking-[0.3em] italic">
                  Successfully logged {shares} units of {liveStock.symbol} at live market quote
                </p>
              </div>
              <div className="bg-ui-bg w-full p-8 rounded-[2.5rem] border border-ui-border space-y-4 relative overflow-hidden text-left">
                {[
                  { label: 'Asset Protocol', value: liveStock.symbol, type: 'text' },
                  { label: 'Volume Allocated', value: `${shares} Priority Units`, type: 'text' },
                  { label: 'Executed Quote', value: `${liveStock.currency}${liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, type: 'mono' },
                ].map((row, i) => (
                  <motion.div 
                    key={row.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted"
                  >
                    <span>{row.label}</span>
                    <span className={`text-text-main ${row.type === 'mono' ? 'font-mono italic text-primary' : 'font-bold'}`}>{row.value}</span>
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] text-text-muted pt-5 border-t border-ui-border"
                >
                  <span>Aggregate {type === 'BUY' ? 'Obligation' : 'Proceeds'}</span>
                  <span className="text-xl text-primary font-mono italic relative">
                    {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </motion.div>
              </div>
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] animate-pulse">
                Order Inscribed in Private Ledger • Real-Time Fill
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="p-10 border-b border-ui-border flex justify-between items-center bg-ui-bg/50">
                <div className="flex items-center gap-4">
                  {onBack && (
                    <button onClick={onBack} className="w-10 h-10 shrink-0 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm mr-2">
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-primary text-2xl font-serif italic shadow-2xl border border-primary/20 ${liveStock.change >= 0 ? 'bg-primary/5' : 'bg-ui-bg'}`}>
                    {liveStock.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-serif italic text-text-main tracking-tight">{liveStock.name}</h2>
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Quote
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1 italic">{liveStock.symbol} • {liveStock.country} • {liveStock.sector}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                {/* Long / Short Switch */}
                <div className="flex bg-ui-bg p-1 rounded-2xl border border-ui-border">
                  <button 
                    onClick={() => setType('BUY')}
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all duration-300 ${type === 'BUY' ? 'bg-primary text-ui-bg shadow-lg shadow-primary/20 scale-[1.02]' : 'text-text-muted hover:text-text-main'}`}
                  >
                    LONG ACQUISITION
                  </button>
                  <button 
                    onClick={() => setType('SELL')}
                    className={`flex-1 py-3.5 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all duration-300 ${type === 'SELL' ? 'bg-ui-surface text-text-main border border-ui-border shadow-md scale-[1.02]' : 'text-text-muted hover:text-text-main'}`}
                  >
                    SHORT DISPOSAL
                  </button>
                </div>

                {/* Real-Time Price & Day Range Section */}
                <div className="p-6 bg-ui-bg rounded-3xl border border-ui-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.25em]">Live Real-Time Price</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-black ${liveStock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                      {liveStock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{liveStock.change >= 0 ? '+' : ''}{liveStock.change.toFixed(2)} ({liveStock.changePercent}%)</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className={`text-4xl font-mono font-black italic tracking-tighter tabular-nums transition-all duration-300 ${
                      tick === 'up' 
                        ? 'text-emerald-400 scale-105' 
                        : tick === 'down' 
                        ? 'text-rose-400 scale-105' 
                        : 'text-text-main'
                    }`}>
                      {liveStock.currency}{liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    {liveStock.prevClose && (
                      <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">
                        Prev Close: {liveStock.currency}{liveStock.prevClose.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Day Range Bar */}
                  <div className="pt-2 border-t border-ui-border/60">
                    <div className="flex justify-between text-[8px] font-mono text-text-muted uppercase tracking-wider mb-1">
                      <span>Day Low: {liveStock.currency}{dayLow.toFixed(2)}</span>
                      <span className="font-bold text-text-main">Day Range</span>
                      <span>Day High: {liveStock.currency}{dayHigh.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-ui-surface rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-linear-to-r from-rose-400 via-primary to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${rangePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Real-time stock chart */}
                  <div className="pt-3 border-t border-ui-border/50">
                    <div className="flex items-center justify-between text-[8px] font-mono text-text-muted mb-1.5">
                      <span className="uppercase tracking-wider font-bold">Real-Time Stock Chart</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Feed
                      </span>
                    </div>
                    <div className="h-28 w-full bg-ui-surface/80 rounded-xl p-2 border border-ui-border/50">
                      <StockChart stock={liveStock} height={95} showDetails={true} showTimeframes={false} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8 items-end border-b border-ui-border pb-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-1">Shares to Order</label>
                      <input 
                        type="number"
                        min="1"
                        value={sharesStr}
                        onChange={(e) => setSharesStr(e.target.value)}
                        className="bg-transparent text-5xl font-mono font-black italic text-text-main block w-full focus:outline-none tracking-tighter"
                        autoFocus
                      />
                    </div>
                    <div className="text-right space-y-1">
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Estimated Total</label>
                      <p className="text-2xl font-mono font-black italic tabular-nums text-primary">
                        {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border">
                      <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5">Available Virtual Cash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-text-main font-black font-mono italic text-base leading-none">
                          {liveStock.currency}{(profile?.balances?.[liveStock.currency] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="p-5 bg-ui-bg rounded-2xl border border-ui-border">
                      <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5">Current Position</p>
                      <p className="text-text-main font-black font-mono italic text-base leading-none">{currentShares} Shares Held</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border shadow-xl ${message.type === 'success' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}`}
                    >
                      <Info size={16} className="shrink-0" />
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {!analysis && !isAnalyzing ? (
                    <button 
                      onClick={handleAnalyze}
                      className="w-full py-3.5 bg-ui-bg border border-ui-border text-text-muted rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-ui-surface hover:border-primary/30 hover:text-primary transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                    >
                      <Sparkles size={15} />
                      Request AI Market Intelligence
                    </button>
                  ) : isAnalyzing ? (
                    <div className="p-6 bg-ui-bg rounded-2xl border border-ui-border flex items-center justify-center gap-3 italic">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Synthesizing Real-Time Pulse...</span>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-primary/5 border border-primary/20 rounded-2xl text-text-main shadow-xl relative"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Institutional Sentiment Synthesis</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed italic opacity-90 pr-2 border-l-2 border-primary/30 pl-3">"{analysis}"</p>
                    </motion.div>
                  )}
                </div>

                <button 
                  disabled={type === 'BUY' ? (profile?.balances?.[liveStock.currency] || 0) < total : currentShares < shares}
                  onClick={handleAction}
                  className={`w-full py-5 rounded-2xl font-black tracking-[0.3em] text-xs uppercase transition-all duration-300 transform active:scale-95 shadow-2xl border disabled:opacity-20 disabled:grayscale ${
                    type === 'BUY' 
                      ? 'bg-primary text-ui-bg border-primary/50 shadow-primary/20 hover:brightness-110' 
                      : 'bg-ui-bg text-text-main border-ui-border shadow-lg hover:border-rose-400/50 hover:text-rose-400'
                  }`}
                >
                  CONFIRM VIRTUAL {type} • {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  {type === 'BUY' ? <div className="text-[8px] font-sans font-medium text-ui-bg/70 tracking-wider mt-1.5 normal-case tracking-normal">Virtual order — no real money involved</div> : <div className="text-[8px] font-sans font-medium text-text-muted tracking-wider mt-1.5 normal-case tracking-normal">Virtual order — no real money involved</div>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default TradeModal;
