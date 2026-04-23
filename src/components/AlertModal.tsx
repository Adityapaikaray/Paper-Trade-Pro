/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Stock } from '../types.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface AlertModalProps {
  stock: Stock | null;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ stock, onClose }) => {
  const { addPriceAlert } = usePortfolio();
  const [threshold, setThreshold] = useState('');
  const [type, setType] = useState<'above' | 'below'>('above');

  if (!stock) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(threshold);
    if (!isNaN(val)) {
      addPriceAlert(stock.symbol, val, type);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm vibrant-card bg-white p-8 relative shadow-2xl overflow-hidden"
        >
          {/* Accent Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8 -z-10" />

          <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-indigo-600 transition-colors">
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-indigo-950 tracking-tighter italic">Price Alert</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stock.symbol} • {stock.name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('above')}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  type === 'above' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <ArrowUp size={24} className={type === 'above' ? 'animate-bounce' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">Price Goes Above</span>
              </button>
              <button
                type="button"
                onClick={() => setType('below')}
                className={`flex-1 py-4 px-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  type === 'below' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <ArrowDown size={24} className={type === 'below' ? 'animate-bounce' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">Price Goes Below</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2">Target Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={stock.price.toFixed(2)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-xl font-mono font-black placeholder:text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95"
            >
              Set Digital Sentinel
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal;
