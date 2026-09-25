/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Crown, Sun, Moon, ChevronLeft, ChevronRight, Sparkles, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../contexts/UIContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { primaryNavigation } from '../config/navigation.ts';
import TradeProLogo from './TradeProLogo.tsx';

const Sidebar: React.FC = () => {
  const { openModal } = useUI();
  const { theme, toggleTheme } = useTheme();
  const { navigate, currentRoute } = useNavigation();
  const { isMax, tier, toggleTier } = useUserTier();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside 
      className={`hidden md:flex flex-col h-screen bg-[#0B1528] bg-gradient-to-b from-[#0B1528] via-[#091122] to-[#060C18] border-r border-[#1E293B]/80 z-20 transition-all duration-300 ease-in-out shrink-0 text-white relative shadow-[4px_0_24px_rgba(0,0,0,0.25)] select-none ${
        isExpanded ? 'w-[280px]' : 'w-[84px]'
      }`}
      style={{
        ['--brand-wordmark' as any]: '#F8FAFC',
        ['--brand-tagline' as any]: '#94A3B8',
        ['--brand-dot' as any]: '#D4AF37',
      }}
      aria-label="Institutional Sidebar Navigation"
    >
      {/* 1. Integrated TradePro Brand Header */}
      <div 
        className={`pt-5 pb-5 sticky top-0 bg-[#0B1528]/95 backdrop-blur-md z-10 border-b border-[#1E293B]/90 flex items-center transition-all duration-300 ${
          isExpanded ? 'px-5 justify-between' : 'justify-center px-2'
        }`}
      >
        <button 
          onClick={() => {
            if (!isExpanded) setIsExpanded(true);
            navigate('dashboard');
          }} 
          className="flex items-center text-left transition-transform active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg group"
          aria-label="TradePro Home"
          title={isExpanded ? 'TradePro Institutional' : 'Expand sidebar'}
        >
          <TradeProLogo isCollapsed={!isExpanded} />
        </button>

        {isExpanded ? (
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E6CA65] hover:bg-[#13223D] transition-all duration-200 active:scale-90"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={18} strokeWidth={2.4} />
          </button>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="hidden group-hover:flex absolute right-1 p-1 rounded-md text-[#94A3B8] hover:text-[#E6CA65] bg-[#0B1528] shadow-md transition-all"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        )}
      </div>
      
      {/* 2. Institutional Navigation Links (Exact 11 items requested) */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 py-3 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {primaryNavigation.map((item) => {
          const isActive = currentRoute.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              title={isExpanded ? undefined : item.label}
              className={`w-full flex items-center ${isExpanded ? 'px-3.5 justify-start' : 'justify-center'} py-2.5 rounded-xl transition-all duration-200 ease-out group relative active:scale-[0.985] ${
                isActive 
                  ? 'bg-gradient-to-r from-[#D4AF37]/22 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#F5E6BE] shadow-[0_0_16px_rgba(212,175,55,0.14)]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13223D]/80 border border-transparent hover:border-[#1E293B]'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#D4AF37] rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              
              <div 
                className={`shrink-0 transition-all duration-200 ${
                  isActive 
                    ? 'text-[#E6CA65] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                    : item.isMax
                    ? 'text-[#D4AF37]/80 group-hover:text-[#E6CA65] group-hover:scale-105'
                    : 'text-[#64748B] group-hover:text-[#CBD5E1] group-hover:scale-105'
                } ${isExpanded ? 'mr-3' : ''}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
              </div>

              {isExpanded && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className={`text-[15px] leading-tight z-10 transition-colors tracking-tight truncate ${
                    isActive ? 'font-bold text-[#F5E6BE]' : 'font-semibold'
                  }`}>
                    {item.label}
                  </span>

                  {/* Distinction between Free and Max features */}
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#E6CA65] border border-[#D4AF37]/40 ml-1.5 shrink-0 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Free vs Max Tier Switcher & Upgrade Banner */}
      <div className={`p-3 relative z-10 border-t border-[#1E293B]/80 ${isExpanded ? 'space-y-2.5' : 'space-y-2'}`}>
        {/* Tier Mode Switcher Pill */}
        {isExpanded ? (
          <div className="flex items-center justify-between p-1 rounded-xl bg-[#081020] border border-[#1E293B] text-xs">
            <button
              onClick={() => toggleTier()}
              className={`flex-1 py-1 px-2 rounded-lg text-center font-bold text-[11px] transition-all ${
                !isMax
                  ? 'bg-ui-surface text-text-main shadow-xs'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Free Plan
            </button>
            <button
              onClick={() => toggleTier()}
              className={`flex-1 py-1 px-2 rounded-lg text-center font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                isMax
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5BE4A] text-[#0A1124] shadow-xs'
                  : 'text-[#D4AF37]/80 hover:text-[#D4AF37]'
              }`}
            >
              <Crown size={11} strokeWidth={2.4} />
              <span>Max</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => toggleTier()}
            title={isMax ? 'Current: Max Plan (Click to toggle)' : 'Current: Free Plan (Click to toggle)'}
            className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center transition-all ${
              isMax
                ? 'bg-[#D4AF37]/20 text-[#E6CA65] border border-[#D4AF37]/50 shadow-xs'
                : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155]'
            }`}
          >
            <Crown size={16} strokeWidth={2.2} />
          </button>
        )}

        {/* Upgrade Card if in Free mode */}
        {!isMax && isExpanded && (
          <div 
            onClick={() => openModal('upgrade')}
            className="p-3 rounded-xl bg-gradient-to-br from-[#122240] via-[#0D1830] to-[#091122] border border-[#D4AF37]/40 shadow-sm cursor-pointer hover:border-[#D4AF37]/70 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Crown size={13} className="text-[#E6CA65]" />
                <span className="text-xs font-bold text-[#F8FAFC]">TradePro Max</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#E6CA65]">$0.99/mo</span>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-tight mb-2.5">
              Unlock Level 2 order book, AI analytics &amp; futures.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('upgrade');
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5BE4A] hover:brightness-105 text-[#0A1124] font-bold text-xs flex items-center justify-center gap-1"
            >
              <span>Upgrade Now</span>
              <ArrowRight size={11} strokeWidth={2.4} />
            </button>
          </div>
        )}

        {/* 4. User Profile at Bottom */}
        <div className="pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E293B] to-[#334155] border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#F8FAFC] shrink-0">
              AP
            </div>
            {isExpanded && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#F8FAFC] truncate">Aditya Paikaray</span>
                <span className="text-[10px] font-mono text-[#D4AF37] flex items-center gap-1">
                  {isMax ? '⭐ Max Active' : 'Free Account'}
                </span>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E6CA65] hover:bg-[#13223D] transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
