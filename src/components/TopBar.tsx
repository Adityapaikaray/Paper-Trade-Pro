/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Wallet, Moon, Sun, TrendingUp, TrendingDown, Gauge, ArrowUpRight, LogOut, Settings, User } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useUI } from '../contexts/UIContext.tsx';
import { AnimatePresence, motion } from 'framer-motion';

interface TopBarProps {
  onSearchFocus: () => void;
  onNavigate?: (tab: string) => void;
}

const TOP_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'SPY'];

const TopBar: React.FC<TopBarProps> = ({ onSearchFocus, onNavigate }) => {
  const { profile } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const { stocks, indices, priceTicks, indexTicks } = useMarketData();
  const { openModal, addToast } = useUI();
  
  const [ribbonMode, setRibbonMode] = useState<'indices' | 'equities'>('indices');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featuredStocks = TOP_TICKERS.map(sym => stocks.find(s => s.symbol === sym)).filter(Boolean);

  return (
    <header className="h-16 lg:h-20 bg-ui-surface/80 backdrop-blur-2xl border-b border-ui-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-colors duration-500 gap-4 lg:gap-6">
      {/* Mobile Logo (Shown only on small screens) */}
      <div className="lg:hidden flex items-center shrink-0 mr-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-text-main text-ui-surface">
          <ArrowUpRight size={18} strokeWidth={3} />
        </div>
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-64 lg:w-72 shrink max-w-md lg:shrink-0 transition-all">
        <div className="relative group">
          <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Search... (⌘K)" 
            onFocus={onSearchFocus}
            readOnly
            className="w-full bg-ui-bg border border-ui-border rounded-xl py-2 pl-9 lg:pl-11 pr-3 lg:pr-4 focus:outline-none focus:border-primary/50 focus:bg-ui-surface transition-all text-xs text-text-main font-bold placeholder:text-text-muted tracking-wide cursor-pointer shadow-inner"
          />
        </div>
      </div>

      {/* Real-time ticker ribbon: Indices & Equities (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1 max-w-3xl">
        <div className="flex items-center gap-1 bg-ui-bg p-0.5 rounded-lg border border-ui-border shrink-0 mr-1">
          <button
            onClick={() => setRibbonMode('indices')}
            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
              ribbonMode === 'indices'
                ? 'bg-primary text-ui-bg shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Indices
          </button>
          <button
            onClick={() => setRibbonMode('equities')}
            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${
              ribbonMode === 'equities'
                ? 'bg-primary text-ui-bg shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Stocks
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live
        </div>

        {ribbonMode === 'indices' ? (
          indices.map(idx => {
            const tick = indexTicks[idx.key];
            const isPositive = idx.change >= 0;
            return (
              <button 
                key={idx.key}
                id={`ribbon-index-${idx.key}`}
                onClick={() => onNavigate?.('key-index')}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-ui-border transition-all duration-300 shrink-0 cursor-pointer hover:border-primary/50 ${
                  tick === 'up' 
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400' 
                    : tick === 'down' 
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-400' 
                    : 'bg-ui-bg text-text-main'
                }`}
              >
                <span className="text-[10px] font-serif italic font-bold text-text-muted">{idx.displaySymbol}</span>
                <span className="text-[11px] font-mono font-black italic">
                  {idx.currency}{idx.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <span className={`text-[9px] font-mono font-bold flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{idx.percentChange.toFixed(2)}%
                </span>
              </button>
            );
          })
        ) : (
          featuredStocks.map(stock => {
            if (!stock) return null;
            const tick = priceTicks[stock.symbol];
            return (
              <div 
                key={stock.symbol}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ui-border transition-all duration-300 shrink-0 ${
                  tick === 'up' 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                    : tick === 'down' 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                    : 'bg-ui-bg text-text-main'
                }`}
              >
                <span className="text-[10px] font-serif italic text-text-muted">{stock.symbol}</span>
                <span className="text-[11px] font-mono font-black italic">
                  {stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-[9px] font-mono font-bold flex items-center ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden lg:flex items-center gap-3 px-5 py-2 bg-ui-bg border border-ui-border rounded-xl shadow-md">
          <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary shadow-sm">
            <Wallet size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-primary-dark uppercase tracking-[0.2em] leading-none mb-1 opacity-70 font-serif italic">Liquid Balance</span>
            <span className="text-base font-mono font-black text-primary tracking-tight leading-none italic">
              ${profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-ui-bg text-text-muted hover:text-primary hover:bg-white/5 border border-ui-border flex items-center justify-center transition-all shadow-sm"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <button 
            onClick={() => {
              addToast('No new notifications', 'info');
              // This could open a notification modal later
            }}
            className="w-9 h-9 rounded-xl bg-ui-bg text-text-muted hover:text-primary hover:bg-ui-surface-hover border border-ui-border flex items-center justify-center transition-all relative shadow-sm hover:scale-[0.98] active:scale-95 duration-200"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-ui-bg flex items-center justify-center text-[8px] font-bold text-white leading-none">3</span>
          </button>
          
          <div className="relative" ref={profileRef}>
            <div 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-3 border-l border-ui-border cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary-dark to-primary-light p-[1.5px] shadow-sm transition-transform hover:scale-105 duration-300">
                <div className="w-full h-full bg-[#6366F1] rounded-full flex items-center justify-center text-white font-black uppercase text-sm">\n                  JD\n                </div>
              </div>
              <div className="hidden sm:flex flex-col items-start mr-1">
                <p className="text-xs font-bold text-gray-900 dark:text-text-main leading-tight group-hover:text-primary transition-colors">James Doe</p>
                <p className="text-[9px] font-black text-primary-dark uppercase tracking-widest leading-none">ELITE TIER</p>
              </div>
              <motion.svg animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-text-main transition-colors hidden sm:block">
                <path d="m6 9 6 6 6-6"/>
              </motion.svg>
            </div>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-3 w-56 bg-ui-surface border border-ui-border rounded-xl shadow-2xl overflow-hidden py-2 z-50"
                >
                  <div className="px-4 py-2 mb-2 border-b border-ui-border">
                    <p className="text-sm font-bold text-text-main">Prestige User</p>
                    <p className="text-xs text-text-muted">user@tradepro.com</p>
                  </div>
                  
                  <button onClick={() => { setProfileOpen(false); onNavigate?.('settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors flex items-center gap-3">
                    <User size={16} /> Profile
                  </button>
                  <button onClick={() => { setProfileOpen(false); onNavigate?.('settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors flex items-center gap-3">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={() => { setProfileOpen(false); addToast('Billing options coming soon', 'info'); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors flex items-center gap-3">
                    <Wallet size={16} /> Billing
                  </button>
                  
                  <div className="h-px bg-ui-border my-2" />
                  
                  <button onClick={() => { setProfileOpen(false); addToast('Logged out successfully', 'success'); }} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-3">
                    <LogOut size={16} /> Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
