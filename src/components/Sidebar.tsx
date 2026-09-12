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
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'market', icon: BarChart3, label: 'Markets' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'watchlist', icon: Eye, label: 'Watchlist' },
    { id: 'orders', icon: TrendingUp, label: 'Orders' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'research', icon: GraduationCap, label: 'Research' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
  ];
  
  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  return (
    <div className="hidden md:flex md:w-20 xl:w-[240px] border-r border-[#1B2A3D] h-screen flex-col bg-[#0B1624] z-20 transition-all duration-300 overflow-y-auto custom-scrollbar shrink-0 text-white relative">
      <div className="p-8 md:p-4 xl:p-8 pb-6 sticky top-0 bg-[#0B1624] z-10 flex justify-center xl:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex shrink-0 items-center justify-center bg-[#C9A23A] text-[#0B1624] shadow-sm">
            <ArrowUpRight size={20} strokeWidth={3} />
          </div>
          <div className="hidden xl:flex flex-col">
            <h1 className="text-xl font-serif font-black text-white leading-none uppercase tracking-wide">
              TRADEPRO
            </h1>
            <p className="text-[8px] font-sans font-bold text-[#E4C96B] mt-1 uppercase tracking-[0.1em]">
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
            className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] ${
              activeTab === item.id 
                ? 'bg-[#1A2635] text-[#C9A23A] font-semibold shadow-sm' 
                : 'text-[#8AA1B9] hover:text-white hover:bg-[#132235] font-medium'
            }`}
          >
            <div className={`shrink-0 transition-all duration-200 ${activeTab === item.id ? 'text-[#C9A23A]' : 'text-[#8AA1B9] group-hover:text-[#E4C96B]'}`}>
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
            </div>
            <span className="hidden xl:block text-sm z-10 transition-colors tracking-wide">
              {item.label}
            </span>
          </button>
        ))}
        
        <div className="pt-6 mt-4 border-t border-[#1B2A3D] space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              title={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 md:px-0 xl:px-4 py-3 rounded-xl transition-all duration-200 group relative justify-center xl:justify-start active:scale-[0.98] ${
                activeTab === item.id 
                  ? 'bg-[#1A2635] text-[#C9A23A] font-semibold shadow-sm' 
                  : 'text-[#8AA1B9] hover:text-white hover:bg-[#132235] font-medium'
              }`}
            >
              <div className={`shrink-0 transition-all duration-200 ${activeTab === item.id ? 'text-[#C9A23A]' : 'text-[#8AA1B9] group-hover:text-[#E4C96B]'}`}>
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
              </div>
              <span className="hidden xl:block text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 md:p-4 xl:p-6 mt-auto relative z-10">
        <div className="p-5 md:p-0 xl:p-5 rounded-2xl bg-gradient-to-br from-[#132235] to-[#0D1929] border border-[#1E2E42] flex flex-col items-center xl:items-start shadow-xl relative group cursor-pointer hover:border-[#C9A23A]/30 transition-all duration-300" onClick={() => openModal('upgrade')}>
          <div className="w-10 h-10 rounded-full bg-[#1A2635] border border-[#23354C] flex shrink-0 items-center justify-center text-[#C9A23A] mb-3 md:mb-0 xl:mb-4 group-hover:bg-[#C9A23A]/10 transition-colors" title="Upgrade to Pro">
            <Crown size={20} strokeWidth={2} />
          </div>
          <h4 className="hidden xl:block text-sm font-bold text-white mb-2 font-serif italic tracking-wide">Upgrade to Pro</h4>
          <p className="hidden xl:block text-[11px] text-[#8AA1B9] mb-4 leading-relaxed font-medium">
            Advanced analytics.<br />Real-time data.<br />Deeper insights.<br />Trade like an institution.
          </p>
          <div className="hidden xl:flex text-[11px] font-bold text-[#E4C96B] uppercase tracking-wider items-center gap-1 group-hover:gap-2 transition-all">
            Upgrade Now <ArrowRight size={12} strokeWidth={3} />
          </div>
        </div>
        
        <div className="hidden xl:block mt-6 w-full text-center">
           <p className="text-[10px] font-serif italic text-[#8AA1B9]">"Discipline today. Freedom tomorrow."</p>
           <p className="text-[9px] uppercase tracking-[0.2em] text-[#8AA1B9]/60 font-bold mt-2">Made with ❤️ in India</p>
        </div>
      </div>

      <div className="hidden xl:block absolute bottom-0 left-0 right-0 h-48 pointer-events-none opacity-20 bg-cover bg-bottom" style={{ backgroundImage: 'radial-gradient(circle at bottom, #C9A23A 0%, transparent 70%)' }}></div>
    </div>
  );
};

export default Sidebar;
