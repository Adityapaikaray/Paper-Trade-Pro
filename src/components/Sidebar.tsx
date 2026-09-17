/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, TrendingUp, Briefcase, History, Eye, Settings, 
  Menu, Crown, HelpCircle, ArrowUpRight, ArrowRight, ChevronDown, 
  BellRing, ListTodo
} from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { AnimatePresence, motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { openModal } = useUI();
  const { navigate, activeTab, currentRoute } = useNavigation();
  const [isMoreExpanded, setIsMoreExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'market', icon: Eye, label: 'Discover' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'wealth', icon: Crown, label: 'Wealth' },
  ];

  const moreItems = [
    { id: 'orders', icon: TrendingUp, label: 'Orders' },
    { id: 'watchlist', icon: ListTodo, label: 'Watchlist' },
    { id: 'alerts', icon: BellRing, label: 'Alerts' },
    { id: 'transactions', icon: History, label: 'Transactions' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'more') {
      setIsMoreExpanded(!isMoreExpanded);
      if (!isMoreExpanded && activeTab !== 'more') {
        // Just expand, maybe navigate to first more item if needed? No, just expand
      }
    } else {
      navigate(id as RouteId);
    }
  };

  const isMoreActive = activeTab === 'more';

  return (
    <div className="hidden md:flex md:w-20 xl:w-[240px] border-r border-ui-border h-screen flex-col bg-[var(--ui-sidebar)] z-20 transition-all duration-300 overflow-y-auto custom-scrollbar shrink-0 text-text-main relative">
      <div className="p-8 md:p-4 xl:p-8 pb-6 sticky top-0 bg-[var(--ui-sidebar)] z-10 flex justify-center xl:justify-start">
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-3 transition-transform active:scale-95 outline-none">
          <img src="/tradepro-icon.jpg" alt="TradePro" className="w-8 h-8 rounded-lg object-contain xl:hidden" />
          <img src="/tradepro-logo.jpg" alt="TRADEPRO" className="hidden xl:block h-10 w-auto object-contain" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 md:px-2 xl:px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              title={item.label}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] overflow-hidden ${
                isActive 
                  ? 'bg-ui-surface-hover text-text-main font-medium shadow-sm' 
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              </div>
              <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* More Button */}
        <div className="pt-2">
          <button
            title="More"
            onClick={() => handleNavClick('more')}
            className={`w-full flex items-center justify-between px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative active:scale-[0.98] overflow-hidden ${
              isMoreActive 
                ? 'bg-ui-surface-hover text-text-main font-medium shadow-sm' 
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
            }`}
          >
            <div className="flex items-center gap-3 justify-center xl:justify-start w-full">
              {isMoreActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full shadow-[0_0_8px_#D4AF37]" />
              )}
              <div className={`shrink-0 transition-all duration-200 ${isMoreActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                <Menu size={20} strokeWidth={isMoreActive ? 2 : 1.5} />
              </div>
              <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
                More
              </span>
            </div>
            <div className={`hidden xl:block transition-transform duration-200 ${isMoreExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} />
            </div>
          </button>
          
          {/* Expanded More Items */}
          <AnimatePresence>
            {isMoreExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-1 pl-0 xl:pl-4 space-y-1"
              >
                {moreItems.map((item) => {
                  const isActive = currentRoute.id === item.id;
                  return (
                    <button
                      key={item.id}
                      title={item.label}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-2.5 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] ${
                        isActive 
                          ? 'text-primary font-bold bg-primary/5' 
                          : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover/50 font-medium'
                      }`}
                    >
                      <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`}>
                        <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                      </div>
                      <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
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
