/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, ChevronDown, List, Grid, MoreVertical, TrendingUp, TrendingDown, Bot, ArrowRight, Play, CheckCircle2, ChevronRight, Activity, Zap, ShieldAlert, PieChart, BarChart3, Newspaper, LineChart, Info, Briefcase } from 'lucide-react';
import { Stock } from '../types.ts';
import PremiumPerformanceCard from './PremiumPerformanceCard.tsx';
import { PositionCard } from './PositionCard.tsx';
import { PositionDetailsModal } from './PositionDetailsModal.tsx';
import { ModifyAllocationModal } from './ModifyAllocationModal.tsx';
import { QuickTradePanel } from './QuickTradePanel.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useMarketData } from '../contexts/MarketContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardViewProps {
  onTrade?: (stock: Stock) => void;
  onNavigate?: (tab: string) => void;
}

const TABS = ['Active Positions', 'Watchlist', 'Orders', 'Performance', 'Allocation', 'History'];
const FILTERS = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const DashboardView: React.FC<DashboardViewProps> = ({ onTrade, onNavigate }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [activeFilter, setActiveFilter] = useState('1M');
  const [viewMode, setViewMode] = useState<'grid'|'list'>('list');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState('Value (High → Low)');
  const [moversType, setMoversType] = useState<'gainers'|'losers'>('gainers');
  const [detailsSymbol, setDetailsSymbol] = useState<string | null>(null);
  const [modifySymbol, setModifySymbol] = useState<string | null>(null);
  
  const { profile, marketContext, addFunds, modifyHoldingAllocation, summary } = usePortfolio();
  const { theme } = useTheme();
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const { stocks } = useMarketData();
  
  const { stocksMap } = useMemo(() => {
    const map = new Map<string, Stock>();
    stocks.forEach(s => map.set(s.symbol.toUpperCase(), s));
    return { stocksMap: map };
  }, [stocks]);

  const holdingsWithData = useMemo(() => {
    return (profile?.holdings || [])
      .map(holding => {
        const stock = stocksMap.get(holding.symbol.toUpperCase());
        return { holding, stock };
      })
      .filter((h): h is { holding: typeof h.holding; stock: Stock } => !!h.stock && h.stock.currency === currencySymbol)
      .map(h => {
        const currentPrice = h.stock.price;
        const avgCost = h.holding.averagePrice;
        const quantity = h.holding.shares;
        const marketValue = currentPrice * quantity;
        const costValue = avgCost * quantity;
        const unrealizedPL = marketValue - costValue;
        const unrealizedPLPct = avgCost > 0 ? (currentPrice / avgCost - 1) * 100 : 0;
        const todayChange = h.stock.change * quantity;
        const todayChangePct = h.stock.changePercent;
        const allocation = summary.currentValue > 0 ? (marketValue / summary.currentValue) * 100 : 0;
        
        return {
          ...h.holding,
          stock: h.stock,
          currentPrice,
          marketValue,
          unrealizedPL,
          unrealizedPLPct,
          todayChange,
          todayChangePct,
          allocation
        };
      });
  }, [profile?.holdings, stocksMap, currencySymbol, summary.currentValue]);

  // Day return strictly based on invested portfolio assets (zero when empty)
  const todayReturn = summary.currentValue > 0 ? (summary.currentValue * (isIndia ? 0.005 : 0.012)) : 0;
  const todayReturnPct = summary.currentValue > 0 ? (todayReturn / summary.currentValue) * 100 : 0;

  const { openModal, addToast, setIsCopilotOpen, openCopilotWithPrompt } = useUI();

  const contextCountry = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'USA' : 'All');
  
  const topMovers = useMemo(() => {
    return stocks
      .filter(s => contextCountry === 'All' || s.country === contextCountry)
      .sort((a, b) => moversType === 'gainers' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)
      .slice(0, 5)
      .map(s => ({ s: s.symbol, v: (s.changePercent >= 0 ? '+' : '') + s.changePercent.toFixed(2) + '%' }));
  }, [stocks, contextCountry, moversType]);


  return (
    <div className="pb-16 max-w-[1600px] mx-auto w-full">
      
      {/* Hero */}
      <div className="bg-ui-bg rounded-[20px] p-6 md:p-8 mb-6 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-ui-border">
        
        {/* Subtle cinematic dark background simulation via CSS gradients */}
        <div className="absolute inset-0 opacity-80 pointer-events-none" style={{ background: theme === 'dark' ? 'radial-gradient(ellipse at center bottom, #111111 0%, #000000 100%), linear-gradient(180deg, transparent 0%, #000000 100%)' : 'radial-gradient(ellipse at center bottom, #FCFBF8 0%, #F5F2EA 100%), linear-gradient(180deg, transparent 0%, #F5F2EA 100%)' }} />
        
        {/* Mountain silhouette */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 100 L20 70 L40 85 L70 30 L100 100 Z\' fill=\'none\' stroke=\'%23D4AF37\' stroke-width=\'1\' stroke-opacity=\'1\' /%3E%3C/svg%3E")', backgroundSize: 'cover', backgroundPosition: 'bottom' }} />
        
        {/* Very subtle warm-gold highlight along bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-sans font-medium text-text-main tracking-tight leading-[1.1] mb-1.5">
            Good Morning, <br />
            <span className="font-serif italic text-primary font-black">Investor!</span>
          </h1>
          <p className="text-text-muted text-xs md:text-sm font-medium mt-2">Here's what's happening with your portfolio today.</p>
        </div>
        
        <div className="relative z-10 flex flex-col md:items-end gap-4 md:text-right">
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-sm md:text-base font-serif text-text-main font-medium italic">"Discipline today, compounds a brighter tomorrow."</p>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1.5">— Warren Buffett</p>
            <div className="w-8 h-[1px] bg-primary opacity-50 mt-3 md:ml-auto" />
          </div>
          
          <div className="flex items-end justify-between md:justify-end gap-4 w-full mt-2 md:mt-0">
            <div className="bg-ui-surface border border-ui-border rounded-xl p-2.5 flex items-center gap-2 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">SUN, 13 SEPT 2026</span>
                <span className="text-[10px] text-text-main font-medium mt-0.5">Small steps. Bigger tomorrows. <ArrowRight size={10} className="inline text-primary" /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        
        {/* Total Portfolio Value */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
              <Briefcase size={12} className="text-primary" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Portfolio Value</p>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-1.5">
            {currencySymbol}{summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[10px] font-mono font-bold flex items-center gap-1 ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
            {summary.totalGain >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {summary.totalGain >= 0 ? '+' : ''}{currencySymbol}{summary.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({summary.returnPct >= 0 ? '+' : ''}{summary.returnPct.toFixed(2)}%)
          </p>
        </motion.div>

        {/* Invested Capital */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
              <Activity size={12} className="text-primary" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Invested</p>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-1.5">
            {currencySymbol}{summary.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-sans font-medium text-text-muted truncate">
            Across {holdingsWithData.length} asset{holdingsWithData.length === 1 ? '' : 's'}
          </p>
        </motion.div>

        {/* Total P&L */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${summary.totalGain >= 0 ? 'via-positive/20' : 'via-negative/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${summary.totalGain >= 0 ? 'bg-positive/10 border-positive/30' : 'bg-negative/10 border-negative/30'}`}>
              {summary.totalGain >= 0 ? <TrendingUp size={12} className="text-positive" /> : <TrendingDown size={12} className="text-negative" />}
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Total P&L</p>
          </div>
          <p className={`text-xl xl:text-2xl font-mono font-bold leading-none mb-1.5 ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
            {summary.totalGain >= 0 ? '+' : ''}{currencySymbol}{summary.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[10px] font-mono font-bold flex items-center gap-1 ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
            <span className={`px-1.5 py-0.5 rounded-full ${summary.totalGain >= 0 ? 'bg-positive/10 border border-positive/20' : 'bg-negative/10 border border-negative/20'}`}>
              {summary.returnPct >= 0 ? '+' : ''}{summary.returnPct.toFixed(2)}% ret
            </span>
          </p>
        </motion.div>

        {/* Available Cash */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-ui-surface rounded-2xl p-4 border border-ui-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
                <span className="text-text-muted font-bold text-[10px]">{currencySymbol}</span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Available Cash</p>
            </div>
            <button onClick={() => addFunds(isIndia ? 1000000 : 10000, currencySymbol)} className="text-primary hover:bg-ui-surface-hover p-1 rounded transition-colors border border-transparent hover:border-primary/30" title="Add virtual funds">
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-1.5">
            {currencySymbol}{summary.availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-sans font-medium text-text-muted truncate">
            Purchasing power available
          </p>
        </motion.div>
      </div>
      {/* Portfolio Performance & Navigation */}
      <PremiumPerformanceCard activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Positions Content - FULL MAIN CONTENT WIDTH */}
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold font-sans text-text-main tracking-tight">Active Positions</h3>
            <p className="text-xs text-text-muted mt-0.5">Real-time equities and portfolio allocation ({holdingsWithData.length})</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openModal('add-position')}
              className="px-3 py-1.5 rounded-xl bg-primary text-ui-bg text-xs font-bold hover:bg-primary-light transition-all flex items-center gap-1.5 mr-2"
            >
              <Plus size={14} strokeWidth={2.5} /> Add Position
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#1A1F29] text-text-main border border-ui-border shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#1A1F29] text-text-main border border-ui-border shadow-sm' : 'text-text-muted hover:text-text-main'}`}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {holdingsWithData.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-ui-border bg-ui-surface/40 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-ui-bg text-text-muted flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-main mb-1">
                {profile?.holdings?.length === 0 ? 'No holdings yet' : `No active positions in ${isIndia ? 'Indian (₹)' : 'US ($)'} market`}
              </p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {profile?.holdings?.length === 0
                  ? 'Your portfolio is currently empty. Start your first paper trade to build your portfolio.'
                  : 'Place a paper trade using the quick trade panel, search bar, or tap below to add your first position.'}
              </p>
            </div>
            <button 
              onClick={() => (onNavigate ? onNavigate('market') : openModal('add-position'))}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm"
            >
              Explore Markets
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-5 w-full' : 'space-y-5 w-full'}>
            {holdingsWithData.map((pos, index) => (
              <PositionCard
                key={`${pos.symbol}-${index}`}
                symbol={pos.symbol}
                name={pos.stock.name}
                tags={[pos.stock.sector || 'EQUITY', pos.stock.country || 'MARKET']}
                currentPrice={pos.currentPrice}
                currencySymbol={pos.stock.currency || currencySymbol}
                change={pos.stock.change}
                changePercent={pos.stock.changePercent}
                quantity={pos.shares}
                avgBuyPrice={pos.averagePrice}
                costOfPurchase={pos.averagePrice * pos.shares}
                currentValue={pos.marketValue}
                pnl={pos.unrealizedPL}
                pnlPercent={pos.unrealizedPLPct}
                allocation={pos.allocation}
                pieColor={pos.unrealizedPL >= 0 ? '#00D084' : '#FF4D4D'}
                onViewDetails={() => setDetailsSymbol(pos.symbol)}
                onModifyAllocation={() => setModifySymbol(pos.symbol)}
                onOptions={() => onTrade && onTrade(pos.stock)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Holdings Section */}
      <div className="grid grid-cols-1 gap-4 mt-6 mb-2">
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 lg:p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-text-main leading-tight tracking-tight">Top Holdings</h3>
                <p className="text-[11px] text-text-muted mt-1 font-medium">Your largest positions by value</p>
              </div>
              <button 
                onClick={() => addToast('Viewing full portfolio', 'info')}
                className="text-xs font-bold text-primary hover:text-text-main transition-colors flex items-center gap-1"
              >
                See All <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
              <table className="w-full min-w-[500px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-ui-border">
                    <th className="py-2 text-[10px] uppercase tracking-wider text-text-muted font-bold">Asset</th>
                    <th className="py-2 text-[10px] uppercase tracking-wider text-text-muted font-bold text-right">Price</th>
                    <th className="py-2 text-[10px] uppercase tracking-wider text-text-muted font-bold text-right">Change</th>
                    <th className="py-2 text-[10px] uppercase tracking-wider text-text-muted font-bold text-right">Shares</th>
                    <th className="py-2 text-[10px] uppercase tracking-wider text-text-muted font-bold text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border/50">
                  {holdingsWithData.slice(0, 5).map((holding, index) => {
                    const isPositive = holding.todayChange >= 0;
                    return (
                      <tr 
                        key={`${holding.symbol}-${index}`} 
                        className="group hover:bg-ui-surface-hover/50 transition-colors cursor-pointer"
                        onClick={() => setDetailsSymbol(holding.symbol)}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-ui-surface-hover border border-ui-border flex items-center justify-center font-bold text-[10px] text-text-main group-hover:text-primary transition-colors">
                              {holding.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-text-main">{holding.symbol}</div>
                              <div className="text-[10px] text-text-muted truncate max-w-[120px]">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="font-bold text-sm text-text-main">{currencySymbol}{holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                        <td className="py-3 text-right">
                          <div className={`text-xs font-bold flex items-center justify-end ${isPositive ? 'text-positive' : 'text-negative'}`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(holding.todayChangePct).toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="font-bold text-sm text-text-main">{holding.shares.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        </td>
                        <td className="py-3 text-right">
                          <div className="font-bold text-sm text-text-main">{currencySymbol}{holding.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                      </tr>
                    );
                  })}
                  {holdingsWithData.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-text-muted">
                        No holdings yet. Start trading to build your portfolio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Intelligence and Sentiment Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* AI Portfolio Copilot Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }} className="bg-ui-surface rounded-2xl p-5 lg:p-6 border border-ui-border shadow-sm relative overflow-hidden group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#C9A227]/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-ui-surface-hover border border-ui-border flex items-center justify-center shadow-sm shrink-0">
                <Bot size={24} className="text-[#C9A227]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif font-bold text-text-main leading-tight tracking-tight">AI Copilot</h3>
                  <span className="text-[8px] font-bold uppercase tracking-widest bg-ui-surface-hover border border-[#C9A227] text-[#C9A227] px-1.5 py-0.5 rounded-sm">Beta</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">Intelligent insights and automated trades.</p>
              </div>
          </div>
          <button 
              onClick={() => setIsCopilotOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-[#C9A227] to-[#A6822B] text-white font-bold rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 mb-4 relative z-10 text-xs"
          >
            Launch AI Terminal <ArrowRight size={14} strokeWidth={2} />
          </button>
          <div className="space-y-2 relative z-10">
            <button 
              onClick={() => openCopilotWithPrompt(isIndia ? "Buy 10 shares of Reliance (RELIANCE)" : "Buy 10 shares of Apple (AAPL)")} 
              className="w-full text-left p-2.5 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-medium text-text-main hover:border-[#C9A227]/50 transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isIndia ? '"Buy 10 shares of Reliance"' : '"Buy 10 shares of Apple"'}
              </span>
              <ArrowRight size={12} className="text-text-muted group-hover:text-[#C9A227] transition-colors" />
            </button>
            <button 
              onClick={() => openCopilotWithPrompt(isIndia ? "Buy 5 shares of TCS" : "Buy 5 shares of NVIDIA (NVDA)")} 
              className="w-full text-left p-2.5 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-medium text-text-main hover:border-[#C9A227]/50 transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isIndia ? '"Buy 5 shares of TCS"' : '"Buy 5 shares of NVIDIA"'}
              </span>
              <ArrowRight size={12} className="text-text-muted group-hover:text-[#C9A227] transition-colors" />
            </button>
          </div>
        </motion.div>

        {/* Quick Trade Panel */}
        <QuickTradePanel />
      </div>

      {/* Market Sentiment and Ticker Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          
          {/* Market Sentiment */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' }} className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 lg:p-6 pb-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-text-main leading-tight tracking-tight">Market Sentiment</h3>
                  <p className="text-xs text-text-muted mt-1 font-medium">Based on broad indices and volume</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center border border-ui-border text-text-muted hover:text-primary hover:border-primary transition-colors shadow-sm">
                  <Info size={14} strokeWidth={2} />
                </button>
              </div>
              
              <div className="flex flex-col items-center justify-center relative flex-1">
                {/* SVG Gauge */}
                <div className="relative w-full flex justify-center mb-0 scale-[0.8] origin-bottom">
                  <svg width="300" height="150" viewBox="0 0 300 150" className="overflow-visible">
                    <defs>
                      <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="12" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="needle-shadow-dark" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity={theme === 'dark' ? "0.8" : "0.2"} floodColor={theme === 'dark' ? "#000000" : "#0B1728"} />
                      </filter>
                    </defs>

                    {/* Labels */}
                    <text x="30" y="125" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Bearish</text>
                    <text x="150" y="10" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Neutral</text>
                    <text x="270" y="125" fill="var(--text-muted)" fontSize="13.5" fontWeight="500" textAnchor="middle">Bullish</text>

                    {/* Gauge Segments */}
                    <g transform="rotate(180 150 135)">
                      {/* Bearish */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-negative)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="0" />
                      {/* Neutral */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-primary)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="-114.72" />
                      {/* Bullish */}
                      <circle cx="150" cy="135" r="100" fill="none" stroke="var(--color-positive)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84.72 628.32" strokeDashoffset="-229.44" style={{ filter: theme === 'dark' ? 'drop-shadow(0 0 14px rgba(0,208,132,0.4))' : 'none' }} />
                    </g>

                    {/* Needle */}
                    <g transform="rotate(-38 150 135)" filter="url(#needle-shadow-dark)">
                      {/* Metallic black body */}
                      <polygon points="150,131 235,135 150,139" fill="url(#metallic-needle)" />
                      <linearGradient id="metallic-needle" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={theme === 'dark' ? "#333333" : "#D4D4D4"} />
                        <stop offset="50%" stopColor={theme === 'dark' ? "#F5F5F0" : "#0B1728"} />
                        <stop offset="100%" stopColor={theme === 'dark' ? "#111111" : "#FFFFFF"} />
                      </linearGradient>
                      
                      {/* Base */}
                      <circle cx="150" cy="135" r="12" fill={theme === 'dark' ? "#111111" : "#FFFFFF"} stroke={theme === 'dark' ? "#333333" : "#D4D4D4"} strokeWidth="1" />
                      {/* Gold Center */}
                      <circle cx="150" cy="135" r="6" fill="var(--color-primary)" />
                    </g>
                  </svg>
                </div>
                <div className="text-center mt-[-5px] z-10 relative">
                  <p className={`text-2xl font-serif font-bold text-positive tracking-tight leading-none mb-1 ${theme === 'dark' ? 'drop-shadow-[0_0_15px_rgba(0,208,132,0.5)]' : ''}`}>Bullish</p>
                  <p className="text-xs font-medium text-text-muted">Overall market sentiment is positive.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Intelligence */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }} className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 lg:p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-text-main leading-tight tracking-tight">Market Intelligence</h3>
                  <p className="text-[11px] text-text-muted mt-1 font-medium">Top financial news</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-ui-surface-hover flex items-center justify-center border border-ui-border text-text-muted hover:text-primary hover:border-primary transition-colors shadow-sm">
                  <Newspaper size={14} strokeWidth={2} />
                </button>
              </div>

              <div className="space-y-3">
                {/* News Item 1 */}
                <div className="group border border-ui-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer bg-ui-surface hover:bg-ui-surface-hover shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[9px] font-bold uppercase tracking-widest bg-ui-surface-hover text-text-main border border-ui-border px-2 py-0.5 rounded-full">Tech</span>
                         <span className="text-[10px] font-medium text-text-muted">2 hours ago</span>
                      </div>
                      <h4 className="text-sm font-bold text-text-main leading-tight mb-1 group-hover:text-primary transition-colors">TCS Secures Multi-Billion Dollar Deal</h4>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">India's largest IT services firm announced a massive digital transformation contract, boosting revenue visibility.</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                     <div className="flex-1 min-w-0 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-ui-surface-hover border border-ui-border flex items-center justify-center font-bold text-[9px] text-primary">TCS</div>
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-text-main leading-none mb-0.5">₹4,120.50</span>
                         <span className="text-[10px] font-bold text-positive flex items-center leading-none"><span className="text-[8px] mr-0.5">▲</span> +2.4%</span>
                       </div>
                     </div>
                     <button className="text-[11px] font-bold bg-ui-surface-hover border border-ui-border px-3 py-1.5 rounded-lg text-text-main hover:bg-primary hover:text-[#000000] hover:border-primary transition-colors flex items-center gap-1 shadow-sm">
                        Trade <ChevronRight size={12} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>

                {/* News Item 2 */}
                <div className="group border border-ui-border rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer bg-ui-surface hover:bg-ui-surface-hover shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[9px] font-bold uppercase tracking-widest bg-ui-surface-hover text-text-main border border-ui-border px-2 py-0.5 rounded-full">Banking</span>
                         <span className="text-[10px] font-medium text-text-muted">4 hours ago</span>
                      </div>
                      <h4 className="text-sm font-bold text-text-main leading-tight mb-1 group-hover:text-primary transition-colors">HDFC Bank Reports Strong Q3 Earnings</h4>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">The private sector lender beat estimates with healthy credit growth and stable asset quality, leading to a surge in banking stocks.</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-ui-border flex items-center justify-between">
                     <div className="flex-1 min-w-0 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-ui-surface-hover border border-ui-border flex items-center justify-center font-bold text-[9px] text-primary">HDFC</div>
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-text-main leading-none mb-0.5">₹1,680.10</span>
                         <span className="text-[10px] font-bold text-positive flex items-center leading-none"><span className="text-[8px] mr-0.5">▲</span> +1.8%</span>
                       </div>
                     </div>
                     <button 
                       onClick={() => {
                         const s = stocks.find(st => st.symbol === 'HDFCBANK' || st.symbol === 'HDFC');
                         if (s && onTrade) onTrade(s);
                         else openModal('trade', { symbol: 'HDFCBANK' });
                       }}
                       className="text-[11px] font-bold bg-ui-surface-hover border border-ui-border px-3 py-1.5 rounded-lg text-text-main hover:bg-primary hover:text-[#000000] hover:border-primary transition-colors flex items-center gap-1 shadow-sm"
                     >
                        Trade <ChevronRight size={12} strokeWidth={2.5} />
                     </button>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  addToast('Displaying curated real-time financial market intelligence', 'info');
                }}
                className="w-full mt-4 py-3 border border-ui-border text-text-main font-bold text-xs rounded-xl hover:bg-ui-surface-hover hover:border-ui-border transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                View All Market News <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </div>

      {/* Interactive Modals */}
      {detailsSymbol && (
        <PositionDetailsModal
          isOpen={!!detailsSymbol}
          onClose={() => setDetailsSymbol(null)}
          stock={stocks.find(s => s.symbol.toUpperCase() === detailsSymbol.toUpperCase()) || stocks[0]}
          holding={profile?.holdings?.find(h => h.symbol.toUpperCase() === detailsSymbol.toUpperCase())}
          onQuickTrade={(s) => onTrade && onTrade(s)}
          onModifyAllocation={(sym) => {
            setDetailsSymbol(null);
            setModifySymbol(sym);
          }}
        />
      )}

      {modifySymbol && (
        <ModifyAllocationModal
          isOpen={!!modifySymbol}
          onClose={() => setModifySymbol(null)}
          symbol={modifySymbol}
          name={stocks.find(s => s.symbol.toUpperCase() === modifySymbol.toUpperCase())?.name || modifySymbol}
          currentAllocation={
            profile?.targetAllocations?.[modifySymbol] ?? 
            Math.round(holdingsWithData.find(h => h.symbol === modifySymbol)?.allocation || 10)
          }
          onSave={(newAlloc) => {
            modifyHoldingAllocation(modifySymbol, newAlloc);
            addToast(`Updated target allocation for ${modifySymbol} to ${newAlloc}%`, 'success');
            setModifySymbol(null);
          }}
        />
      )}
    </div>
  );
};

export default React.memo(DashboardView);
