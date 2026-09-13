/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, Settings, LogOut, User, Menu, PlusCircle, RotateCcw, Check, CheckCheck, Trash2, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface TopBarProps {
  onSearchFocus: () => void;
  onNavigate?: (tab: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearchFocus, onNavigate }) => {
  const { user, logout } = useAuth();
  const { addToast, toggleMobileMenu, openModal } = useUI();
  const { theme, toggleTheme } = useTheme();
  const {
    profile,
    marketContext,
    setMarketContext,
    addFunds,
    resetAccount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
  } = usePortfolio();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (market: 'IN' | 'US') => {
    setMarketContext(market);
    setSwitcherOpen(false);
    addToast(`Switched to ${market === 'IN' ? 'Indian' : 'US'} Markets`, 'success');
  };

  const handleAddVirtualCash = () => {
    const isIN = marketContext === 'IN';
    const amount = isIN ? 100000 : 10000;
    const cur = isIN ? '₹' : '$';
    addFunds(amount, cur);
    addToast(`Added ${cur}${amount.toLocaleString()} virtual cash to your practice account!`, 'success');
  };

  const handleResetVirtualAccount = () => {
    setSwitcherOpen(false);
    openModal('reset-portfolio');
  };

  const currentCurrency = marketContext === 'IN' ? '₹' : '$';
  const currentBalance = profile?.balances?.[currentCurrency] || 0;

  const notifications = profile?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-20 lg:h-[88px] shrink-0 border-b border-ui-border bg-ui-bg flex items-center justify-between px-4 md:px-6 lg:px-10 z-20 sticky top-0 transition-all duration-300">
      
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleMobileMenu}
        className="md:hidden mr-4 p-2 text-text-muted hover:text-text-main"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      {/* Left section - Search */}
      <div className="flex-1 max-w-xl">
        <div 
          className="relative group cursor-text"
          onClick={onSearchFocus}
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-hover:text-primary transition-colors">
            <Search size={18} strokeWidth={2} />
          </div>
          <input
            type="text"
            className="w-full bg-ui-surface border border-ui-border text-text-main placeholder:text-text-muted text-[15px] font-medium rounded-full py-3.5 pl-11 pr-4 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all cursor-text shadow-sm"
            placeholder="Search symbols, indices, or news... (⌘K)"
            readOnly
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="hidden sm:inline-flex items-center justify-center bg-ui-surface-hover text-text-muted border border-ui-border rounded px-1.5 py-0.5 text-[10px] font-bold tracking-widest">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right section - Actions & Profile */}
      <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-4">
        
        {/* Virtual Account / Market Switcher */}
        <div className="relative hidden lg:block" ref={switcherRef}>
          <div 
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center gap-4 px-5 py-2.5 bg-ui-surface border border-ui-border rounded-full shadow-md cursor-pointer hover:border-primary hover:shadow-primary/10 transition-all"
          >
            <div className="text-[18px] leading-none">{marketContext === 'IN' ? '🇮🇳' : '🇺🇸'}</div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-positive flex items-center gap-1.5 uppercase tracking-[0.2em] leading-none mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-positive shadow-[0_0_5px_var(--color-positive)] animate-pulse"></span>
                VIRTUAL ACCOUNT
              </span>
              <span className="text-[15px] font-mono font-bold text-text-main tracking-tight leading-none flex items-center gap-2">
                {currentCurrency}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-[8px] text-text-muted">▼</span>
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
                className="absolute right-0 top-full mt-3 w-72 bg-ui-surface border border-ui-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-ui-border flex items-center justify-between">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Paper Portfolio</p>
                  <span className="text-[10px] bg-positive/10 text-positive px-2 py-0.5 rounded-full font-bold">Simulated</span>
                </div>
                
                <button 
                  onClick={() => handleSwitch('IN')}
                  className={`w-full text-left px-4 py-3 hover:bg-ui-surface-hover transition-colors flex items-center justify-between ${marketContext === 'IN' ? 'bg-ui-surface-hover' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇮🇳</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">Indian Markets (NSE/BSE)</span>
                      <span className="text-xs font-mono font-bold text-text-muted">₹{(profile?.balances?.['₹'] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} cash</span>
                    </div>
                  </div>
                  {marketContext === 'IN' && <span className="text-primary font-bold">✓</span>}
                </button>
                <button 
                  onClick={() => handleSwitch('US')}
                  className={`w-full text-left px-4 py-3 hover:bg-ui-surface-hover transition-colors flex items-center justify-between ${marketContext === 'US' ? 'bg-ui-surface-hover' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🇺🇸</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">US Markets (NYSE/NASDAQ)</span>
                      <span className="text-xs font-mono font-bold text-text-muted">${(profile?.balances?.['$'] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} cash</span>
                    </div>
                  </div>
                  {marketContext === 'US' && <span className="text-primary font-bold">✓</span>}
                </button>

                <div className="h-px bg-ui-border my-2" />

                <div className="px-3 py-1 space-y-1">
                  <button 
                    onClick={handleAddVirtualCash}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <PlusCircle size={14} />
                    <span>Add {marketContext === 'IN' ? '₹1,00,000' : '$10,000'} Virtual Funds</span>
                  </button>

                  <button 
                    onClick={handleResetVirtualAccount}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Paper Portfolio</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Switch */}
        <div 
          onClick={toggleTheme}
          className="hidden sm:flex items-center bg-ui-surface border border-ui-border rounded-full p-1 cursor-pointer shadow-md transition-all relative w-16 h-8 hover:border-primary/50"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="w-full flex justify-between px-1.5 z-10 text-text-muted">
            <Sun size={14} strokeWidth={theme === 'light' ? 2 : 1.5} className={theme === 'light' ? 'text-primary' : 'opacity-50'} />
            <Moon size={14} strokeWidth={theme === 'dark' ? 2 : 1.5} className={theme === 'dark' ? 'text-primary' : 'opacity-50'} />
          </div>
          <div 
            className={`absolute w-6 h-6 rounded-full bg-ui-surface-hover border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-transform duration-500 ease-in-out ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}`} 
          />
        </div>
        
        {/* Notifications Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-full bg-ui-surface text-text-muted hover:text-primary hover:bg-ui-surface-hover border border-ui-border flex items-center justify-center transition-all relative shadow-md"
            title="Notifications"
          >
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-ui-surface border border-ui-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[500px]"
              >
                {/* Panel Header */}
                <div className="px-4 py-3 border-b border-ui-border flex items-center justify-between bg-ui-bg/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-main">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.2 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="overflow-y-auto divide-y divide-ui-border custom-scrollbar flex-1">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 hover:bg-ui-surface-hover/80 transition-colors flex items-start gap-3 cursor-pointer group ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-text-main truncate">{notif.title}</h4>
                            <span className="text-[10px] text-text-muted shrink-0 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{notif.message}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-rose-500 p-1 rounded transition-opacity"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-ui-border cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-ui-bg border border-primary shadow-primary/20 transition-transform hover:scale-105 duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full flex items-center justify-center text-text-main font-black uppercase text-sm">
                PU
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-start mr-1">
              <p className="text-[13px] font-bold text-text-main leading-tight group-hover:text-primary transition-colors">{user?.name || "Prestige User"}</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mt-0.5">PAPER TRADER</p>
            </div>
          </div>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-3 w-56 bg-ui-surface border border-ui-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
              >
                <div className="px-4 py-2 mb-2 border-b border-ui-border">
                  <p className="text-sm font-bold text-text-main">{user?.name || "Prestige User"}</p>
                  <p className="text-xs text-text-muted">{user?.email || "adityapaikaray31@gmail.com"}</p>
                </div>
                
                <button onClick={() => { setProfileOpen(false); onNavigate?.('settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors flex items-center gap-3">
                  <User size={16} /> Profile
                </button>
                <button onClick={() => { setProfileOpen(false); onNavigate?.('settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-ui-surface-hover transition-colors flex items-center gap-3">
                  <Settings size={16} /> Settings
                </button>
                
                <div className="h-px bg-ui-border my-2" />
                
                <button onClick={() => { setProfileOpen(false); logout(); addToast('Logged out successfully', 'success'); }} className="w-full text-left px-4 py-2 text-sm text-negative hover:bg-negative/10 transition-colors flex items-center gap-3">
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

