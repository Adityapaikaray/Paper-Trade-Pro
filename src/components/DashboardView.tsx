/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ChevronDown, List, Grid, MoreVertical, TrendingUp, TrendingDown, Bot, ArrowRight, Play, CheckCircle2, ChevronRight, Activity, Zap, ShieldAlert, PieChart, BarChart3, Newspaper, LineChart, Info, Briefcase } from 'lucide-react';
import { Stock } from '../types.ts';
import PortfolioGraph from './PortfolioGraph.tsx';
import PremiumPerformanceCard from './PremiumPerformanceCard.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
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
  const { theme } = useTheme();
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const { stocks } = useMarketData();
  
  let currentHoldingsValue = 0;
  let totalCost = 0;
  
  (profile?.holdings || []).forEach(holding => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (stock && stock.currency === currencySymbol) {
      currentHoldingsValue += stock.price * holding.shares;
      totalCost += holding.averagePrice * holding.shares;
    }
  });

  const cashBalance = profile?.balances?.[currencySymbol] || 0;
  const portfolioValue = cashBalance + currentHoldingsValue;
  
  const unrealizedReturn = currentHoldingsValue - totalCost;
  const unrealizedReturnPct = totalCost > 0 ? (unrealizedReturn / totalCost) * 100 : 0;

  const holdingsWithData = (profile?.holdings || [])
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
      <div className="bg-ui-bg rounded-[24px] p-8 md:p-12 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-ui-border">
        
        {/* Subtle cinematic dark background simulation via CSS gradients */}
        <div className="absolute inset-0 opacity-80 pointer-events-none" style={{ background: theme === 'dark' ? 'radial-gradient(ellipse at center bottom, #111111 0%, #000000 100%), linear-gradient(180deg, transparent 0%, #000000 100%)' : 'radial-gradient(ellipse at center bottom, #FCFBF8 0%, #F5F2EA 100%), linear-gradient(180deg, transparent 0%, #F5F2EA 100%)' }} />
        
        {/* Mountain silhouette */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 100 L20 70 L40 85 L70 30 L100 100 Z\' fill=\'none\' stroke=\'%23D4AF37\' stroke-width=\'1\' stroke-opacity=\'1\' /%3E%3C/svg%3E")', backgroundSize: 'cover', backgroundPosition: 'bottom' }} />
        
        {/* Very subtle warm-gold highlight along bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-[44px] font-sans font-medium text-text-main tracking-tight leading-[1.1] mb-2">
            Good Morning, <br />
            <span className="font-serif italic text-primary font-black">Investor!</span>
          </h1>
          <p className="text-text-muted text-[15px] font-medium mt-4">Here's what's happening with your portfolio today.</p>
        </div>
        
        <div className="relative z-10 flex flex-col md:items-end gap-6 md:text-right">
          <div className="text-left md:text-right">
            <p className="text-lg md:text-xl font-serif text-text-main font-medium italic">"Discipline today, compounds a brighter tomorrow."</p>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-2">— Warren Buffett</p>
            <div className="w-12 h-[1px] bg-primary opacity-50 mt-4 md:ml-auto" />
          </div>
          
          <div className="flex items-end justify-between md:justify-end gap-8 w-full">
            <div className="bg-ui-surface border border-ui-border rounded-xl p-3 flex items-center gap-3 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">SUN, 13 SEPT 2026</span>
                <span className="text-[11px] text-text-main font-medium mt-0.5">Small steps. Bigger tomorrows. <ArrowRight size={10} className="inline text-primary" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* Total Portfolio Value */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="bg-ui-surface rounded-[20px] p-6 border border-ui-border shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
              <Briefcase size={14} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Total Portfolio Value</p>
          </div>
          <p className="text-2xl xl:text-[28px] font-serif font-black text-text-main leading-none mb-2">₹1,487,026.83</p>
          <p className="text-[13px] font-bold text-positive flex items-center gap-1">
            <TrendingUp size={14} /> +₹7,435.13 (+0.50%)
          </p>
        </motion.div>

        {/* Today's P/L */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-ui-surface rounded-[20px] p-6 border border-ui-border shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D084]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border shadow-[0_0_10px_rgba(0,208,132,0.1)]">
              <Activity size={14} className="text-positive" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Today's P/L</p>
          </div>
          <p className="text-2xl xl:text-[28px] font-serif font-black text-text-main leading-none mb-2">+₹612.38</p>
          <p className="text-[13px] font-bold text-positive flex items-center gap-1">
            <TrendingUp size={14} /> (+4.03%)
          </p>
        </motion.div>

        {/* Cash Balance */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-ui-surface rounded-[20px] p-6 border border-ui-border shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
                <span className="text-text-muted font-bold text-xs">₹</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Cash Balance</p>
            </div>
            <button onClick={() => addFunds(isIndia ? 1000000 : 10000, currencySymbol)} className="text-primary hover:bg-ui-surface-hover p-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/30" title="Add virtual funds">
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
          <p className="text-2xl xl:text-[28px] font-serif font-black text-text-main leading-none">₹10,774.33</p>
        </motion.div>

        {/* Portfolio Health */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-ui-surface rounded-[20px] p-6 border border-ui-border shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D084]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between h-full">
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border shadow-[0_0_10px_rgba(0,208,132,0.1)]">
                  <ShieldAlert size={14} className="text-positive" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Portfolio Health</p>
              </div>
              <div>
                <p className="text-2xl xl:text-[28px] font-serif font-black text-text-main leading-none mb-1">86 <span className="text-sm text-text-muted font-sans font-medium">/ 100</span></p>
                <p className="text-[13px] font-bold text-positive">Strong</p>
              </div>
            </div>
            
            {/* Circular Progress Gauge */}
            <div className="w-[72px] h-[72px] relative shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--ui-border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-positive)" strokeWidth="8" strokeDasharray={`${251.2 * 0.86} 251.2`} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(0,208,132,0.5))' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT MAIN CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Portfolio Performance & Navigation */}
          <PremiumPerformanceCard activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Active Positions Content */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-lg font-serif font-bold text-text-main">Active Positions</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-ui-surface text-text-main border border-ui-border' : 'text-text-muted hover:text-text-main'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-ui-surface text-text-main border border-ui-border' : 'text-text-muted hover:text-text-main'}`}
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
                    <div className="w-12 h-12 rounded-full bg-[#1A1F29] border border-ui-border flex items-center justify-center font-bold text-lg text-text-main">
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
                    <div className="w-12 h-12 rounded-full bg-[#1A1F29] border border-ui-border flex items-center justify-center font-bold text-lg text-text-main">
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} className="bg-ui-surface rounded-[32px] p-8 lg:p-10 border border-ui-border shadow-2xl relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="flex items-start gap-5 mb-8 relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-ui-surface-hover border border-ui-border flex items-center justify-center shadow-[0_5px_15px_rgba(0,0,0,0.5)] shrink-0">
                 <Bot size={28} className="text-primary" strokeWidth={1.5} />
               </div>
               <div>
                 <div className="flex items-center gap-2">
                   <h3 className="text-[17px] font-sans font-bold text-text-main">AI Portfolio Copilot</h3>
                   <span className="text-[8px] font-bold uppercase tracking-widest bg-ui-surface-hover border border-primary text-primary px-1.5 py-0.5 rounded-sm shadow-[0_0_8px_rgba(212,175,55,0.2)]">Beta</span>
                 </div>
                 <p className="text-[13px] text-text-muted mt-1 leading-relaxed">Get intelligent insights, ask questions and make better decisions.</p>
               </div>
            </div>

            <button 
               onClick={() => setIsCopilotOpen(true)}
               className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#A6822B] text-[#000000] font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 mb-6 relative z-10"
            >
              Ask AI Copilot <ArrowRight size={16} strokeWidth={2} />
            </button>

            <div className="space-y-2.5 relative z-10">
              <button onClick={() => setIsCopilotOpen(true)} className="w-full text-left p-3 rounded-xl bg-ui-surface-hover border border-ui-border text-[13px] font-medium text-text-main hover:border-primary/50 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all flex items-center justify-between group">
                "Why is my portfolio up today?" <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => setIsCopilotOpen(true)} className="w-full text-left p-3 rounded-xl bg-ui-surface-hover border border-ui-border text-[13px] font-medium text-text-main hover:border-primary/50 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all flex items-center justify-between group">
                "What are my biggest risks?" <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </button>
              <button onClick={() => setIsCopilotOpen(true)} className="w-full text-left p-3 rounded-xl bg-ui-surface-hover border border-ui-border text-[13px] font-medium text-text-main hover:border-primary/50 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all flex items-center justify-between group">
                "Suggest next investment opportunities" <ArrowRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Market Sentiment and Ticker Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Market Sentiment */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="bg-ui-surface rounded-[32px] border border-ui-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 lg:p-10 pb-8 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-[26px] font-serif font-bold text-text-main leading-tight tracking-tight">Market Sentiment</h3>
                  <p className="text-[14px] text-text-muted mt-1.5 font-medium">Based on broad indices and volume</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-ui-surface-hover flex items-center justify-center border border-ui-border text-text-muted hover:text-primary hover:border-primary transition-colors shadow-sm">
                  <Info size={18} strokeWidth={2} />
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center relative flex-1">
                {/* SVG Gauge */}
                <div className="relative w-full flex justify-center mb-6">
                  <svg width="300" height="150" viewBox="0 0 300 150" className="overflow-visible">
                    <defs>
                      <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="12" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="needle-shadow-dark" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity={theme === 'dark' ? "0.8" : "0.2"} floodColor={theme === 'dark' ? "#000000" : "#0B1728"} />
                      </filter>
                    </defs>

                    {/* Labels */}
                    <text x="30" y="125" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Bearish</text>
                    <text x="150" y="10" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Neutral</text>
                    <text x="270" y="125" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Bullish</text>

                    {/* Gauge Segments */}
                    <g transform="rotate(180 150 135)">
                      {/* Bearish */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-negative)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="0" />
                      {/* Neutral */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-primary)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="-114.72" />
                      {/* Bullish */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-positive)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="-229.44" style={{ filter: theme === 'dark' ? 'drop-shadow(0 0 14px rgba(0,208,132,0.4))' : 'none' }} />
                    </g>

                    {/* Needle */}
                    <g transform="rotate(-38 150 135)" filter="url(#needle-shadow-dark)">
                      {/* Metallic black body */}
                      <polygon points="150,131 235,135 150,139" fill="url(#metallic-needle)" />
                      <linearGradient id="metallic-needle" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={theme === 'dark' ? "#333333" : "#D4D4D4"} />
                        <stop offset="50%" stopColor={theme === 'dark' ? "#F5F5F0" : "#0B1728"} />
                        <stop offset="100%" stopColor={theme === 'dark' ? "#111111" : "#FFFFFF"} />
                      </linearGradient>
                      
                      {/* Base */}
                      <circle cx="150" cy="135" r="12" fill={theme === 'dark' ? "#111111" : "#FFFFFF"} stroke={theme === 'dark' ? "#333333" : "#D4D4D4"} strokeWidth="1" />
                      {/* Gold Center */}
                      <circle cx="150" cy="135" r="6" fill="var(--color-primary)" />
                    </g>
                  </svg>
                </div>
                <div className="text-center mt-[-5px] z-10 relative">
                  <p className="text-[38px] font-serif font-bold text-positive tracking-tight leading-none mb-2.5 ${theme === 'dark' ? 'drop-shadow-[0_0_15px_rgba(0,208,132,0.5)]' : ''}">Bullish</p>
                  <p className="text-[15px] font-medium text-text-muted">Overall market sentiment is positive.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Intelligence */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }} className="bg-ui-surface rounded-[32px] border border-ui-border shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 lg:p-10 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-[26px] font-serif font-bold text-text-main leading-tight tracking-tight">Market Intelligence</h3>
                  <p className="text-[14px] text-text-muted mt-1.5 font-medium">Top financial news and impacts</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-ui-surface-hover flex items-center justify-center border border-ui-border text-text-muted hover:text-primary hover:border-primary transition-colors shadow-sm">
                  <Newspaper size={18} strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-5">
                {/* News Item 1 */}
                <div className="group border border-ui-border rounded-[24px] p-5 hover:border-ui-border transition-all cursor-pointer bg-ui-surface hover:bg-ui-surface-hover hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-widest bg-ui-surface-hover text-text-main border border-ui-border px-2.5 py-1 rounded-full">Tech</span>
                         <span className="text-[12px] font-medium text-text-muted">2 hours ago</span>
                      </div>
                      <h4 className="text-[17px] font-bold text-text-main leading-tight mb-2 group-hover:text-primary transition-colors">TCS Secures Multi-Billion Dollar Deal with European Retailer</h4>
                      <p className="text-[14px] text-text-muted leading-relaxed line-clamp-2">India's largest IT services firm announced a massive digital transformation contract, boosting revenue visibility for the upcoming fiscal year.</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-ui-border flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-ui-surface-hover border border-ui-border flex items-center justify-center font-bold text-[12px] text-primary">TCS</div>
                       <div className="flex flex-col">
                         <span className="text-[15px] font-bold text-text-main leading-none mb-1">₹4,120.50</span>
                         <span className="text-[13px] font-bold text-positive flex items-center leading-none"><span className="text-[10px] mr-0.5">▲</span> +2.4%</span>
                       </div>
                     </div>
                     <button className="text-[13px] font-bold bg-ui-surface-hover border border-ui-border px-4 py-2 rounded-xl text-text-main hover:bg-primary hover:text-[#000000] hover:border-primary transition-colors flex items-center gap-1.5 shadow-sm">
                        Trade <ChevronRight size={14} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>

                {/* News Item 2 */}
                <div className="group border border-ui-border rounded-[24px] p-5 hover:border-ui-border transition-all cursor-pointer bg-ui-surface hover:bg-ui-surface-hover hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-widest bg-ui-surface-hover text-text-main border border-ui-border px-2.5 py-1 rounded-full">Banking</span>
                         <span className="text-[12px] font-medium text-text-muted">4 hours ago</span>
                      </div>
                      <h4 className="text-[17px] font-bold text-text-main leading-tight mb-2 group-hover:text-primary transition-colors">HDFC Bank Reports Strong Q3 Earnings, Margins Improve</h4>
                      <p className="text-[14px] text-text-muted leading-relaxed line-clamp-2">The private sector lender beat estimates with healthy credit growth and stable asset quality, leading to a surge in banking stocks.</p>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-ui-border flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-full bg-ui-surface-hover border border-ui-border flex items-center justify-center font-bold text-[12px] text-primary">HDFC</div>
                       <div className="flex flex-col">
                         <span className="text-[15px] font-bold text-text-main leading-none mb-1">₹1,680.10</span>
                         <span className="text-[13px] font-bold text-positive flex items-center leading-none"><span className="text-[10px] mr-0.5">▲</span> +1.8%</span>
                       </div>
                     </div>
                     <button className="text-[13px] font-bold bg-ui-surface-hover border border-ui-border px-4 py-2 rounded-xl text-text-main hover:bg-primary hover:text-[#000000] hover:border-primary transition-colors flex items-center gap-1.5 shadow-sm">
                        Trade <ChevronRight size={14} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-8 py-4 border border-ui-border text-text-main font-bold text-[14px] rounded-2xl hover:bg-ui-surface-hover hover:border-ui-border transition-colors flex items-center justify-center gap-2 shadow-sm">
                View All Market News <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* 8. Bottom Market Ticker */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-ui-sidebar border-t border-ui-border z-50 flex items-center overflow-hidden">
        <div className="flex items-center h-full px-4 border-r border-ui-border shrink-0 bg-ui-bg z-10 relative">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse mr-2" />
          <span className="text-[11px] font-bold text-text-main uppercase tracking-widest">Live Markets</span>
        </div>
        
        {/* Ticker Animation Container */}
        <div className="flex items-center h-full flex-1 relative overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-[ticker_30s_linear_infinite] pl-10 hover:[animation-play-state:paused]">
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">NIFTY 50</span>
              <span className="text-[11px] font-mono text-text-main">24,716.30</span>
              <span className="text-[11px] font-mono font-bold text-positive">+0.82%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">SENSEX</span>
              <span className="text-[11px] font-mono text-text-main">81,123.45</span>
              <span className="text-[11px] font-mono font-bold text-positive">+0.76%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">NASDAQ</span>
              <span className="text-[11px] font-mono text-text-main">17,623.91</span>
              <span className="text-[11px] font-mono font-bold text-positive">+1.14%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">S&P 500</span>
              <span className="text-[11px] font-mono text-text-main">5,487.21</span>
              <span className="text-[11px] font-mono font-bold text-positive">+0.67%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">RELIANCE</span>
              <span className="text-[11px] font-mono text-text-main">2,840.75</span>
              <span className="text-[11px] font-mono font-bold text-negative">-0.61%</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">TCS</span>
              <span className="text-[11px] font-mono text-text-main">4,120.50</span>
              <span className="text-[11px] font-mono font-bold text-positive">+2.40%</span>
            </div>

            {/* Duplicate for seamless scrolling */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-text-main">NIFTY 50</span>
              <span className="text-[11px] font-mono text-text-main">24,716.30</span>
              <span className="text-[11px] font-mono font-bold text-positive">+0.82%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
