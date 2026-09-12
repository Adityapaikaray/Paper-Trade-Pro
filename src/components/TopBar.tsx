import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, ArrowUpRight, ArrowDownRight, User, Settings, LogOut, Wallet, Moon, Sun, ArrowRightLeft } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketRegion } from '../types.ts';

interface TopBarProps {
  onSearchFocus?: () => void;
  onNavigate?: (tab: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearchFocus, onNavigate }) => {
  const { profile, marketContext, setMarketContext } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useUI();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrency = marketContext === 'IN' ? '₹' : '$';
  const currentBalance = profile.balances?.[currentCurrency] || 0;

  const handleSwitch = (newMarket: MarketRegion) => {
    setMarketContext(newMarket);
    setSwitcherOpen(false);
    addToast(`Switched to ${newMarket === 'IN' ? 'Indian' : 'US'} Markets`, 'success');
  };

  return (
    <header className="h-20 bg-ui-surface/80 backdrop-blur-xl border-b border-ui-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors duration-500">
      
      {/* Left section - Search */}
      <div className="flex-1 max-w-xl">
        <div 
          onClick={onSearchFocus}
          className="relative group cursor-text"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors" size={18} />
          <div className="w-full h-11 bg-ui-bg border border-ui-border rounded-2xl pl-11 pr-4 flex items-center text-sm text-text-muted group-hover:border-primary/50 group-hover:bg-ui-surface transition-all shadow-sm">
            Search symbols, news, or commands...
            <div className="ml-auto hidden sm:flex items-center gap-1 opacity-70">
              <kbd className="font-sans font-medium text-[10px] bg-ui-surface border border-ui-border rounded px-1.5 py-0.5 shadow-sm text-text-muted">⌘</kbd>
              <kbd className="font-sans font-medium text-[10px] bg-ui-surface border border-ui-border rounded px-1.5 py-0.5 shadow-sm text-text-muted">K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0 ml-4">
        
        {/* Virtual Account / Market Switcher */}
        <div className="relative hidden lg:block" ref={switcherRef}>
          <div 
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-3 px-5 py-2 bg-ui-bg border border-ui-border rounded-xl shadow-md cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary shadow-sm">
              <span className="text-[14px]">{marketContext === 'IN' ? '🇮🇳' : '🇺🇸'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-emerald-500 flex items-center gap-1.5 uppercase tracking-[0.2em] leading-none mb-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                VIRTUAL ACCOUNT
              </span>
              <span className="text-base font-mono font-black text-text-main tracking-tight leading-none italic flex items-center gap-1.5">
                {currentCurrency}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-[9px] text-text-muted no-underline">▼</span>
              </span>
            </div>
          </div>

          <AnimatePresence>
            {switcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-3 w-64 bg-ui-surface border border-ui-border rounded-xl shadow-2xl overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-3 mb-2 border-b border-ui-border">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Switch Trading Market</p>
                </div>
                
                <button 
                  onClick={() => handleSwitch('IN')}
                  className={`w-full text-left px-4 py-3 hover:bg-ui-surface-hover transition-colors flex items-center justify-between ${marketContext === 'IN' ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇮🇳</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">Indian Markets</span>
                      <span className="text-[10px] text-text-muted">₹{(profile.balances?.['₹'] || 0).toLocaleString()} virtual value</span>
                    </div>
                  </div>
                  {marketContext === 'IN' && <span className="text-primary">✓</span>}
                </button>

                <button 
                  onClick={() => handleSwitch('US')}
                  className={`w-full text-left px-4 py-3 hover:bg-ui-surface-hover transition-colors flex items-center justify-between ${marketContext === 'US' ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇺🇸</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">US Markets</span>
                      <span className="text-[10px] text-text-muted">${(profile.balances?.['$'] || 0).toLocaleString()} virtual value</span>
                    </div>
                  </div>
                  {marketContext === 'US' && <span className="text-primary">✓</span>}
                </button>

                <div className="h-px bg-ui-border my-2" />
                <button 
                  onClick={() => { setSwitcherOpen(false); addToast('Adding custom markets coming soon.', 'info'); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-2"
                >
                  + Add Market
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-ui-bg text-text-muted hover:text-primary hover:bg-white/5 border border-ui-border flex items-center justify-center transition-all shadow-sm hidden sm:flex"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        {/* Notifications */}
        <button 
          onClick={() => { addToast('No new notifications', 'info'); }}
          className="w-9 h-9 rounded-xl bg-ui-bg text-text-muted hover:text-primary hover:bg-ui-surface-hover border border-ui-border flex items-center justify-center transition-all relative shadow-sm"
        >
          <Bell size={16} />
          
        </button>
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-4 border-l border-ui-border cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-[#D4AF37] to-amber-200 p-[1.5px] shadow-sm transition-transform hover:scale-105 duration-300">
              <div className="w-full h-full bg-ui-surface rounded-full flex items-center justify-center text-text-main font-black uppercase text-sm">
                PU
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-start mr-1">
              <p className="text-xs font-bold text-text-main leading-tight group-hover:text-primary transition-colors">Prestige User</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">ELITE TIER</p>
            </div>
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
                
                <div className="h-px bg-ui-border my-2" />
                
                <button onClick={() => { setProfileOpen(false); logout(); addToast('Logged out successfully', 'success'); }} className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-3">
                  <LogOut size={16} /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
