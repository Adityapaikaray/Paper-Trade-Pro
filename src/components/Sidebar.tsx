import React, { useState } from 'react';
import { Crown, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../contexts/UIContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { primaryNavigation, secondaryNavigation } from '../config/navigation.ts';
import TradeProLogo from './TradeProLogo.tsx';

const Sidebar: React.FC = () => {
  const { openModal } = useUI();
  const { theme, toggleTheme } = useTheme();
  const { navigate, currentRoute } = useNavigation();
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
      
      {/* 2. Institutional Navigation Links (17-18px, font-weight 600-700) */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1.5 py-4 ${isExpanded ? 'px-3.5' : 'px-2'}`}>
        {primaryNavigation.map((item) => {
          const isActive = currentRoute.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              title={isExpanded ? undefined : item.label}
              className={`w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'justify-center'} py-3 rounded-xl transition-all duration-250 ease-out group relative active:scale-[0.985] ${
                isActive 
                  ? 'bg-gradient-to-r from-[#D4AF37]/22 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#F5E6BE] shadow-[0_0_16px_rgba(212,175,55,0.14)]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13223D]/80 border border-transparent hover:border-[#1E293B]'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#D4AF37] rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              
              <div 
                className={`shrink-0 transition-all duration-200 ${
                  isActive 
                    ? 'text-[#E6CA65] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                    : 'text-[#64748B] group-hover:text-[#E6CA65] group-hover:scale-105'
                } ${isExpanded ? 'mr-3.5' : ''}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.9} />
              </div>

              {isExpanded && (
                <span className={`text-[17.5px] leading-tight z-10 transition-colors tracking-tight truncate ${
                  isActive ? 'font-bold text-[#F5E6BE]' : 'font-semibold'
                }`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Section Divider: Institutional Suite */}
        <div className="pt-4 pb-1">
          {isExpanded ? (
            <div className="px-4 flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#D4AF37]/90 uppercase tracking-[0.18em]">
                Institutional Suite
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70 shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
            </div>
          ) : (
            <div className="mx-auto w-8 h-[1px] bg-[#1E293B] mb-2" />
          )}
        </div>

        {secondaryNavigation.map((item) => {
          const isActive = currentRoute.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              title={isExpanded ? undefined : item.label}
              className={`w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'justify-center'} py-2.5 rounded-xl transition-all duration-250 ease-out group relative active:scale-[0.985] ${
                isActive 
                  ? 'bg-gradient-to-r from-[#D4AF37]/22 via-[#D4AF37]/10 to-transparent border border-[#D4AF37]/40 text-[#F5E6BE] shadow-[0_0_16px_rgba(212,175,55,0.14)]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13223D]/80 border border-transparent hover:border-[#1E293B]'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavIndicatorSecondary"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#D4AF37] rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <div 
                className={`shrink-0 transition-all duration-200 ${
                  isActive 
                    ? 'text-[#E6CA65] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' 
                    : 'text-[#64748B] group-hover:text-[#E6CA65] group-hover:scale-105'
                } ${isExpanded ? 'mr-3.5' : ''}`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.9} />
              </div>

              {isExpanded && (
                <span className={`text-[17px] leading-tight z-10 transition-colors tracking-tight truncate ${
                  isActive ? 'font-bold text-[#F5E6BE]' : 'font-semibold'
                }`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Theme Mode Toggle Button with Cross-Fade */}
      <div className={`px-3.5 py-2 ${isExpanded ? 'px-3.5' : 'px-2'}`}>
        <button
          onClick={toggleTheme}
          title={isExpanded ? undefined : (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode')}
          className={`w-full flex items-center ${isExpanded ? 'px-3.5 justify-between' : 'justify-center'} py-2.5 rounded-xl transition-all duration-300 shadow-sm group overflow-hidden relative active:scale-[0.98]`}
          aria-label="Toggle theme mode"
        >
          {/* Subtle cross-fading container background */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl border"
            initial={false}
            animate={{
              backgroundColor: theme === 'dark' ? '#0F1C33' : '#13233E',
              borderColor: theme === 'dark' ? '#1E293B' : 'rgba(212, 175, 55, 0.35)',
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />

          <div className="flex items-center gap-2.5 relative z-10">
            <motion.div 
              className="w-7 h-7 rounded-lg border flex items-center justify-center text-[#E6CA65] shrink-0 overflow-hidden relative"
              animate={{
                backgroundColor: theme === 'dark' ? '#0B1528' : '#0E1A2F',
                borderColor: theme === 'dark' ? '#1E293B' : 'rgba(212, 175, 55, 0.35)'
              }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2.2} />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            {isExpanded && (
              <span className="text-[13px] font-semibold tracking-wide text-[#CBD5E1]">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </div>
          {isExpanded && (
            <motion.span 
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase relative z-10"
              animate={{
                backgroundColor: theme === 'dark' ? '#0B1528' : '#0E1A2F',
                color: theme === 'dark' ? '#E6CA65' : '#F3E5AB',
                borderColor: theme === 'dark' ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.5)'
              }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {theme}
            </motion.span>
          )}
        </button>
      </div>

      {/* 4. Institutional Tier / Upgrade Card */}
      <div className="p-3.5 relative z-10">
        <div 
          className={`${isExpanded ? 'p-4' : 'p-2'} rounded-2xl bg-gradient-to-br from-[#0F1E38] via-[#0C172C] to-[#081020] border border-[#D4AF37]/35 shadow-[0_4px_20px_rgba(0,0,0,0.35)] flex flex-col relative group cursor-pointer hover:border-[#D4AF37]/70 transition-all duration-300`} 
          onClick={() => openModal('upgrade')} 
          title="Institutional Pro Suite"
        >
          {isExpanded ? (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65] shrink-0 shadow-[0_0_8px_rgba(212,175,55,0.25)]">
                    <Crown size={15} strokeWidth={2.2} />
                  </div>
                  <h4 className="text-[13px] font-bold text-[#F8FAFC] font-serif tracking-wide">TradePro Pro</h4>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-[#E6CA65] border border-[#D4AF37]/35 uppercase tracking-wider">
                  Tier 1
                </span>
              </div>
              <ul className="text-[11px] text-[#94A3B8] space-y-1.5 mb-3.5 pl-0.5 leading-snug">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
                  <span>Real-time L2 order book</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
                  <span>Institutional risk engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
                  <span>Wealth & tax compounding</span>
                </li>
              </ul>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('upgrade');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5BE4A] to-[#D4AF37] hover:brightness-110 text-[#091120] font-bold text-xs transition-all shadow-[0_2px_12px_rgba(212,175,55,0.35)] flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Upgrade to Pro</span>
                <span>&rarr;</span>
              </button>
            </>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65] group-hover:scale-108 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all">
              <Crown size={18} strokeWidth={2.2} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

