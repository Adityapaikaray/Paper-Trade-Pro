const fs = require('fs');

const content = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';
import { useUI } from '../contexts/UIContext.tsx';

interface PortfolioViewProps {
  onTrade: (stock: Stock) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ onTrade }) => {
  const { profile, addFunds, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { openModal } = useUI();
  
  const currency = { symbol: marketContext === 'IN' ? '₹' : '$', rate: 1 };

  const holdingsWithData = (profile?.holdings || []).map(holding => {
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
  const totalBalanceInSelectedCurrency = profile?.balances?.[currency.symbol] || 0;
  const totalValue = totalPortfolioValue + totalBalanceInSelectedCurrency;

  if ((profile?.holdings || []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8 ">
        <button onClick={() => addFunds(marketContext === 'IN' ? 100000 : 10000, marketContext === 'IN' ? '₹' : '$')} className="px-6 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
          Deposit Virtual Funds
        </button>
        <div className="w-28 h-28 rounded-[40px] bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted shadow-2xl relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          <Briefcase size={56} strokeWidth={1} className="relative z-10" />
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-3xl font-serif italic text-text-main tracking-tight">Dormant Vault</h3>
          <p className="text-text-muted font-bold mt-4 text-[10px] uppercase tracking-[0.3em] leading-relaxed italic">Your capital reserves are currently unallocated. Secure high-fidelity assets in the exchange to begin building your institutional legacy.</p>
          <button onClick={() => openModal('add-position')} className="glass-button mt-8 shadow-primary/20 hover:scale-[0.98] active:scale-95 duration-200">Initiate Acquisition</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-bold text-text-main leading-none">Positions</h2>
      </header>

      <div className="flex flex-col gap-6">
        {holdingsWithData.map((pos, i) => {
          const allocation = (pos.valueInPreferred / totalValue) * 100;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              key={pos.symbol}
              className="flex flex-col md:flex-row bg-ui-surface rounded-[32px] border border-ui-border p-2 gap-6 overflow-hidden shadow-sm hover:border-primary/30 transition-colors"
            >
              {/* Left Timeline Sidebar */}
              <div className="hidden md:flex w-20 rounded-[24px] bg-gradient-to-b from-ui-surface-hover to-transparent border border-ui-border flex-col items-center py-6 relative shrink-0">
                 <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-ui-border z-0" />
                 
                 {/* Icon */}
                 <div className="w-12 h-12 rounded-full bg-[#1e3a8a] border border-[#1d4ed8] flex items-center justify-center text-white font-bold text-lg z-10 relative shadow-[0_0_15px_rgba(30,58,138,0.5)]">
                    {pos.symbol.substring(0,2)}
                 </div>

                 <div className="flex-1" />

                 {/* 3 dot menu */}
                 <button className="w-10 h-14 rounded-full bg-ui-bg border border-ui-border flex flex-col items-center justify-center gap-1.5 z-10 relative hover:bg-ui-surface-hover transition-colors shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-text-muted" />
                    <div className="w-1 h-1 rounded-full bg-text-muted" />
                    <div className="w-1 h-1 rounded-full bg-text-muted" />
                 </button>
              </div>

              {/* Main Position Section */}
              <div className="flex-1 flex flex-col py-6 pr-6 md:pr-10 pl-4 md:pl-2">
                 <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                    {/* Left Side */}
                    <div>
                       <h2 className="text-[40px] font-bold text-text-main leading-none mb-1">{pos.symbol}</h2>
                       <p className="text-[15px] font-medium text-text-muted mb-5">{pos.stock?.name || pos.symbol + ' Company Ltd.'}</p>
                       <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full border border-ui-border text-[10px] font-bold text-text-muted uppercase tracking-widest bg-ui-bg/50">Equity</span>
                          <span className="px-3 py-1 rounded-full border border-ui-border text-[10px] font-bold text-text-muted uppercase tracking-widest bg-ui-bg/50">{pos.stock?.sector || 'CONSUMER CYCLICAL'}</span>
                       </div>
                    </div>
                    {/* Right Side */}
                    <div className="text-left md:text-right">
                       <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">Current Price</p>
                       <p className="text-[32px] font-mono font-bold text-text-main mb-1.5 leading-none">
                          {pos.stock?.currency || '$'}{pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </p>
                       <div className="flex items-center md:justify-end gap-2 text-positive font-mono font-bold text-[15px]">
                          <span>{pos.currentPrice >= pos.averagePrice ? '+' : ''}{pos.stock?.currency || '$'}{Math.abs(pos.currentPrice - pos.averagePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span>({pos.currentPrice >= pos.averagePrice ? '+' : ''}{(((pos.currentPrice / pos.averagePrice) - 1) * 100).toFixed(2)}%)</span>
                       </div>
                    </div>
                 </div>

                 {/* Metrics Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 mb-12">
                    {/* Row 1 */}
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Quantity</p>
                       <p className="text-[22px] font-mono font-bold text-text-main">{pos.shares}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Average Buy Price</p>
                       <p className="text-[22px] font-mono font-bold text-text-main">{pos.stock?.currency || '$'}{pos.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Current Value</p>
                       <p className="text-[22px] font-mono font-bold text-text-main">{pos.stock?.currency || '$'}{pos.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    
                    {/* Row 2 */}
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Cost of Purchase</p>
                       <p className="text-[22px] font-mono font-bold text-text-main">{pos.stock?.currency || '$'}{(pos.averagePrice * pos.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">P&L</p>
                       <div className={\`flex items-baseline gap-2 font-mono font-bold \${pos.profit >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          <span className="text-[22px] leading-none">{pos.profit >= 0 ? '+' : ''}{pos.stock?.currency || '$'}{Math.abs(pos.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[14px]">({pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%)</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-2">Allocation</p>
                       <div className="flex items-center gap-3">
                          <p className="text-[22px] font-mono font-bold text-text-main leading-none">
                             {allocation.toFixed(1)}%
                          </p>
                          {/* Small Pie Chart */}
                          <div 
                             className="w-[26px] h-[26px] rounded-full bg-ui-surface-hover overflow-hidden flex items-center justify-center border border-ui-border shadow-sm" 
                             style={{ background: \`conic-gradient(var(--color-primary) 0% \${allocation}%, var(--ui-border) \${allocation}% 100%)\` }}
                          >
                             <div className="w-3.5 h-3.5 bg-ui-surface rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Buttons */}
                 <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button className="flex-1 py-4 px-6 rounded-2xl bg-[#0A0A0A] border border-[#242424] text-white font-bold text-[15px] hover:bg-[#151515] hover:border-[#333333] transition-all shadow-sm flex items-center justify-center">
                       View Details
                    </button>
                    <button 
                      onClick={() => openModal('modify-allocation', { stock: pos.stock, holding: pos, currentAllocation: Math.round((pos.valueInPreferred / totalValue) * 100) })}
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#0A0A0A] border border-[#242424] text-white font-bold text-[15px] hover:bg-[#151515] hover:border-[#333333] transition-all shadow-sm flex items-center justify-center"
                    >
                       Modify Allocation
                    </button>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioView;
`;

fs.writeFileSync('src/components/PortfolioView.tsx', content);
