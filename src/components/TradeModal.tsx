/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, TrendingUp, TrendingDown, Info, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stock } from '../types.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { getStockAnalysis } from '../services/geminiService.ts';

interface TradeModalProps {
  stock: Stock | null;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ stock, onClose }) => {
  const { profile, buyStock, sellStock } = usePortfolio();
  const [type, setType] = React.useState<'BUY' | 'SELL'>('BUY');
  const [sharesStr, setSharesStr] = React.useState('1');
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  if (!stock) return null;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await getStockAnalysis(stock);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const shares = parseInt(sharesStr) || 0;
  const total = stock.price * shares;
  const holding = profile.holdings.find(h => h.symbol === stock.symbol);
  const currentShares = holding?.shares || 0;

  const handleAction = () => {
    if (shares <= 0) {
      setMessage({ text: 'Please enter a valid amount of shares.', type: 'error' });
      return;
    }

    let success = false;
    if (type === 'BUY') {
      success = buyStock(stock, shares);
      if (!success) setMessage({ text: 'Insufficient balance to complete the trade.', type: 'error' });
    } else {
      success = sellStock(stock, shares);
      if (!success) setMessage({ text: 'Insufficient shares to complete the trade.', type: 'error' });
    }

    if (success) {
      setIsSuccess(true);
      setTimeout(onClose, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border-4 border-white relative"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-100"
              >
                <CheckCircle size={48} strokeWidth={3} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black text-indigo-950 tracking-tighter italic">Trade Confirmed</h2>
                <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  Successfully {type === 'BUY' ? 'purchased' : 'sold'} {shares} shares
                </p>
              </div>
              <div className="bg-slate-50 w-full p-6 rounded-3xl border border-slate-100 space-y-3 relative overflow-hidden">
                {[
                  { label: 'Symbol', value: stock.symbol, type: 'text' },
                  { label: 'Quantity', value: `${shares} Units`, type: 'text' },
                  { label: 'Execution Price', value: `${stock.currency}${stock.price.toLocaleString()}`, type: 'mono' },
                ].map((row, i) => (
                  <motion.div 
                    key={row.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"
                  >
                    <span>{row.label}</span>
                    <span className={`text-indigo-900 ${row.type === 'mono' ? 'font-mono italic' : ''}`}>{row.value}</span>
                  </motion.div>
                ))}
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="flex justify-between text-sm font-black uppercase tracking-widest text-slate-500 pt-3 border-t border-slate-200"
                >
                  <span>Total {type === 'BUY' ? 'Cost' : 'Credit'}</span>
                  <span className="text-indigo-600 font-mono italic relative">
                    {stock.currency}{total.toLocaleString()}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 0.3, 0], scale: [1, 1.8, 1] }}
                      transition={{ duration: 2, delay: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-400 blur-xl rounded-full -z-10"
                    />
                  </span>
                </motion.div>
              </div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                Transaction logged in blockchain simulation
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="p-8 border-b border-indigo-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg ${stock.change >= 0 ? 'bg-indigo-600 shadow-indigo-100' : 'bg-slate-900 shadow-slate-200'}`}>
                    {stock.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-indigo-950 tracking-tighter italic">{stock.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stock.symbol} • Global Exchange</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => setType('BUY')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'BUY' ? 'bg-white text-indigo-600 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    LONG (BUY)
                  </button>
                  <button 
                    onClick={() => setType('SELL')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${type === 'SELL' ? 'bg-white text-rose-500 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    SHORT (SELL)
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8 items-end border-b-2 border-slate-50 pb-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Quantity</label>
                      <input 
                        type="number"
                        value={sharesStr}
                        onChange={(e) => setSharesStr(e.target.value)}
                        className="bg-transparent text-5xl font-mono font-black italic text-indigo-950 block w-full focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="text-right space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Price</label>
                      <p className="text-3xl font-mono font-black italic tabular-nums text-slate-900">{stock.currency}{stock.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-6 py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Estimated Total</span>
                    <span className="text-2xl font-black font-mono italic text-indigo-600">{stock.currency}{total.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 ring-2 ring-indigo-50 ring-offset-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                        {stock.currency === '$' ? 'US Dollar Balance' : 'Indian Rupee Balance'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-indigo-950 font-black font-mono italic leading-none">{stock.currency}{(profile.balances[stock.currency] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Current Ownership</p>
                      <p className="text-indigo-950 font-black font-mono italic leading-none">{currentShares} Shares</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        <Info size={14} />
                      </div>
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {!analysis && !isAnalyzing ? (
                    <button 
                      onClick={handleAnalyze}
                      className="w-full py-3 bg-white border-2 border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                    >
                      <Sparkles size={16} />
                      Get AI Insight
                    </button>
                  ) : isAnalyzing ? (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center gap-3 italic">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Markets...</span>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-indigo-900 rounded-3xl text-white shadow-xl shadow-indigo-100 relative"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI Sentiment</span>
                      </div>
                      <p className="text-xs font-medium leading-relaxed italic opacity-90">"{analysis}"</p>
                    </motion.div>
                  )}
                </div>

                <button 
                  disabled={type === 'BUY' ? (profile.balances[stock.currency] || 0) < total : currentShares < shares}
                  onClick={handleAction}
                  className={`w-full py-6 rounded-[32px] font-black tracking-widest text-sm uppercase transition-all transform active:scale-95 shadow-xl disabled:opacity-30 disabled:grayscale ${
                    type === 'BUY' ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-rose-500 text-white shadow-rose-100'
                  }`}
                >
                  CONFIRM {type} TICKET
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
