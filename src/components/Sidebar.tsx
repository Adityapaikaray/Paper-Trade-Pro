/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, TrendingUp, Briefcase, History, Eye, Settings, BarChart3, Newspaper, GraduationCap, Crown, HelpCircle, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { openModal } = useUI();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'market', icon: BarChart3, label: 'Markets' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'watchlist', icon: Eye, label: 'Watchlist' },
    { id: 'news', icon: Newspaper, label: 'News' },
  ];
  
  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="hidden md:flex md:w-20 xl:w-64 border-r border-ui-border h-screen flex-col bg-ui-surface z-20 transition-all duration-300 overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-8 md:p-4 xl:p-8 pb-6 sticky top-0 bg-ui-surface z-10 flex justify-center xl:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center bg-gold-dark text-white shadow-sm">
            <ArrowUpRight size={20} strokeWidth={3} />
          </div>
          <div className="hidden xl:flex flex-col">
            <h1 className="text-xl font-serif font-black text-text-main leading-none uppercase tracking-wide">
              TRADEPRO
            </h1>
            <p className="text-[8px] font-sans font-bold text-text-muted mt-1 uppercase tracking-[0.1em]">
              Trade. Analyze. Grow.
            </p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 md:px-2 xl:px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            title={item.label}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-300 group relative justify-center xl:justify-start active:scale-[0.98] ${
              activeTab === item.id 
                ? 'bg-[#F6F4EB] text-gold-dark font-semibold shadow-sm dark:bg-gold/10' 
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover font-medium'
            }`}
          >
            <div className={`shrink-0 transition-all duration-300 ${activeTab === item.id ? 'text-gold-dark' : 'text-text-muted group-hover:text-text-main'}`}>
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
            </div>
            <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
              {item.label}
            </span>
          </button>
        ))}
        
        <div className="pt-6 mt-4 border-t border-ui-border/50 space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-300 group relative justify-center xl:justify-start active:scale-[0.98] ${
                activeTab === item.id 
                  ? 'bg-[#F6F4EB] text-gold-dark font-semibold shadow-sm dark:bg-gold/10' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover font-medium'
              }`}
            >
              <div className={`shrink-0 transition-all duration-300 ${activeTab === item.id ? 'text-gold-dark' : 'text-text-muted group-hover:text-text-main'}`}>
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
              </div>
              <span className="hidden xl:block text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 md:p-4 xl:p-6 mt-auto">
        <div className="p-5 md:p-0 xl:p-5 rounded-2xl bg-[#F6F4EB] border border-[#E9E4D4] dark:bg-gold/10 dark:border-gold/20 flex flex-col items-center xl:items-start shadow-sm md:bg-none md:border-none xl:bg-linear-to-br xl:border relative group cursor-pointer" onClick={() => openModal('upgrade')}>
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gold/20 shadow-sm flex shrink-0 items-center justify-center text-gold-dark mb-3 md:mb-0 xl:mb-3" title="Upgrade to Pro">
            <Crown size={16} strokeWidth={2.5} />
          </div>
          <h4 className="hidden xl:block text-sm font-bold text-gray-800 dark:text-text-main mb-1">Upgrade to Pro</h4>
          <p className="hidden xl:block text-[10px] text-gray-500 dark:text-text-muted mb-0 leading-relaxed font-medium">
            Advanced tools.<br />Deeper insights.<br />Trade like an institution.
          </p>
          <div className="hidden xl:flex absolute right-5 bottom-5 w-6 h-6 rounded-full bg-white dark:bg-gold/20 items-center justify-center text-gold-dark shadow-sm group-hover:translate-x-1 transition-transform">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
