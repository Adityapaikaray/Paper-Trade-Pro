/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Briefcase, Menu, BarChart3, Crown } from 'lucide-react';
import { useNavigation, RouteId } from '../contexts/NavigationContext.tsx';

const BottomNav: React.FC = () => {
  const { activeTab, navigate, setMenuOpen } = useNavigation();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'market', icon: BarChart3, label: 'Discover' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'wealth', icon: Crown, label: 'Wealth' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-ui-surface/80 backdrop-blur-2xl border-t border-ui-border z-40 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.id as RouteId)}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
            activeTab === item.id ? 'text-primary' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <div className="relative">
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
            {activeTab === item.id && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#D4AF37]" />
            )}
          </div>
          <span className={`text-[9px] font-bold tracking-wide ${activeTab === item.id ? 'text-primary' : ''}`}>{item.label}</span>
        </button>
      ))}
      <button
        onClick={() => setMenuOpen(true)}
        className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
          activeTab === 'more' ? 'text-primary' : 'text-text-muted hover:text-text-main'
        }`}
      >
        <div className="relative">
          <Menu size={22} strokeWidth={activeTab === 'more' ? 2.5 : 1.5} />
          {activeTab === 'more' && (
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_#D4AF37]" />
          )}
        </div>
        <span className={`text-[9px] font-bold tracking-wide ${activeTab === 'more' ? 'text-primary' : ''}`}>More</span>
      </button>
    </div>
  );
};

export default BottomNav;
