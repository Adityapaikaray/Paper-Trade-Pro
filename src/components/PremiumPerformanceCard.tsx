import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Clock, Activity, Briefcase, Star, FileText, BarChart2, PieChart, History as HistoryIcon } from 'lucide-react';
import PortfolioGraph from './PortfolioGraph.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface PremiumPerformanceCardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'Active Positions', label: 'Active Positions (2)', icon: Briefcase },
  { id: 'Watchlist', label: 'Watchlist', icon: Star },
  { id: 'Orders', label: 'Orders', icon: FileText },
  { id: 'Performance', label: 'Performance', icon: BarChart2 },
  { id: 'Allocation', label: 'Allocation', icon: PieChart },
  { id: 'History', label: 'History', icon: HistoryIcon },
];

const PremiumPerformanceCard: React.FC<PremiumPerformanceCardProps> = ({ activeTab, setActiveTab }) => {
  const { profile } = usePortfolio();
  const [activeFilter, setActiveFilter] = useState('1M');
  const FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-ui-surface rounded-[28px] border border-ui-border shadow-2xl overflow-hidden flex flex-col w-full relative group"
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-8 lg:p-10 flex flex-col gap-8">
        
        {/* 1. Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mb-3">Your Wealth Journey</p>
            <h2 className="text-[32px] md:text-[40px] font-serif font-black text-text-main leading-none mb-2 tracking-tight">Portfolio Performance</h2>
            <p className="text-text-muted text-[15px] font-medium">Track the growth of your investments over time</p>
          </div>
          
          <div className="flex bg-ui-bg p-1 rounded-full border border-ui-border shadow-[0_5px_15px_rgba(0,0,0,0.5)] shrink-0 self-start">
            {FILTERS.map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                  activeFilter === f 
                  ? 'bg-primary text-[#000000] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                  : 'text-text-muted hover:text-text-main'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-ui-surface-hover rounded-2xl p-5 border border-ui-border flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-positive" />
            <div className="w-10 h-10 rounded-full bg-ui-surface flex items-center justify-center shrink-0 border border-ui-border shadow-[0_0_10px_rgba(0,208,132,0.1)]">
              <ArrowUpRight size={20} className="text-positive" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-positive uppercase tracking-wider mb-0.5">Portfolio Return</p>
              <p className="text-2xl font-mono font-bold text-text-main leading-none">+35.41%</p>
            </div>
          </div>
          
          <div className="bg-ui-surface-hover rounded-2xl p-5 border border-ui-border flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-positive" />
            <div className="w-10 h-10 rounded-full bg-ui-surface flex items-center justify-center shrink-0 border border-ui-border shadow-[0_0_10px_rgba(0,208,132,0.1)]">
              <Activity size={20} className="text-positive" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-positive uppercase tracking-wider mb-0.5">Total Gain</p>
              <p className="text-2xl font-mono font-bold text-text-main leading-none">+₹4,128.26</p>
            </div>
          </div>

          <div className="bg-ui-surface-hover rounded-2xl p-5 border border-ui-border flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="w-10 h-10 rounded-full bg-ui-surface flex items-center justify-center shrink-0 border border-ui-border shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">Live Portfolio Value</p>
              <p className="text-2xl font-mono font-bold text-text-main leading-none">₹12,500.00</p>
              <p className="text-[9px] text-primary mt-1 font-medium flex items-center gap-1"><Clock size={10} /> Updated just now</p>
            </div>
          </div>
        </div>

        {/* 3. Main Chart */}
        <div className="h-[380px] w-full -mx-2 relative z-0">
          <PortfolioGraph 
             history={profile.history || []} 
             currentValue={12500} 
             baseline={10000} 
             currencySymbol="₹" 
             currencyRate={83} 
             premiumMode={true}
          />
        </div>

        {/* 4. Portfolio Statistics */}
        <div className="bg-ui-bg rounded-2xl border border-ui-border shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-ui-border overflow-hidden">
          {[
            { label: 'Starting Value', val: '₹8,371.74' },
            { label: 'Current Value', val: '₹12,500.00' },
            { label: 'Highest Value', val: '₹12,634.21' },
            { label: 'Lowest Value', val: '₹7,982.11' }
          ].map((stat, i) => (
            <div key={i} className="flex-1 p-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-ui-surface flex items-center justify-center border border-ui-border">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8C8C8C]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-lg font-mono font-bold text-text-main leading-none">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Navigation */}
      <div className="bg-ui-sidebar border-t border-ui-border px-4 md:px-8 flex overflow-x-auto no-scrollbar relative z-10">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-5 px-2 flex flex-col items-center justify-center gap-2 relative transition-all group ${
                isActive ? 'text-primary bg-ui-surface-hover' : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
              }`}
            >
              <Icon size={18} className={`transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'}`} />
              <span className="text-[11px] font-bold tracking-wide">{tab.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator" 
                  className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(212,175,55,0.8)]" 
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  );
};

export default PremiumPerformanceCard;
