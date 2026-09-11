/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';
import StockChart from './StockChart.tsx';
import { useUI } from '../contexts/UIContext.tsx';

interface PortfolioViewProps {
  onTrade: (stock: Stock) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ onTrade }) => {
  const { profile } = usePortfolio();
  const { stocks } = useMarketData();
  const { openModal } = useUI();
  const currency = profile.preferredCurrency!;

  const holdingsWithData = profile.holdings.map(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    const currentPrice = stock?.price || holding.averagePrice;
    const profit = (currentPrice - holding.averagePrice) * holding.shares;
    const profitPercent = ((currentPrice / holding.averagePrice) - 1) * 100;
    const value = currentPrice * holding.shares;

    // Convert value to preferred currency
    const valueInPreferred = stock?.currency === currency.symbol 
      ? value 
      : (stock?.currency === '$' ? value * currency.rate : value / 83.2 * currency.rate);

    return { ...holding, stock, currentPrice, profit, profitPercent, value, valueInPreferred };
  });

  const totalPortfolioValue = holdingsWithData.reduce((acc, pos) => acc + pos.valueInPreferred, 0);
  const totalBalanceInSelectedCurrency = profile.balances[currency.symbol] || (profile.balances["$"] * currency.rate);
  const totalValue = totalPortfolioValue + totalBalanceInSelectedCurrency;


  if (profile.holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 ">
        <div className="w-28 h-28 rounded-[40px] bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted shadow-2xl relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          <Briefcase size={56} strokeWidth={1} className="relative z-10" />
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-3xl font-serif italic text-text-dark tracking-tight">Dormant Vault</h3>
          <p className="text-text-muted font-bold mt-4 text-[10px] uppercase tracking-[0.3em] leading-relaxed italic">Your capital reserves are currently unallocated. Secure high-fidelity assets in the exchange to begin building your institutional legacy.</p>
          <button onClick={() => openModal('add-position')} className="glass-button mt-8 shadow-primary/20 hover:scale-[0.98] active:scale-95 duration-200">Initiate Acquisition</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 ">
      <header>
        <h2 className="text-5xl vibrant-heading primary-gradient-text italic">Active Positions</h2>
        <p className="text-text-muted font-bold uppercase text-[9px] tracking-[0.3em] mt-2">Institutional Ledger of Asset Allocations</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {holdingsWithData.map((pos, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            key={pos.symbol}
            className="p-10 vibrant-card shimmer border-ui-border group flex flex-col gap-10 "
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-ui-bg border border-ui-border flex items-center justify-center text-primary text-2xl font-serif italic shadow-2xl group-hover:border-primary/30 transition-all">
                  {pos.symbol.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-serif italic text-2xl text-text-dark tracking-tight leading-none italic">{pos.symbol}</h3>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">{pos.shares} Priority Units</p>
                </div>
              </div>
              {pos.stock && (
                <div className="w-32 h-16 opacity-40 group-hover:opacity-100 transition-all duration-500">
                  <StockChart stock={pos.stock} showDetails={false} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8 py-8 border-y border-ui-border">
              <div>
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Original Basis</p>
                <p className="text-lg font-mono font-black text-text-main italic tracking-tighter">{pos.stock?.currency || '$'}{pos.averagePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Live Valuation</p>
                <p className="text-lg font-mono font-black text-primary-light italic tracking-tighter">{pos.stock?.currency || '$'}{pos.currentPrice.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Dynamic P/L</p>
                <p className={`text-lg font-mono font-black italic tracking-tighter ${pos.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {pos.profit >= 0 ? '+' : ''}{pos.stock?.currency || '$'}{pos.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-ui-bg/30 rounded-2xl border border-ui-border">
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">Position Market Cap ({pos.stock?.currency})</p>
                <p className="text-2xl font-mono font-black text-text-main tracking-tighter italic">{pos.stock?.currency || '$'}{pos.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[8px] font-black text-primary/50 uppercase tracking-[0.3em] mb-2">Global Valuation ({currency.code})</p>
                <p className="text-2xl font-mono font-black text-primary-light tracking-tighter italic">{currency.symbol}{pos.valueInPreferred.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
                <div className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 border ${pos.profitPercent >= 0 ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-400/10 text-rose-400 border-rose-400/20'}`}>
                   {pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}% Performance
                </div>
                <button 
                  onClick={() => openModal('modify-allocation', { 
                    stock: pos.stock, 
                    holding: pos,
                    currentAllocation: Math.round((pos.valueInPreferred / totalValue) * 100) 
                  })}
                  className="glass-button text-[9px] hover:scale-[0.98] active:scale-95 duration-200"
                >
                  Modify Allocation
                </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioView;
