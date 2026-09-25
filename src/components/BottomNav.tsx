/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Briefcase, Menu, BarChart3, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';
import { useUserTier } from '../contexts/UserTierContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';

const BottomNav: React.FC = () => {
  const { activeTab, navigate, setMenuOpen } = useNavigation();
  const { isMax } = useUserTier();
  const { openModal } = useUI();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'market', icon: BarChart3, label: 'Discover' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'wealth', icon: Crown, label: 'Wealth' },
  ];

  return (
    <>
      {/* Floating Upgrade CTA for Free users on mobile */}
      {!isMax && (
        <div className="md:hidden fixed bottom-[72px] left-3 right-3 z-40 pointer-events-auto">
          <div 
            onClick={() => openModal('upgrade')}
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#172545] via-[#101C38] to-[#0A1224] border border-[#D4AF37]/50 shadow-[0_4px_20px_rgba(212,175,55,0.22)] text-white cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#E6CA65] shrink-0">
                <Crown size={12} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#F8FAFC] truncate block leading-tight">
                  Upgrade to Max
                </span>
                <span className="text-[10px] text-[#E6CA65] font-mono leading-tight block">
                  $0.99/mo | ₹49/mo
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openModal('upgrade');
              }}
              className="py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#E5BE4A] text-[#0A1124] text-[11px] font-bold shadow-xs shrink-0 flex items-center gap-1 hover:brightness-105"
            >
              <span>Upgrade</span>
              <ArrowRight size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-ui-surface/95 backdrop-blur-xl border-t border-ui-border z-40 flex items-center justify-around px-2 pb-safe shadow-lg">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id as RouteId)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-full py-1 gap-1 transition-all cursor-pointer ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-main'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={isActive ? 2.4 : 1.6} />
                {isActive && (
                  <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-xs" />
                )}
              </div>
              <span className={`text-[10px] font-semibold tracking-tight ${isActive ? 'text-primary font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] h-full py-1 gap-1 transition-all cursor-pointer ${
            activeTab === 'more' ? 'text-primary' : 'text-text-muted hover:text-text-main'
          }`}
          aria-label="More navigation options"
        >
          <div className="relative">
            <Menu size={20} strokeWidth={activeTab === 'more' ? 2.4 : 1.6} />
            {activeTab === 'more' && (
              <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-primary rounded-full shadow-xs" />
            )}
          </div>
          <span className={`text-[10px] font-semibold tracking-tight ${activeTab === 'more' ? 'text-primary font-bold' : ''}`}>
            More
          </span>
        </button>
      </nav>
    </>
  );
};

export default BottomNav;
