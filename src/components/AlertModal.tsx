/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stock } from '../types.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface AlertModalProps {
  stock: Stock | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ stock, onClose }) => {
  const { addAlert } = usePortfolio();
  const [thresholdStr, setThresholdStr] = React.useState('');
  const [type, setType] = React.useState<'above' | 'below'>('above');

  if (!stock) return null;

  const handleSetAlert = () => {
    const threshold = parseFloat(thresholdStr);
    if (!isNaN(threshold)) {
      addAlert({
        symbol: stock.symbol,
        threshold,
        type,
        active: true
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-obsidian w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border border-ui-border relative shimmer"
      >
        <div className="p-10 border-b border-ui-border bg-midnight/30 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif italic text-text-dark tracking-tight">Sentinel Protocol</h2>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1">Price Trigger Surveillance</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-ui-border flex items-center justify-center text-slate-600 hover:text-primary transition-all shadow-sm">
            <X size={18} />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="p-6 bg-midnight rounded-[2rem] border border-ui-border flex items-center gap-6">
             <div className="w-12 h-12 bg-white/[0.02] border border-ui-border rounded-xl flex items-center justify-center font-serif italic text-primary text-xl">
               {stock.symbol.slice(0, 1)}
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Asset Designation</p>
                <p className="text-xl font-bold text-slate-200 tracking-tight">{stock.name} ({stock.symbol})</p>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] ml-4">Trigger Direction</label>
            <div className="flex bg-midnight p-1 rounded-2xl border border-ui-border">
              <button 
                onClick={() => setType('above')}
                className={`flex-1 py-3.5 rounded-xl font-black text-[9px] tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${type === 'above' ? 'bg-primary text-midnight shadow-lg' : 'text-slate-500 hover:text-primary'}`}
              >
                <TrendingUp size={14} /> ABOVE
              </button>
              <button 
                onClick={() => setType('below')}
                className={`flex-1 py-3.5 rounded-xl font-black text-[9px] tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${type === 'below' ? 'bg-white/10 text-slate-200 shadow-md' : 'text-slate-500 hover:text-primary'}`}
              >
                <TrendingDown size={14} /> BELOW
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end ml-4">
              <label className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">Threshold Signal</label>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic leading-none">Current: {stock.currency}{stock.price.toLocaleString()}</p>
            </div>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-mono font-black italic text-primary/30">{stock.currency}</span>
              <input 
                type="number"
                value={thresholdStr}
                onChange={(e) => setThresholdStr(e.target.value)}
                className="w-full bg-midnight/50 border border-ui-border rounded-3xl py-6 pl-14 pr-6 text-5xl font-mono font-black italic text-text-dark focus:outline-none focus:border-primary/50 transition-all tracking-tighter"
                autoFocus
              />
            </div>
          </div>

          <button 
            onClick={handleSetAlert}
            className="w-full py-6 bg-primary text-midnight rounded-[2.5rem] font-bold tracking-[0.4em] text-xs uppercase shadow-2xl transition-all duration-500 transform active:scale-95 border border-primary/50 shadow-primary/20"
          >
            Deploy Sentinel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AlertModal;
