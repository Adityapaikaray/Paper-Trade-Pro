/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, TrendingUp, Briefcase, Menu, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMenu: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenMenu }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'market', icon: BarChart3, label: 'Discover' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'orders', icon: TrendingUp, label: 'Orders' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-ui-surface/80 backdrop-blur-2xl border-t border-ui-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
            activeTab === item.id ? 'text-primary-dark' : 'text-text-muted hover:text-text-main'
          }`}
        >
          <div className="relative">
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
            {activeTab === item.id && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
        </button>
      ))}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center w-16 h-full gap-1 text-text-muted hover:text-text-main transition-colors"
      >
        <Menu size={22} strokeWidth={1.5} />
        <span className="text-[9px] font-bold tracking-wide">More</span>
      </button>
    </div>
  );
};

export default BottomNav;
