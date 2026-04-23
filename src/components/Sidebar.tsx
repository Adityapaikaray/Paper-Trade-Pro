/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, TrendingUp, Briefcase, History, Search, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'market', icon: TrendingUp, label: 'Market' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div className="w-64 border-r border-ui-border h-screen flex flex-col bg-ui-surface shadow-[4px_0_24px_rgba(79,70,229,0.05)] z-20">
      <div className="p-6 border-b border-ui-border bg-white/50 backdrop-blur-md">
        <h1 className="text-2xl font-black tracking-tighter text-indigo-900 italic flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <TrendingUp size={24} className="text-white" />
          </div>
          TRADEPRO
        </h1>
      </div>
      
      <nav className="flex-1 p-5 space-y-3 bg-slate-50/30">
        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2 mb-4">Master View</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                : 'text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 3 : 2} />
            <span className="font-black tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-5 border-t border-ui-border bg-white/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all font-bold group">
          <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
