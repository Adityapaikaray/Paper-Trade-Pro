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
import { useAuth } from '../contexts/AuthContext.tsx';
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
  
  const [showAllHoldings, setShowAllHoldings] = useState(false);

  const { profile, marketContext, addFunds, modifyHoldingAllocation, summary } = usePortfolio();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  const { stocks } = useMarketData();
  const userName = user?.name && user.name !== 'Guest User' && user.name !== 'Prestige User' ? user.name : 'Aditya';
  
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

  const { openModal, addToast, setIsCopilotOpen, openCopilotWithPrompt } = useUI();

  const topMovers = useMemo(() => {
    return stocks
      .filter(s => s.currency === currencySymbol)
      .sort((a, b) => moversType === 'gainers' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)
      .slice(0, 5);
  }, [stocks, currencySymbol, moversType]);

  const recentOrders = useMemo(() => {
    const orders = profile?.orders || [];
    return orders
      .filter(o => !o.currency || o.currency === currencySymbol)
      .slice(-5)
      .reverse();
  }, [profile?.orders, currencySymbol]);

  return (
    <div className="pb-16 max-w-[1600px] mx-auto w-full space-y-6">
      
      {/* 1. Hero / Welcome Section */}
      <div 
        className="rounded-[24px] p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 border border-ui-border shadow-xs"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(ellipse at center bottom, #131A26 0%, #090C12 100%)' 
            : 'linear-gradient(135deg, #FCFAF4 0%, #F5ECD8 50%, #FAF5EA 100%)'
        }}
      >
        {/* Subtle mountain / line silhouette watermark */}
        <div 
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 100 L20 65 L45 85 L75 30 L95 70 L100 60 L100 100 Z\' fill=\'%23D4AF37\' fill-opacity=\'0.3\' stroke=\'%23D4AF37\' stroke-width=\'1.5\' /%3E%3C/svg%3E")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'bottom' 
          }} 
        />
        
        {/* Very subtle gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-sans font-medium text-text-main tracking-tight leading-snug">
            Good morning, <span className="font-serif italic font-bold text-text-main">{userName}</span>
          </h1>
          <p className="text-text-muted text-xs md:text-sm font-medium mt-1.5">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col md:items-end gap-3 md:text-right">
          <div className="hidden sm:block">
            <p className="text-xs md:text-sm font-serif text-text-main font-medium italic">
              "Discipline today, compounds a brighter tomorrow."
            </p>
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider mt-1">
              — Warren Buffett
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-ui-surface/90 backdrop-blur-xs border border-ui-border rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-2xs">
              <div className="flex flex-col text-left md:text-right">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Sun, 13 Sept 2026</span>
                <span className="text-[10px] text-text-main font-medium flex items-center gap-1">
                  Small steps. Bigger tomorrows. <ArrowRight size={10} className="text-primary inline" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Portfolio Summary 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* 1. Total Portfolio Value */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }} 
          className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Briefcase size={14} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Portfolio Value</p>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-2">
            {currencySymbol}{summary.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[11px] font-mono font-bold flex items-center gap-1 ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
            {summary.totalGain >= 0 ? <TrendingUp size={12} strokeWidth={2.5} /> : <TrendingDown size={12} strokeWidth={2.5} />}
            <span>{summary.totalGain >= 0 ? '+' : ''}{currencySymbol}{Math.abs(summary.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span>({summary.returnPct >= 0 ? '+' : ''}{summary.returnPct.toFixed(2)}%)</span>
          </p>
        </motion.div>

        {/* 2. Invested Capital */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.05 }} 
          className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
              <Activity size={14} className="text-primary" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Invested Capital</p>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-2">
            {currencySymbol}{summary.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-sans font-medium text-text-muted truncate">
            Across {holdingsWithData.length} asset{holdingsWithData.length === 1 ? '' : 's'}
          </p>
        </motion.div>

        {/* 3. Total P&L */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.1 }} 
          className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${summary.totalGain >= 0 ? 'bg-positive/10 border-positive/30 text-positive' : 'bg-negative/10 border-negative/30 text-negative'}`}>
              {summary.totalGain >= 0 ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total P&L</p>
          </div>
          <p className={`text-xl xl:text-2xl font-mono font-bold leading-none mb-2 ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
            {summary.totalGain >= 0 ? '+' : ''}{currencySymbol}{summary.totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${summary.totalGain >= 0 ? 'bg-positive/10 text-positive border border-positive/20' : 'bg-negative/10 text-negative border border-negative/20'}`}>
              {summary.returnPct >= 0 ? '+' : ''}{summary.returnPct.toFixed(2)}% return
            </span>
          </div>
        </motion.div>

        {/* 4. Available Cash */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3, delay: 0.15 }} 
          className="bg-ui-surface rounded-2xl p-5 border border-ui-border shadow-xs flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ui-surface-hover flex items-center justify-center shrink-0 border border-ui-border">
                <span className="text-text-muted font-bold text-xs">{currencySymbol}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Available Cash</p>
            </div>
          </div>
          <p className="text-xl xl:text-2xl font-mono font-bold text-text-main leading-none mb-2">
            {currencySymbol}{summary.availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-sans font-medium text-text-muted truncate">
            Purchasing power available
          </p>
        </motion.div>
      </div>

      {/* 3. Portfolio Performance Graph Card & Bottom Tabs */}
      <PremiumPerformanceCard activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 4. Two-Column Layout Below Chart Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Top Holdings Table / Active Positions (7 cols) + AI Copilot */}
        <div className="xl:col-span-7 space-y-6 flex flex-col">
          
          {/* Top Holdings Card */}
          <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-ui-border mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-text-main leading-tight">Top Holdings</h3>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Your largest active positions by market value</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openModal('add-position')}
                  className="px-3 py-1.5 rounded-xl bg-primary text-text-dark text-xs font-bold hover:bg-primary-light transition-all flex items-center gap-1 shadow-xs"
                >
                  <Plus size={13} strokeWidth={2.5} /> Add Position
                </button>
                <button 
                  onClick={() => setShowAllHoldings(!showAllHoldings)}
                  className="text-xs font-bold text-primary hover:text-text-main transition-colors flex items-center gap-1 ml-2"
                >
                  {showAllHoldings ? 'Show Less' : 'See All'} <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>

            {holdingsWithData.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-ui-bg text-text-muted flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">No active positions yet</p>
                  <p className="text-xs text-text-muted mt-0.5">Use the Quick Trade panel to buy your first stock or ETF.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ui-border text-[10px] uppercase font-bold text-text-muted tracking-wider">
                      <th className="pb-2.5 font-bold">Asset</th>
                      <th className="pb-2.5 font-bold text-right">Price</th>
                      <th className="pb-2.5 font-bold text-right">Today's Change</th>
                      <th className="pb-2.5 font-bold text-right">Shares</th>
                      <th className="pb-2.5 font-bold text-right">Market Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ui-border/60">
                    {(showAllHoldings ? holdingsWithData : holdingsWithData.slice(0, 5)).map((holding, index) => {
                      const isPositive = holding.todayChange >= 0;
                      return (
                        <tr 
                          key={`${holding.symbol}-${index}`} 
                          onClick={() => setDetailsSymbol(holding.symbol)}
                          className="group hover:bg-ui-surface-hover/60 transition-colors cursor-pointer"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center font-bold text-xs text-text-main group-hover:border-primary/50 group-hover:text-primary transition-colors shrink-0">
                                {holding.symbol.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs md:text-sm text-text-main truncate">{holding.symbol}</div>
                                <div className="text-[10px] text-text-muted truncate max-w-[140px]">{holding.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="font-mono font-bold text-xs md:text-sm text-text-main">
                              {currencySymbol}{holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isPositive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                            }`}>
                              {isPositive ? '▲ +' : '▼ '}{Math.abs(holding.todayChangePct).toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="font-mono font-bold text-xs text-text-main">
                              {holding.shares.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="font-mono font-bold text-xs md:text-sm text-text-main">
                              {currencySymbol}{holding.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Portfolio Copilot Prompt Card */}
          <div className="bg-ui-surface rounded-2xl p-6 border border-primary/30 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-start gap-3.5 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center shadow-2xs shrink-0 text-primary">
                <Bot size={20} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-sans text-text-main">AI Portfolio Copilot</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary px-1.5 py-0.5 rounded-md">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-medium">
                  Ask TradePro Copilot to analyze your portfolio or suggest rebalancing.
                </p>
              </div>
            </div>

            {/* Quick prompt buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 relative z-10">
              <button 
                onClick={() => openCopilotWithPrompt("Analyze the risk, beta, and volatility exposure of my current portfolio holdings")}
                className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-bold text-text-main hover:border-primary hover:text-primary transition-all text-center"
              >
                Analyze Risk
              </button>
              <button 
                onClick={() => openCopilotWithPrompt("Suggest an optimal portfolio rebalancing strategy based on target asset allocation")}
                className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-bold text-text-main hover:border-primary hover:text-primary transition-all text-center"
              >
                Suggest Rebalancing
              </button>
              <button 
                onClick={() => openCopilotWithPrompt("Review tax optimization strategies and capital gains efficiency for my investments")}
                className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-bold text-text-main hover:border-primary hover:text-primary transition-all text-center"
              >
                Tax Optimization
              </button>
            </div>

            <button 
              onClick={() => setIsCopilotOpen(true)}
              className="w-full py-2.5 bg-primary hover:bg-primary-light text-text-dark font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Launch Copilot</span>
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Market Overview + Recent Activity + Quick Trade (5 cols) */}
        <div className="xl:col-span-5 space-y-6 flex flex-col">
          
          {/* Market Movers Card */}
          <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-ui-border mb-4">
              <div>
                <h3 className="text-base font-bold font-sans text-text-main">Market Movers</h3>
                <p className="text-[11px] text-text-muted mt-0.5 font-medium">Top performing {isIndia ? 'NSE' : 'US'} equities</p>
              </div>

              {/* Tabs: Gainers | Losers */}
              <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border text-xs font-bold">
                <button
                  onClick={() => setMoversType('gainers')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    moversType === 'gainers' 
                      ? 'bg-ui-surface text-positive shadow-2xs font-bold' 
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Gainers
                </button>
                <button
                  onClick={() => setMoversType('losers')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    moversType === 'losers' 
                      ? 'bg-ui-surface text-negative shadow-2xs font-bold' 
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Losers
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {topMovers.map((stock) => {
                const isPos = stock.changePercent >= 0;
                return (
                  <div 
                    key={stock.symbol}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ui-surface-hover/60 transition-colors border border-transparent hover:border-ui-border group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-ui-bg border border-ui-border flex items-center justify-center font-bold text-xs text-text-main shrink-0">
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-text-main truncate">{stock.symbol}</div>
                        <div className="text-[10px] text-text-muted truncate max-w-[120px]">{stock.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-text-main">
                          {stock.currency || currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-[10px] font-mono font-bold flex items-center justify-end ${isPos ? 'text-positive' : 'text-negative'}`}>
                          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      <button
                        onClick={() => onTrade && onTrade(stock)}
                        className="px-2.5 py-1 rounded-lg bg-ui-bg border border-ui-border text-[11px] font-bold text-text-main hover:bg-primary hover:text-text-dark hover:border-primary transition-all shadow-2xs"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-ui-border mb-4">
              <div>
                <h3 className="text-base font-bold font-sans text-text-main">Recent Activity</h3>
                <p className="text-[11px] text-text-muted mt-0.5 font-medium">Order executions and transaction logs</p>
              </div>
              <button 
                onClick={() => onNavigate ? onNavigate('orders') : openModal('orders')}
                className="text-xs font-bold text-primary hover:text-text-main transition-colors flex items-center gap-1"
              >
                View Orders <ArrowRight size={12} strokeWidth={2} />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No orders executed yet. Your recent trades will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, idx) => {
                  const isBuy = order.type === 'BUY';
                  const orderDate = new Date(order.timestamp);
                  const timeString = isNaN(orderDate.getTime()) 
                    ? 'Just now' 
                    : orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div 
                      key={order.id || idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-ui-bg/50 border border-ui-border/60 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] uppercase ${
                          isBuy ? 'bg-positive/15 text-positive border border-positive/30' : 'bg-negative/15 text-negative border border-negative/30'
                        }`}>
                          {order.type}
                        </span>
                        <div>
                          <div className="font-bold text-text-main flex items-center gap-1.5">
                            <span>{order.symbol}</span>
                            <span className="text-[10px] text-text-muted font-normal">
                              ({order.shares} share{order.shares === 1 ? '' : 's'})
                            </span>
                          </div>
                          <div className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={10} className="text-positive inline" />
                            <span>Executed &middot; {timeString}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-text-main">
                        {currencySymbol}{(order.shares * order.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Trade Panel */}
          <QuickTradePanel />

        </div>

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
