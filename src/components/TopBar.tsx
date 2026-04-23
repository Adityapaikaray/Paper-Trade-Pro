/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Bell, User, Wallet } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface TopBarProps {
  onSearchFocus: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onSearchFocus }) => {
  const { profile } = usePortfolio();

  return (
    <header className="h-20 bg-white border-b border-indigo-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search markets, assets..." 
            onFocus={onSearchFocus}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm text-slate-600 font-bold placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-4 px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-[0_2px_10px_rgba(79,70,229,0.05)]">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Wallet size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Buying Power</span>
            <span className="text-xl font-mono font-black text-indigo-700 tracking-tight leading-none">
              ${profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white border border-slate-100 flex items-center justify-center transition-all relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-white shadow-sm"></span>
          </button>
          <div className="w-12 h-12 rounded-full bg-amber-400 border-4 border-white shadow-lg flex items-center justify-center text-amber-900 font-black uppercase text-sm cursor-pointer hover:scale-110 transition-transform">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
