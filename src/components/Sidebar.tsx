/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, TrendingUp, Briefcase, History, Eye, Settings, BarChart3, Newspaper, GraduationCap, Crown, HelpCircle, ArrowUpRight, Wrench, ArrowRight } from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { openModal } = useUI();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'market', icon: Eye, label: 'Discover' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'trade', icon: ArrowUpRight, label: 'Trade' },
    { id: 'orders', icon: TrendingUp, label: 'Orders' },
    { id: 'wallet', icon: Crown, label: 'Wallet' },
    { id: 'profile', icon: Settings, label: 'Profile' },
  ];
  
  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Support' },
  ];

  return (
    <div className="hidden md:flex md:w-20 xl:w-[240px] border-r border-ui-border h-screen flex-col bg-[var(--ui-sidebar)] z-20 transition-all duration-300 overflow-y-auto custom-scrollbar shrink-0 text-text-main relative">
      <div className="p-8 md:p-4 xl:p-8 pb-6 sticky top-0 bg-[var(--ui-sidebar)] z-10 flex justify-center xl:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center bg-primary text-[#050505] shadow-sm">
            <ArrowUpRight size={20} strokeWidth={2.5} />
          </div>
          <div className="hidden xl:flex flex-col">
            <h1 className="text-xl font-serif font-black text-text-main leading-none uppercase tracking-wide">
              TRADEPRO
            </h1>
            <p className="text-[8px] font-sans font-bold text-primary mt-1.5 uppercase tracking-[0.1em]">
              Track. Analyze. Grow.
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
            className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] overflow-hidden ${
              activeTab === item.id 
                ? 'bg-ui-surface-hover text-text-main font-medium shadow-sm' 
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
            )}
            <div className={`shrink-0 transition-all duration-200 ${activeTab === item.id ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
            </div>
            <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
              {item.label}
            </span>
          </button>
        ))}
        
        <div className="pt-6 mt-4 border-t border-ui-border space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-ui-surface-hover text-text-main font-medium shadow-sm' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${activeTab === item.id ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
              </div>
              <span className="hidden xl:block text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 md:p-4 xl:p-6 mt-auto relative z-10">
        <div className="p-5 md:p-0 xl:p-5 rounded-2xl bg-ui-surface border border-primary/50 shadow-[0_0_20px_rgba(212,175,55,0.05)] flex flex-col items-center xl:items-start relative group cursor-pointer hover:border-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300" onClick={() => openModal('upgrade')}>
          <div className="w-10 h-10 rounded-full bg-ui-sidebar border border-primary flex shrink-0 items-center justify-center text-primary mb-3 md:mb-0 xl:mb-4 group-hover:bg-primary/10 transition-colors" title="Upgrade to Pro">
            <Crown size={20} strokeWidth={1.5} />
          </div>
          <h4 className="hidden xl:block text-[13px] font-bold text-text-main mb-2 font-serif italic tracking-wide">Upgrade to Pro</h4>
          <p className="hidden xl:block text-[11px] text-text-muted mb-4 leading-relaxed font-medium">
            Advanced analytics.<br />Real-time data.<br />Deeper insights.<br />Trade like an institution.
          </p>
          <div className="hidden xl:flex text-[11px] font-bold text-primary uppercase tracking-wider items-center gap-1 group-hover:gap-2 transition-all">
            Upgrade Now <ArrowRight size={12} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
