/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ChevronDown, List, Grid, MoreVertical, TrendingUp, TrendingDown, Bot, ArrowRight, Play, CheckCircle2, ChevronRight, Activity, Zap, ShieldAlert, PieChart, BarChart3, Newspaper, LineChart } from 'lucide-react';
import { Stock } from '../types.ts';
import PortfolioGraph from './PortfolioGraph.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  onTrade?: (stock: Stock) => void;
}

const TABS = ['Active Positions', 'Watchlist', 'Orders', 'Performance', 'Allocation', 'History'];
const FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const DashboardView: React.FC<DashboardViewProps> = ({ onTrade }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeFilter, setActiveFilter] = useState('1M');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState('Value (High → Low)');
  const [moversType, setMoversType] = useState<'gainers'|'losers'>('gainers');

  
  const { profile, marketContext, addFunds } = usePortfolio();
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const { stocks } = useMarketData();
  
  let currentHoldingsValue = 0;
  let totalCost = 0;
  
  profile.holdings.forEach(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (stock && stock.currency === currencySymbol) {
      currentHoldingsValue += stock.price * holding.shares;
      totalCost += holding.averagePrice * holding.shares;
    }
  });

  const cashBalance = profile.balances[currencySymbol] || 0;
  const portfolioValue = cashBalance + currentHoldingsValue;
  
  const unrealizedReturn = currentHoldingsValue - totalCost;
  const unrealizedReturnPct = totalCost > 0 ? (unrealizedReturn / totalCost) * 100 : 0;

  const holdingsWithData = profile.holdings
    .map(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      return { holding, stock };
    })
    .filter(h => h.stock && h.stock.currency === currencySymbol)
    .map(h => {
      const currentPrice = h.stock.price;
      const avgCost = h.holding.averagePrice;
      const quantity = h.holding.shares;
      const marketValue = currentPrice * quantity;
      const costValue = avgCost * quantity;
      const unrealizedPL = marketValue - costValue;
      const unrealizedPLPct = (currentPrice / avgCost - 1) * 100;
      const todayChange = h.stock.change * quantity;
      const todayChangePct = h.stock.changePercent;
      const allocation = portfolioValue > 0 ? (marketValue / portfolioValue) * 100 : 0;
      
      return {
        ...h.holding,
        stock: h.stock,
        currentPrice,
        marketValue,
        unrealizedPL,
        unrealizedPLPct,
        todayChange,
        todayChangePct,
        allocation
      };
    });

  
  // Day return mock based on portfolio size
  const todayReturn = portfolioValue > 0 ? (portfolioValue * (isIndia ? 0.005 : 0.012)) : 0;
  const todayReturnPct = portfolioValue > 0 ? (todayReturn / portfolioValue) * 100 : 0;

  const { openModal, addToast, setIsCopilotOpen } = useUI();

  const contextCountry = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'USA' : 'All');
  
  const topMovers = stocks
    .filter(s => contextCountry === 'All' || s.country === contextCountry)
    .sort((a, b) => moversType === 'gainers' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)
    .slice(0, 5)
    .map(s => ({ s: s.symbol, v: (s.changePercent >= 0 ? '+' : '') + s.changePercent.toFixed(2) + '%' }));


  return (
    <div className="pb-16 max-w-[1600px] mx-auto w-full">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div className="relative">
          <h1 className="text-3xl md:text-[40px] font-sans font-bold text-text-main tracking-tight leading-tight">
            Good Morning, <br />
            <span className="font-serif italic text-primary font-black">Investor!</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm font-medium">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm font-bold text-text-main uppercase tracking-wider">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p className="text-xs text-text-muted mt-1 font-serif italic">"A smarter you, a brighter tomorrow."</p>
        </div>
      </div>

      {/* Portfolio Summary 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Total Portfolio Value</p>
                <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">{currencySymbol}{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <button onClick={() => addFunds(isIndia ? 1000000 : 10000, currencySymbol)} className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1" title="Add virtual funds">
                <Plus size={12} /> Add Cash
              </button>
            </div>
            <p className={`text-xs font-bold mt-2 flex items-center gap-1 ${todayReturn >= 0 ? 'text-positive' : 'text-rose-500'}`}>
              {todayReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {todayReturn >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(todayReturn).toLocaleString(undefined, { minimumFractionDigits: 2 })} ({todayReturn >= 0 ? '+' : '-'}{Math.abs(todayReturnPct).toFixed(2)}%)
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Today's P/L</p>
            <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">+₹612.38</p>
            <p className="text-xs font-bold text-positive mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              (+4.03%)
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Cash Balance</p>
            <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">₹10,774.33</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Portfolio Health</p>
              <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">86 <span className="text-sm text-text-muted font-sans font-medium">/ 100</span></p>
              <p className="text-xs font-bold text-positive mt-2">Strong</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-ui-border border-t-primary border-r-primary flex items-center justify-center rotate-45 shadow-sm relative">
               <div className="absolute inset-2 rounded-full border-4 border-ui-border border-b-positive border-l-positive -rotate-45" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT MAIN CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Portfolio Performance */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-text-main">Portfolio Performance</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-mono font-bold text-positive">+35.41%</span>
                  <span className="text-sm font-mono text-text-muted">+₹4,128.26</span>
                </div>
              </div>
              <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border shrink-0 overflow-x-auto no-scrollbar">
                {FILTERS.map(f => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      activeFilter === f ? 'bg-ui-surface text-primary-dark shadow-sm' : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
               <PortfolioGraph 
                  history={profile.history || []} 
                  currentValue={12500} 
                  baseline={10000} 
               />
            </div>
          </motion.div>

          {/* Active Positions */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ui-border mb-6">
              <div className="flex gap-6 overflow-x-auto no-scrollbar relative flex-1">
                {TABS.map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap relative ${
                      activeTab === tab ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {tab === 'Active Positions' ? 'Active Positions (2)' : tab}
                    {activeTab === tab && (
                      <motion.div layoutId="posTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pb-4">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-ui-surface text-text-main' : 'text-text-muted hover:text-text-main'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-ui-surface text-text-main' : 'text-text-muted hover:text-text-main'}`}
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* TITAN CARD */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-5 group">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5 border-b border-ui-border pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A1F29] border border-ui-border flex items-center justify-center font-bold text-lg text-white">
                      TI
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-main leading-tight">TITAN</h4>
                      <p className="text-xs text-text-muted">Titan Company Ltd.</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">Equity</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">Consumer Cyclical</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Current Price</p>
                    <p className="text-xl font-mono font-black text-text-main">₹3,650.45</p>
                    <p className="text-sm font-mono font-bold text-positive">+₹42.30 (+1.17%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Quantity</p>
                    <p className="text-sm font-mono font-bold text-text-main">245</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Avg. Cost</p>
                    <p className="text-sm font-mono font-bold text-text-main">₹3,645.60</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Market Value</p>
                    <p className="text-sm font-mono font-bold text-text-main">₹894,360.25</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Unrealized P/L</p>
                    <p className="text-sm font-mono font-bold text-positive">+₹1,188.25 <span className="text-[10px]">(+0.13%)</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Today's Change</p>
                    <p className="text-sm font-mono font-bold text-positive">+₹10,357.50 <span className="text-[10px]">(+1.17%)</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Allocation</p>
                      <p className="text-sm font-mono font-bold text-text-main">56.6%</p>
                    </div>
                    <div className="w-8 h-8 rounded-full conic-gradient-titan shrink-0 shadow-sm" style={{ background: 'conic-gradient(#D4AF37 0% 56.6%, var(--ui-bg) 56.6% 100%)', borderRadius: '50%' }} />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => addToast('Viewing TITAN details', 'info')} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">View Details</button>
                  <button onClick={() => addToast('Modify allocation workflow', 'info')} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">Modify Allocation</button>
                  <button className="w-8 h-8 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted hover:text-text-main ml-auto"><MoreVertical size={14} /></button>
                </div>
              </motion.div>

              {/* AMD CARD */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-5 group">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5 border-b border-ui-border pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A1F29] border border-ui-border flex items-center justify-center font-bold text-lg text-white">
                      AM
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-main leading-tight">AMD</h4>
                      <p className="text-xs text-text-muted">Advanced Micro Devices, Inc.</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">Equity</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-ui-bg border border-ui-border text-text-muted">Semiconductors</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Current Price</p>
                    <p className="text-xl font-mono font-black text-text-main">$503.60</p>
                    <p className="text-sm font-mono font-bold text-positive">+$12.48 (+2.54%)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Quantity</p>
                    <p className="text-sm font-mono font-bold text-text-main">10</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Avg. Cost</p>
                    <p className="text-sm font-mono font-bold text-text-main">$175.77</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Market Value</p>
                    <p className="text-sm font-mono font-bold text-text-main">$5,036.60</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Unrealized P/L</p>
                    <p className="text-sm font-mono font-bold text-positive">+$3,278.30 <span className="text-[10px]">(+186.51%)</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Today's Change</p>
                    <p className="text-sm font-mono font-bold text-positive">+$124.80 <span className="text-[10px]">(+2.54%)</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1">Allocation</p>
                      <p className="text-sm font-mono font-bold text-text-main">31.9%</p>
                    </div>
                    <div className="w-8 h-8 rounded-full conic-gradient-amd shrink-0 shadow-sm" style={{ background: 'conic-gradient(#00A878 0% 31.9%, var(--ui-bg) 31.9% 100%)', borderRadius: '50%' }} />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={() => addToast('Viewing AMD details', 'info')} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">View Details</button>
                  <button onClick={() => addToast('Modify allocation workflow', 'info')} className="px-4 py-2 text-xs font-bold rounded-lg bg-ui-bg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors">Modify Allocation</button>
                  <button className="w-8 h-8 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted hover:text-text-main ml-auto"><MoreVertical size={14} /></button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT INTELLIGENCE PANEL */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-6">
          
          {/* AI Portfolio Copilot Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6 border-primary/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 mb-4">
               <div className="w-12 h-12 rounded-xl bg-primary-dark text-white flex items-center justify-center shadow-md">
                 <Bot size={24} />
               </div>
               <div>
                 <h3 className="text-lg font-serif font-bold text-text-main">AI Portfolio Copilot</h3>
                 <p className="text-xs text-text-muted mt-1 leading-relaxed">Get intelligent insights, ask questions and make better decisions.</p>
               </div>
            </div>
            <button 
               onClick={() => setIsCopilotOpen(true)}
               className="w-full py-3 bg-ui-bg border border-primary/50 text-primary-dark font-bold rounded-xl hover:bg-primary hover:text-ui-bg transition-colors flex items-center justify-center gap-2 mb-4"
            >
              Ask AI Copilot <ArrowRight size={16} />
            </button>
            <div className="space-y-2">
              <button onClick={() => setIsCopilotOpen(true)} className="w-full text-left p-2.5 rounded-lg bg-ui-bg border border-ui-border text-xs text-text-main hover:border-primary transition-colors">"Why is my portfolio up today?"</button>
              <button onClick={() => setIsCopilotOpen(true)} className="w-full text-left p-2.5 rounded-lg bg-ui-bg border border-ui-border text-xs text-text-main hover:border-primary transition-colors">"Show my biggest risks"</button>
            </div>
          </motion.div>

          {/* Asset Allocation */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="bg-ui-surface rounded-[32px] border border-ui-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-[28px] font-sans font-bold text-text-main tracking-tight leading-none mb-1.5">Asset Allocation</h3>
                <p className="text-[15px] text-text-muted font-medium">Your investments by asset</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ui-border bg-ui-bg text-[13px] font-medium text-text-main hover:bg-ui-surface-hover transition-colors">
                All Accounts <ChevronDown size={14} className="text-text-muted opacity-70" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="w-64 h-64 rounded-full relative shadow-[inset_0_-2px_10px_rgba(0,0,0,0.02)]" style={{ background: 'conic-gradient(from -90deg, #D6A848 0% 56.6%, #0CA773 56.6% 88.5%, #61738C 88.5% 96.9%, #EE5E54 96.9% 100%)' }}>
                <div className="absolute inset-[32px] bg-ui-surface rounded-full flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] z-10">
                  <p className="text-[32px] font-sans font-bold text-text-main tracking-tight leading-none mb-1">₹2.46M</p>
                  <p className="text-[11px] uppercase font-bold text-text-muted tracking-[0.15em]">Total Value</p>
                </div>
                
                {/* Segment Labels */}
                <span className="absolute top-[50%] right-[8%] text-white text-[13px] font-bold drop-shadow-sm z-10 translate-x-1/2 -translate-y-1/2">56.6%</span>
                <span className="absolute top-[50%] left-[8%] text-white text-[13px] font-bold drop-shadow-sm z-10 -translate-x-1/2 -translate-y-1/2">31.9%</span>
                <span className="absolute top-[12%] left-[30%] text-white text-[12px] font-bold drop-shadow-sm z-10 -translate-x-1/2 -translate-y-1/2">8.4%</span>
                <span className="absolute top-[8%] left-[48%] text-white text-[11px] font-bold drop-shadow-sm z-10 -translate-x-1/2 -translate-y-1/2">3.1%</span>
                
                {/* Thin white borders between segments */}
                <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-ui-surface origin-bottom -translate-x-1/2" />
                <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-ui-surface origin-bottom -translate-x-1/2 rotate-[203.76deg]" /> {/* 56.6% */}
                <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-ui-surface origin-bottom -translate-x-1/2 rotate-[318.6deg]" /> {/* 56.6% + 31.9% = 88.5% */}
                <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-ui-surface origin-bottom -translate-x-1/2 rotate-[348.84deg]" /> {/* 88.5% + 8.4% = 96.9% */}
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-ui-bg rounded-2xl border border-ui-border overflow-hidden">
                {[
                  { name: 'TITAN', desc: 'Equity • 1 holding', pct: '56.6%', val: '₹1.39M', color: '#D6A848' },
                  { name: 'AMD', desc: 'Equity • 1 holding', pct: '31.9%', val: '₹0.78M', color: '#0CA773' },
                  { name: 'Cash', desc: 'Liquid • Cash balance', pct: '8.4%', val: '₹0.21M', color: '#61738C' },
                  { name: 'Others', desc: 'Diversified investments', pct: '3.1%', val: '₹0.08M', color: '#EE5E54' }
                ].map((item, i, arr) => (
                  <div key={item.name} className={`flex items-center justify-between p-4 px-5 hover:bg-ui-surface-hover transition-colors cursor-pointer group ${i !== arr.length - 1 ? 'border-b border-ui-border/50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[15px] font-bold text-text-main leading-tight">{item.name}</p>
                        <p className="text-[13px] text-text-muted mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[15px] font-bold leading-tight" style={{ color: item.color }}>{item.pct}</p>
                        <p className="text-[14px] text-text-muted mt-0.5 font-medium">{item.val}</p>
                      </div>
                      <ChevronRight size={16} className="text-text-muted opacity-40 group-hover:opacity-100 transition-opacity ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Market Sentiment */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6">
            <h3 className="text-base font-bold text-text-main mb-4">Market Sentiment</h3>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[200px] h-[100px] relative overflow-hidden mb-2">
                 <div className="w-[200px] h-[200px] rounded-full border-[12px] border-ui-bg border-t-negative border-l-primary-dark border-r-positive border-b-transparent transform -rotate-45 relative">
                    <div className="absolute top-[80px] left-[80px] w-4 h-[60px] bg-white rounded-full origin-bottom transform rotate-[110deg] shadow-md border border-gray-200 z-10 transition-transform duration-1000 ease-out" />
                 </div>
              </div>
              <h4 className="text-lg font-black text-positive uppercase tracking-widest">Bullish</h4>
              <p className="text-xs text-text-muted text-center mt-2">"Markets are showing positive momentum."</p>
            </div>
          </motion.div>

          {/* Top Movers Today */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-text-main">Top Movers Today</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMoversType('gainers')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${moversType === 'gainers' ? 'bg-ui-bg border border-primary text-primary-dark' : 'bg-transparent text-text-muted hover:bg-ui-bg'}`}>Gainers</button>
              <button onClick={() => setMoversType('losers')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${moversType === 'losers' ? 'bg-ui-bg border border-primary text-primary-dark' : 'bg-transparent text-text-muted hover:bg-ui-bg'}`}>Losers</button>
            </div>
            <div className="space-y-3">
              {topMovers.map(mover => (
                <div key={mover.s} className="flex justify-between items-center p-2 rounded-lg hover:bg-ui-bg transition-colors cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-[10px] font-bold text-text-main">{mover.s.substring(0, 2)}</div>
                      <span className="text-sm font-bold text-text-main">{mover.s}</span>
                   </div>
                   <span className={`text-xs font-mono font-bold ${moversType === 'gainers' ? 'text-positive' : 'text-negative'}`}>{mover.v}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Market Intelligence */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="bg-ui-surface rounded-[32px] border border-ui-border shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-[28px] font-sans font-bold text-text-main tracking-tight leading-none mb-1.5">Market Intelligence</h3>
                <p className="text-[15px] text-text-muted font-medium">Important news & updates</p>
              </div>
              <button className="w-10 h-10 rounded-full border border-ui-border bg-ui-bg flex items-center justify-center text-text-muted hover:bg-ui-surface-hover hover:text-text-main transition-colors">
                <Newspaper size={18} />
              </button>
            </div>
            
            <div className="px-6 pb-6 pt-2">
              <div className="space-y-3">
                {[
                  { t: 'AMD', name: 'Advanced Micro', h: 'New AI chip demand boosts revenue outlook for upcoming quarters.', time: '2h ago', source: 'Reuters', change: '+4.2%', up: true, color: '#0CA773', in: false },
                  { t: 'TITAN', name: 'Titan Company', h: 'Strong Q4 results beat expectations driven by jewelry sales.', time: '4h ago', source: 'Bloomberg', change: '+1.8%', up: true, color: '#D6A848', in: true },
                  { t: 'NVDA', name: 'Nvidia Corp', h: 'AI infrastructure demand continues to grow globally.', time: '5h ago', source: 'TechCrunch', change: '+1.1%', up: true, color: '#76B900', in: false },
                  { t: 'RELIANCE', name: 'Reliance Ind', h: 'Retail arm expands operations with new strategic acquisitions.', time: '6h ago', source: 'Economic Times', change: '-0.4%', up: false, color: '#00548F', in: true },
                  { t: 'AAPL', name: 'Apple Inc', h: 'Mixed-reality headset sales show early momentum in retail.', time: '7h ago', source: 'WSJ', change: '+0.8%', up: true, color: '#A2AAAD', in: false }
                ].filter(n => marketContext === 'ALL' || (isIndia ? n.in : !n.in)).slice(0, 3).map((news, i) => (
                  <div key={i} className="group p-4 rounded-2xl bg-ui-bg border border-ui-border hover:border-ui-border/80 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] shrink-0" style={{ backgroundColor: news.color }}>
                        {news.t.slice(0, 1)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">{news.source} • {news.time}</span>
                          
                          {/* Stock Shortcut Pill */}
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${news.up ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            <span>{news.t}</span>
                            <span>{news.change}</span>
                          </div>
                        </div>
                        <p className="text-[15px] font-bold text-text-main leading-snug group-hover:text-primary transition-colors">{news.h}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6">
            <h3 className="text-base font-bold text-text-main mb-4">Recent Activity</h3>
            <div className="space-y-4">
               {[ isIndia ? { type: 'BUY', symbol: 'TITAN', desc: '245 shares @ ₹3,645.60', color: 'text-positive' } : { type: 'BUY', symbol: 'AMD', desc: '10 shares @ $175.77', color: 'text-positive' },
                isIndia ? { type: 'DIV', symbol: 'RELIANCE', desc: 'Dividend Received', color: 'text-primary' } : { type: 'BUY', symbol: 'AAPL', desc: '5 shares @ $168.20', color: 'text-positive' },
                isIndia ? { type: 'SELL', symbol: 'TCS', desc: '10 shares @ ₹4,100.00', color: 'text-rose-500' } : { type: 'DIV', symbol: 'MSFT', desc: 'Dividend Received', color: 'text-primary' },
              ].map((act, i) => (
                 <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ui-bg transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-[10px] font-bold ${act.color}`}>
                       {act.type}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{act.symbol}</p>
                      <p className="text-xs text-text-muted font-mono">{act.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="vibrant-card p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-main">Your Goals</h3>
                
             </div>
             <div className="space-y-5">
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-text-main">Buy a House</p>
                      <p className="text-xs font-mono font-bold text-text-main">50%</p>
                   </div>
                   <div className="w-full h-2 rounded-full bg-ui-bg border border-ui-border overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-1/2" />
                   </div>
                   <p className="text-[10px] text-text-muted font-mono mt-1 text-right">{currencySymbol}{isIndia ? '15,00,000' : '150,000'} / {currencySymbol}{isIndia ? '30,00,000' : '300,000'}</p>
                </div>
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-text-main">Retirement Fund</p>
                      <p className="text-xs font-mono font-bold text-text-main">28%</p>
                   </div>
                   <div className="w-full h-2 rounded-full bg-ui-bg border border-ui-border overflow-hidden">
                      <div className="h-full bg-positive rounded-full w-[28%]" />
                   </div>
                   <p className="text-[10px] text-text-muted font-mono mt-1 text-right">{currencySymbol}{isIndia ? '28,20,000' : '282,000'} / {currencySymbol}{isIndia ? '1,00,00,000' : '1,000,000'}</p>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );

};
export default DashboardView;