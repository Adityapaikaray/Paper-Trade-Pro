/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ChevronDown, List, Grid, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '../types.ts';
import PortfolioGraph from './PortfolioGraph.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import LiveIndexContributor from './LiveIndexContributor.tsx';

interface DashboardViewProps {
  onTrade?: (stock: Stock) => void;
}

const TABS = ['Active Positions (2)', 'Watchlist', 'Performance', 'Allocation', 'History'];
const FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onTrade }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeFilter, setActiveFilter] = useState('1M');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState('Value (High → Low)');
  
  const { profile } = usePortfolio();
  const { stocks } = useMarketData();
  const { openModal, addToast } = useUI();

  const history = profile.history || [];

  const currency = profile.preferredCurrency || { code: 'USD', symbol: '$', rate: 1 };
  const totalBalanceInSelectedCurrency = profile.balances[currency.symbol] || (profile.balances['$'] * currency.rate);

  const portfolioValue = profile.holdings.reduce((total, holding) => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (!stock) return total + (holding.averagePrice * holding.shares);
    const priceInSelectedCurrency = stock.currency === currency.symbol 
      ? stock.price 
      : (stock.currency === '$' ? stock.price * currency.rate : stock.price / 83.2 * currency.rate);
    return total + (priceInSelectedCurrency * holding.shares);
  }, 0);

  const totalValue = portfolioValue + totalBalanceInSelectedCurrency;
  
  // Fake historical baseline for demo purposes
  const baseline = 11657.26;
  const pl = totalValue - baseline;
  const plPercent = (pl / baseline) * 100;
  const isPositive = pl >= 0;

  return (
    <div className="space-y-8  pb-16">
      
      {/* Editorial Header */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-ui-border">
        <div className="shrink-0">
          <h2 className="text-3xl md:text-[40px] leading-tight font-serif text-text-main">
            Portfolio <span className="text-gold italic font-bold">Overview</span>
          </h2>
          <p className="text-sm font-semibold tracking-wide text-text-muted mt-2 hidden md:block">
            Track. Analyze. Grow.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 xl:ml-auto">
          <div className="flex flex-row md:flex-col justify-between md:justify-start items-end md:items-start space-y-1">
            <div className="md:hidden">
               <div className="flex items-center gap-2 mb-1"><p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-text-muted">Total Portfolio Value</p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>
            </div>
            <div className="text-right md:text-left">
              <div className="hidden md:flex items-center gap-2 mb-1"><p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-text-muted">Total Portfolio Value</p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></div>
              <p className="text-2xl md:text-3xl font-serif font-black text-text-main">{currency.symbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className={`text-xs font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? '+' : ''}{currency.symbol}{pl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({isPositive ? '+' : ''}{plPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:flex gap-6 md:gap-10">
            <div className="space-y-1 bg-ui-surface md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-ui-border">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-muted">Today's P/L</p>
              <p className="text-lg md:text-xl font-serif font-black text-text-main">+$612.38</p>
              <p className="text-xs font-bold text-positive">(+4.03%)</p>
            </div>
            
            <div className="space-y-1 bg-ui-surface md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-ui-border">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-muted">Cash Balance</p>
              <p className="text-lg md:text-xl font-serif font-black text-text-main">{currency.symbol}{totalBalanceInSelectedCurrency.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <button onClick={() => openModal('add-position')} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold text-ui-bg font-bold hover:shadow-lg hover:shadow-gold/20 transition-all shadow-sm hover:scale-[0.98] active:scale-95 duration-200">
            <Plus size={18} strokeWidth={2.5} />
            Add Position
          </button>
        </div>
      </header>

      <LiveIndexContributor onTrade={onTrade} />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-ui-border">
        <div className="flex gap-8 overflow-x-auto no-scrollbar relative">
          {TABS.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap relative ${
                activeTab === tab ? 'text-text-main' : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="dashboardTab" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#B7873D] dark:bg-gold rounded-t-full" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 pb-4">
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 px-4 py-2 border border-[#E9E4D4] dark:border-ui-border rounded-lg text-xs font-bold text-gray-700 dark:text-text-main hover:bg-gray-50 dark:hover:bg-ui-surface-hover transition-colors shadow-sm bg-white dark:bg-ui-surface">\n              Sort by: <span>{sortMode}</span> <ChevronDown size={14} />\n            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 5 }} 
                  className="absolute right-0 top-full mt-2 w-48 bg-ui-surface border border-ui-border rounded-xl shadow-xl z-10 py-1"
                >
                  {['Value (High → Low)', 'Value (Low → High)', 'P/L (High → Low)', 'Alphabetical'].map(sort => (
                    <button 
                      key={sort}
                      onClick={() => { setSortMode(sort); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-text-muted hover:bg-ui-surface-hover hover:text-text-main transition-colors"
                    >
                      {sort}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">\n            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors border ${viewMode === 'list' ? 'border-[#B7873D] bg-[#F6F4EB] text-[#B7873D] dark:border-gold dark:bg-gold/10 dark:text-gold' : 'border-[#E9E4D4] bg-white text-gray-500 hover:bg-gray-50 dark:border-ui-border dark:bg-ui-surface dark:text-text-muted dark:hover:bg-ui-surface-hover'}`}><List size={16} /></button>\n            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors border ${viewMode === 'grid' ? 'border-[#B7873D] bg-[#F6F4EB] text-[#B7873D] dark:border-gold dark:bg-gold/10 dark:text-gold' : 'border-[#E9E4D4] bg-white text-gray-500 hover:bg-gray-50 dark:border-ui-border dark:bg-ui-surface dark:text-text-muted dark:hover:bg-ui-surface-hover'}`}><Grid size={16} /></button>\n          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab.startsWith('Active Positions') ? (
          <motion.div 
            key="active-positions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragDirectionLock
            onDragEnd={(e, { offset, velocity }) => {
              const currentIndex = TABS.indexOf(activeTab);
              if (offset.x > 50 && currentIndex > 0) {
                setActiveTab(TABS[currentIndex - 1]);
              } else if (offset.x < -50 && currentIndex < TABS.length - 1) {
                setActiveTab(TABS[currentIndex + 1]);
              }
            }}
            className="space-y-6"
          >
            {/* Active Position Cards */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {profile.holdings.length === 0 ? (
                <div className="col-span-full py-16 text-center border border-ui-border rounded-3xl bg-ui-surface">
                  <p className="text-text-muted font-mono mb-4">No active positions found.</p>
                  <button 
                    onClick={() => openModal('add-position')}
                    className="px-5 py-2.5 rounded-xl bg-gold text-ui-bg font-bold hover:opacity-90 transition-opacity"
                  >
                    Explore Markets
                  </button>
                </div>
              ) : (
          [...profile.holdings]
          .sort((a, b) => {
            const stockA = stocks.find(s => s.symbol === a.symbol);
            const stockB = stocks.find(s => s.symbol === b.symbol);
            const valA = (stockA?.price || a.averagePrice) * a.shares;
            const valB = (stockB?.price || b.averagePrice) * b.shares;
            const profitA = ((stockA?.price || a.averagePrice) - a.averagePrice) * a.shares;
            const profitB = ((stockB?.price || b.averagePrice) - b.averagePrice) * b.shares;
            
            if (sortMode === 'Value (High → Low)') return valB - valA;
            if (sortMode === 'Value (Low → High)') return valA - valB;
            if (sortMode === 'P/L (High → Low)') return profitB - profitA;
            if (sortMode === 'Alphabetical') return a.symbol.localeCompare(b.symbol);
            return 0;
          })
          .map((holding) => {
            const stock = stocks.find(s => s.symbol === holding.symbol);
            if (!stock) return null;
            
            const marketValue = stock.price * holding.shares;
            const costBasis = holding.averagePrice * holding.shares;
            const unrealizedPL = marketValue - costBasis;
            const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;
            const isHoldingPositive = unrealizedPL >= 0;
            
            const allocation = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
            const allocationDasharray = `${allocation}, 100`;

            const tick = stock.change >= 0 ? 'up' : 'down';
            const todaysChangeVal = stock.change * holding.shares;

            return (
              <div key={holding.symbol} className="bg-white dark:bg-ui-surface rounded-3xl border border-[#E9E4D4] dark:border-ui-border p-5 md:p-8 shadow-sm hover:border-[#B7873D]/30 dark:hover:border-gold/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900 dark:bg-black border border-gray-800 flex items-center justify-center text-white font-serif italic text-xs md:text-sm font-bold shadow-md">
                      {stock.symbol.length <= 4 ? stock.symbol : stock.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-text-main leading-tight">{stock.symbol}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-text-muted truncate max-w-[150px] sm:max-w-none">{stock.name}</p>
                      <div className="hidden md:flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-ui-bg text-[10px] font-bold text-gray-500 dark:text-text-muted border border-gray-200 dark:border-ui-border">
                          Equity
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F3F4F6] dark:bg-ui-bg text-[10px] font-bold text-gray-500 dark:text-text-muted border border-gray-200 dark:border-ui-border">
                          {stock.sector}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl md:text-2xl font-serif font-black text-gray-900 dark:text-text-main">{stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-[10px] md:text-xs font-bold ${tick === 'up' ? 'text-[#10B981] dark:text-emerald-500' : 'text-rose-500'}`}>
                      {tick === 'up' ? '+' : ''}{stock.change.toFixed(2)} ({tick === 'up' ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 md:mt-8 pb-4 md:pb-6">
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1">Quantity</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-text-main">{holding.shares.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1">Avg. Cost</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-text-main">{stock.currency}{holding.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1">Market Value</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-text-main">{stock.currency}{marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1">Unrealized P/L</p>
                    <p className={`text-xs md:text-sm font-bold ${isHoldingPositive ? 'text-[#10B981] dark:text-emerald-500' : 'text-rose-500'}`}>
                      {isHoldingPositive ? '+' : ''}{stock.currency}{unrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      <span className="block text-[9px] md:text-[10px]">({isHoldingPositive ? '+' : ''}{unrealizedPLPercent.toFixed(2)}%)</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col pt-4 md:pt-6 gap-4 border-t border-[#F3F4F6] dark:border-ui-border">
                  <div className="flex justify-between items-center w-full pb-4">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1">Today's Change</p>
                      <p className={`text-xs md:text-sm font-bold ${tick === 'up' ? 'text-[#059669] dark:text-emerald-500' : 'text-rose-500'}`}>
                        {tick === 'up' ? '+' : ''}{stock.currency}{todaysChangeVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({tick === 'up' ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1 text-center">Allocation</p>
                          <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-text-main text-center">{allocation.toFixed(1)}%</p>
                       </div>
                       <div className="w-8 h-8 rounded-full border-4 border-[#E9E4D4] dark:border-ui-border relative shrink-0">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 absolute top-0 left-0 text-[#10B981] dark:text-emerald-500">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={allocationDasharray} />
                          </svg>
                       </div>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-text-muted uppercase tracking-wider mb-1 text-right">Current Price</p>
                      <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-text-main text-right">{stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => openModal('asset-details', { stock, holding })} className="flex-1 py-2.5 text-xs font-bold rounded-lg border border-[#E9E4D4] dark:border-ui-border text-gray-700 dark:text-text-main hover:bg-gray-50 dark:hover:bg-ui-surface-hover transition-colors flex items-center justify-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View Details
                      </button>
                    <button onClick={() => onTrade && onTrade(stock)} className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-[#A48243] hover:bg-[#8F6F33] text-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Modify Allocation
                      </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        
        {/* ASSET ALLOCATION */}
        <div className="bg-ui-surface rounded-3xl border border-ui-border p-5 md:p-8 shadow-md flex flex-col">
          <h4 className="text-sm font-bold text-text-main mb-8">Asset Allocation</h4>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
             <div className="w-48 h-48 rounded-full border-[16px] border-ui-border relative">
               <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 absolute top-0 left-0">
                  {(() => {
                    if (totalValue === 0) return <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="100, 100" className="text-ui-border" />;
                    
                    let currentOffset = 0;
                    return profile.holdings.slice(0, 3).map((h, i) => {
                       const s = stocks.find(st => st.symbol === h.symbol);
                       const val = s ? s.price * h.shares : 0;
                       const pct = (val / totalValue) * 100;
                       const dasharray = `${pct}, 100`;
                       const offset = -currentOffset;
                       currentOffset += pct;
                       
                       const colors = ["text-text-main", "text-gold", "text-emerald-500"];
                       
                       return (
                         <path key={h.symbol} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={dasharray} strokeDashoffset={offset} className={colors[i % colors.length]} />
                       );
                    });
                  })()}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${(totalBalanceInSelectedCurrency / Math.max(totalValue, 1)) * 100}, 100`} strokeDashoffset={-((totalValue - totalBalanceInSelectedCurrency) / Math.max(totalValue, 1)) * 100} className="text-text-muted" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-serif font-black text-text-main">{currency.symbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Value</p>
               </div>
             </div>
          </div>
          
          <div className="mt-8 space-y-3">
             {profile.holdings.slice(0, 3).map((h, i) => {
               const s = stocks.find(st => st.symbol === h.symbol);
               const val = s ? s.price * h.shares : 0;
               const pct = totalValue > 0 ? (val / totalValue) * 100 : 0;
               const colors = ["bg-text-main", "bg-gold", "bg-emerald-500"];
               return (
                 <div key={h.symbol} className="flex justify-between items-center text-sm font-semibold">
                   <div className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`}></div>
                     <span className="text-text-main">{h.symbol}</span>
                   </div>
                   <span className="text-text-main">{pct.toFixed(1)}%</span>
                 </div>
               );
             })}
             <div className="flex justify-between items-center text-sm font-semibold">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-text-muted"></div>
                 <span className="text-text-muted">Cash</span>
               </div>
               <span className="text-text-muted">{totalValue > 0 ? ((totalBalanceInSelectedCurrency / totalValue) * 100).toFixed(1) : 0}%</span>
             </div>
          </div>
        </div>

        {/* PORTFOLIO PERFORMANCE */}
        <div className="bg-ui-surface rounded-3xl border border-ui-border p-5 md:p-8 shadow-md flex flex-col lg:col-span-2 xl:col-span-1 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-sm font-bold text-text-main mb-1">Portfolio Performance</h4>
              <p className="text-2xl md:text-3xl font-serif font-black text-emerald-500">+35.41%</p>
              <p className="text-xs md:text-sm font-bold text-emerald-500">+$4,128.26</p>
            </div>
            <button onClick={() => addToast('More options coming soon', 'info')} className="p-2 rounded-xl hover:bg-ui-surface-hover text-text-muted transition-colors"><MoreVertical size={16} /></button>
          </div>
          
          <div className="flex gap-1 bg-ui-bg p-1 rounded-xl border border-ui-border self-start mb-6 z-10 overflow-x-auto max-w-full no-scrollbar">
            {FILTERS.map(f => (
              <button 
                key={f}
                onClick={() => { setActiveFilter(f); addToast(`Filter set to ${f}`, 'success'); }}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors shrink-0 ${
                  activeFilter === f ? 'bg-text-main text-ui-surface' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full min-h-[150px] relative mt-auto -mx-2 -mb-2">
            {history.length > 0 ? (
              <PortfolioGraph 
                history={history} 
                currentValue={totalValue} 
                baseline={baseline}
                currencySymbol={currency.symbol}
                currencyRate={currency.rate}
              />
            ) : (
              <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full text-emerald-500 absolute bottom-0 opacity-80">
                 <path d="M0,50 L0,40 L10,42 L20,35 L30,38 L40,20 L50,25 L60,15 L70,18 L80,5 L90,10 L100,0 L100,50 Z" fill="currentColor" fillOpacity="0.1" />
                 <path d="M0,40 L10,42 L20,35 L30,38 L40,20 L50,25 L60,15 L70,18 L80,5 L90,10 L100,0" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-ui-surface rounded-3xl border border-ui-border p-5 md:p-8 shadow-md lg:col-span-3 xl:col-span-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-bold text-text-main">Recent Activity</h4>
            <button onClick={() => { setActiveTab('History'); window.scrollTo(0, 0); }} className="text-[10px] font-bold text-text-muted hover:text-gold uppercase tracking-wider transition-colors">View All</button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2 min-h-[300px]">
            {profile.transactions.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                 <List size={32} className="mb-2" />
                 <p className="text-xs font-mono">No recent transactions</p>
               </div>
            ) : (
              profile.transactions.slice(0, 10).map((tx) => {
                const isBuy = tx.type === 'BUY';
                const txStock = stocks.find(s => s.symbol === tx.symbol);
                const txCurrency = txStock?.currency || currency.symbol;
                
                return (
                  <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-ui-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isBuy ? <Plus size={16} strokeWidth={3} /> : <TrendingDown size={16} strokeWidth={3} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-main truncate">{isBuy ? 'BUY' : 'SELL'} &mdash; {tx.symbol}</p>
                        <p className="text-[10px] md:text-xs text-text-muted font-medium mt-0.5 truncate">{tx.shares} shares @ {txCurrency}{tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                    <p className={`text-xs md:text-sm font-bold whitespace-nowrap ml-2 ${isBuy ? 'text-text-main' : 'text-emerald-500'}`}>
                      {isBuy ? '-' : '+'}{txCurrency}{(tx.shares * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
        </motion.div>
      ) : (
        <motion.div 
          key="other-tab"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragDirectionLock
          onDragEnd={(e, { offset, velocity }) => {
            const currentIndex = TABS.indexOf(activeTab);
            if (offset.x > 50 && currentIndex > 0) {
              setActiveTab(TABS[currentIndex - 1]);
            } else if (offset.x < -50 && currentIndex < TABS.length - 1) {
              setActiveTab(TABS[currentIndex + 1]);
            }
          }}
          className="col-span-full py-24 text-center border border-ui-border rounded-3xl bg-ui-surface"
        >
          <div className="w-16 h-16 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center mx-auto mb-4 text-text-muted opacity-30">
            <List size={32} />
          </div>
          <p className="text-text-main font-bold mb-2">{activeTab}</p>
          <p className="text-text-muted font-mono text-sm mb-6">This module is currently being provisioned.</p>
          <button 
            onClick={() => setActiveTab(TABS[0])}
            className="px-5 py-2.5 rounded-xl border border-ui-border text-text-main font-bold hover:bg-ui-surface-hover transition-colors shadow-sm"
          >
            Return to Active Positions (2)
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardView;
