/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';
import StockChart from './StockChart.tsx';

interface PortfolioViewProps {
  onTrade: (stock: Stock) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ onTrade }) => {
  const { profile } = usePortfolio();
  const stocks = useMarketData();

  const holdingsWithData = profile.holdings.map(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    const currentPrice = stock?.price || holding.averagePrice;
    const profit = (currentPrice - holding.averagePrice) * holding.shares;
    const profitPercent = ((currentPrice / holding.averagePrice) - 1) * 100;
    const value = currentPrice * holding.shares;
    
    return { ...holding, stock, currentPrice, profit, profitPercent, value };
  });

  if (profile.holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-200">
          <Briefcase size={48} />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-black text-indigo-950 tracking-tight">Empty Vault</h3>
          <p className="text-slate-400 font-bold mt-2 max-w-xs mx-auto text-sm uppercase tracking-widest">Your portfolio is currently unallocated. Start trading to build your legacy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-black text-indigo-950 tracking-tighter italic">Positions</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Detailed Breakdown of Active Holdings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {holdingsWithData.map((pos) => (
          <div 
            key={pos.symbol}
            className="p-8 vibrant-card bg-white hover:shadow-xl hover:shadow-indigo-100/50 transition-all group flex flex-col gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[64px] -mr-8 -mt-8 flex items-end justify-start p-6 text-indigo-100 group-hover:text-indigo-200 transition-colors">
              <Briefcase size={32} />
            </div>
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[24px] bg-indigo-900 border border-indigo-950 flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-indigo-100">
                  {pos.symbol.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-black text-xl text-indigo-950 tracking-tight">{pos.symbol}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pos.shares} Shares Owned</p>
                </div>
              </div>
              {pos.stock && (
                <div className="w-32 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                  <StockChart stock={pos.stock} showDetails={false} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 border-y-2 border-slate-50 py-6">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Avg. Buy</p>
                <p className="text-base font-mono font-black text-indigo-950 italic tracking-tighter">{pos.stock?.currency || '$'}{pos.averagePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current</p>
                <p className="text-base font-mono font-black text-indigo-950 italic tracking-tighter">{pos.stock?.currency || '$'}{pos.currentPrice.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Unrealized P/L</p>
                <p className={`text-base font-mono font-black italic tracking-tighter ${pos.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {pos.profit >= 0 ? '+' : ''}{pos.stock?.currency || '$'}{pos.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Position Value</p>
                <p className="text-2xl font-mono font-black text-indigo-600 tracking-tighter italic">{pos.stock?.currency || '$'}{pos.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${pos.profitPercent >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                   {pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}% ROI
                </div>
                <button 
                  onClick={() => pos.stock && onTrade(pos.stock)}
                  className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-2 group/btn"
                >
                  Adjust Position
                  <TrendingUp size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioView;
