const fs = require('fs');

const code = `/**
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

export const DashboardView: React.FC<DashboardViewProps> = ({ onTrade }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeFilter, setActiveFilter] = useState('1M');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState('Value (High → Low)');
  
  const { profile } = usePortfolio();
  const { stocks } = useMarketData();
  const { openModal, addToast, setIsCopilotOpen } = useUI();

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
        <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Total Portfolio Value</p>
            <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">₹2,469,011.47</p>
            <p className="text-xs font-bold text-positive mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              +₹2,457,354.21 (+21080.03%)
            </p>
          </div>
        </div>

        <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Today's P/L</p>
            <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">+₹612.38</p>
            <p className="text-xs font-bold text-positive mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              (+4.03%)
            </p>
          </div>
        </div>

        <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">Cash Balance</p>
            <p className="text-2xl xl:text-3xl font-serif font-black text-text-main">₹10,774.33</p>
          </div>
        </div>

        <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
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
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* LEFT MAIN CONTENT */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* Portfolio Performance */}
          <div className="vibrant-card p-6">
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
                    className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors \${
                      activeFilter === f ? 'bg-ui-surface text-primary-dark shadow-sm' : 'text-text-muted hover:text-text-main'
                    }\`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
               <PortfolioGraph 
                  historicalData={profile.history || []} 
                  currentValue={12500} 
                  baseline={10000} 
                  height={300}
               />
            </div>
          </div>

          {/* Active Positions */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ui-border mb-6">
              <div className="flex gap-6 overflow-x-auto no-scrollbar relative flex-1">
                {TABS.map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={\`pb-4 text-sm font-semibold transition-all whitespace-nowrap relative \${
                      activeTab === tab ? 'text-text-main' : 'text-text-muted hover:text-text-main'
                    }\`}
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
                  className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'list' ? 'bg-ui-surface text-text-main' : 'text-text-muted hover:text-text-main'}\`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'grid' ? 'bg-ui-surface text-text-main' : 'text-text-muted hover:text-text-main'}\`}
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* TITAN CARD */}
              <div className="vibrant-card p-5 group">
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
              </div>

              {/* AMD CARD */}
              <div className="vibrant-card p-5 group">
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
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT INTELLIGENCE PANEL */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-6">
          
          {/* AI Portfolio Copilot Card */}
          <div className="vibrant-card p-6 border-primary/30 relative overflow-hidden group">
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
          </div>

          {/* Asset Allocation */}
          <div className="vibrant-card p-6">
            <h3 className="text-base font-bold text-text-main mb-6">Asset Allocation</h3>
            <div className="flex justify-center mb-6 relative">
               <div className="w-48 h-48 rounded-full" style={{ background: 'conic-gradient(#C9A23A 0% 56.6%, #00A878 56.6% 88.5%, #64748B 88.5% 96.9%, #D94B5B 96.9% 100%)' }}>
                 <div className="absolute inset-4 bg-ui-surface rounded-full flex flex-col items-center justify-center shadow-inner">
                   <p className="text-xl font-serif font-black text-text-main">₹2.46M</p>
                   <p className="text-[10px] uppercase font-bold text-text-muted">Total Value</p>
                 </div>
               </div>
            </div>
            <div className="space-y-3">
               <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-sm bg-[#C9A23A]" />
                   <span className="text-xs font-bold text-text-main">TITAN</span>
                 </div>
                 <span className="text-xs font-mono text-text-muted group-hover:text-text-main transition-colors">56.6%</span>
               </div>
               <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-sm bg-[#00A878]" />
                   <span className="text-xs font-bold text-text-main">AMD</span>
                 </div>
                 <span className="text-xs font-mono text-text-muted group-hover:text-text-main transition-colors">31.9%</span>
               </div>
               <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-sm bg-[#64748B]" />
                   <span className="text-xs font-bold text-text-main">Cash</span>
                 </div>
                 <span className="text-xs font-mono text-text-muted group-hover:text-text-main transition-colors">8.4%</span>
               </div>
               <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-sm bg-[#D94B5B]" />
                   <span className="text-xs font-bold text-text-main">Others</span>
                 </div>
                 <span className="text-xs font-mono text-text-muted group-hover:text-text-main transition-colors">3.1%</span>
               </div>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="vibrant-card p-6">
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
          </div>

          {/* Top Movers Today */}
          <div className="vibrant-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-text-main">Top Movers Today</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-ui-bg border border-primary text-primary-dark">Gainers</button>
              <button className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-transparent text-text-muted hover:bg-ui-bg transition-colors">Losers</button>
            </div>
            <div className="space-y-3">
              {[
                { s: 'TITAN', v: '+1.17%' },
                { s: 'AMD', v: '+2.54%' },
                { s: 'RELIANCE', v: '+1.28%' },
                { s: 'HDFC', v: '+0.96%' },
                { s: 'INFY', v: '+0.83%' },
              ].map(mover => (
                <div key={mover.s} className="flex justify-between items-center p-2 rounded-lg hover:bg-ui-bg transition-colors cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-[10px] font-bold text-text-main">{mover.s.substring(0, 2)}</div>
                      <span className="text-sm font-bold text-text-main">{mover.s}</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-positive">{mover.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top News */}
          <div className="vibrant-card p-6">
            <h3 className="text-base font-bold text-text-main mb-4">Top News for You</h3>
            <div className="space-y-4">
              {[
                { t: 'AMD', h: 'New AI chip demand boosts revenue outlook', time: '2 hours ago · Reuters' },
                { t: 'TITAN', h: 'Strong Q4 results beat expectations', time: '4 hours ago · Bloomberg' },
                { t: 'India', h: 'NIFTY reaches new 52-week high', time: '5 hours ago · Economic Times' },
                { t: 'NVDA', h: 'AI infrastructure demand continues to grow', time: '6 hours ago · TechCrunch' }
              ].map((news, i) => (
                <div key={i} className="group cursor-pointer border-b border-ui-border last:border-0 pb-4 last:pb-0">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold uppercase text-primary-dark mb-1 block">{news.t}</span>
                      <p className="text-sm font-medium text-text-main leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{news.h}</p>
                      <p className="text-[10px] text-text-muted">{news.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="vibrant-card p-6">
            <h3 className="text-base font-bold text-text-main mb-4">Recent Activity</h3>
            <div className="space-y-4">
               {[
                 { type: 'BUY', symbol: 'AMD', desc: '10 shares @ $175.77', color: 'text-positive' },
                 { type: 'BUY', symbol: 'TITAN', desc: '245 shares @ ₹3,645.60', color: 'text-positive' },
                 { type: 'DIV', symbol: 'TITAN', desc: 'Dividend Received', color: 'text-primary' },
                 { type: 'BUY', symbol: 'AAPL', desc: '5 shares @ $168.20', color: 'text-positive' },
               ].map((act, i) => (
                 <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ui-bg transition-colors cursor-pointer group">
                    <div className={\`w-10 h-10 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-[10px] font-bold \${act.color}\`}>
                       {act.type}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{act.symbol}</p>
                      <p className="text-xs text-text-muted font-mono">{act.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Goals */}
          <div className="vibrant-card p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-main">Your Goals</h3>
                <button className="text-xs text-primary hover:text-primary-light font-bold flex items-center gap-1">Manage <ArrowRight size={12} /></button>
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
                   <p className="text-[10px] text-text-muted font-mono mt-1 text-right">₹15,00,000 / ₹30,00,000</p>
                </div>
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold text-text-main">Retirement Fund</p>
                      <p className="text-xs font-mono font-bold text-text-main">28%</p>
                   </div>
                   <div className="w-full h-2 rounded-full bg-ui-bg border border-ui-border overflow-hidden">
                      <div className="h-full bg-positive rounded-full w-[28%]" />
                   </div>
                   <p className="text-[10px] text-text-muted font-mono mt-1 text-right">₹28,20,000 / ₹1,00,00,000</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Rewrote dashboard successfully.");
