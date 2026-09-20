import React, { useState, useMemo } from 'react';
import { 
  Eye, EyeOff, Settings, Search, Filter, ArrowUpRight, ArrowDownRight, 
  TrendingUp, TrendingDown, Clock, Activity as ActivityIcon, PieChart as PieChartIcon,
  CheckCircle2, XCircle, AlertCircle, Briefcase, Plus, SearchX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { formatCurrency as formatRegionalCurrency, formatCompactCurrency as formatRegionalCompact } from '../utils/formatters.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

type Tab = 'Overview' | 'Holdings' | 'Performance' | 'Activity';
type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y' | 'All';

const PIE_COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B'];

const PortfolioView: React.FC = () => {
  const { profile, summary, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { navigate } = useNavigation();
  
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [hideBalances, setHideBalances] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  
  // Holdings state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'value' | 'return' | 'change' | 'alpha'>('value');

  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  // --- Derived Data ---
  
  const displayPositions = useMemo(() => {
    const relevantHoldings = profile.holdings.filter((h) => {
      if (!h || h.shares <= 0) return false;
      const s = stocks.find(stock => stock.symbol.toUpperCase() === h.symbol.toUpperCase());
      const stockCurrency = s?.currency || (['AMD', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META'].includes(h.symbol.toUpperCase()) ? '$' : '₹');
      return stockCurrency === currencySymbol;
    });

    return relevantHoldings.map(holding => {
      const stock = stocks.find((s) => s.symbol.toUpperCase() === holding.symbol.toUpperCase());
      const currentPrice = stock?.price || holding.averagePrice;
      const currentValue = currentPrice * holding.shares;
      const investedValue = holding.averagePrice * holding.shares;
      const pnl = currentValue - investedValue;
      const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
      const todayChange = stock?.changePercent || 0;
      
      let category = 'Stocks';
      if (holding.symbol.includes('BEES') || holding.symbol.includes('ETF')) category = 'ETFs';
      if (holding.symbol.includes('BTC') || holding.symbol.includes('ETH')) category = 'Crypto';
      if (holding.symbol.includes('MUTUAL') || holding.symbol.includes('FUND')) category = 'Mutual Funds';

      return {
        ...holding,
        stock,
        name: stock?.name || holding.symbol,
        currentPrice,
        currentValue,
        investedValue,
        pnl,
        pnlPercent,
        todayChange,
        category
      };
    });
  }, [profile.holdings, stocks, currencySymbol]);

  const todayPnL = useMemo(() => {
    return displayPositions.reduce((acc, pos) => {
      const todayValChange = pos.currentValue * (pos.todayChange / 100);
      return acc + todayValChange;
    }, 0);
  }, [displayPositions]);

  const assetAllocation = useMemo(() => {
    const alloc = displayPositions.reduce((acc, pos) => {
      acc[pos.category] = (acc[pos.category] || 0) + pos.currentValue;
      return acc;
    }, {} as Record<string, number>);
    
    // Add Cash
    if (summary.availableCash > 0) {
      alloc['Cash'] = summary.availableCash;
    }

    const total = Object.values(alloc).reduce((sum: number, val: number) => sum + val, 0);
    
    return Object.entries(alloc)
      .map(([name, value]: [string, any], index) => ({
        value: value as number,
        name,
        
        percent: (total as number) > 0 ? ((value as number) / (total as number)) * 100 : 0,
        color: PIE_COLORS[index % PIE_COLORS.length]
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  }, [displayPositions, summary.availableCash]);

  const filteredAndSortedPositions = useMemo(() => {
    let result = displayPositions;
    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.symbol.toLowerCase().includes(q) || 
        p.name.toLowerCase().includes(q)
      );
    }
    
    return result.sort((a, b) => {
      if (sortBy === 'value') return b.currentValue - a.currentValue;
      if (sortBy === 'return') return b.pnlPercent - a.pnlPercent;
      if (sortBy === 'change') return b.todayChange - a.todayChange;
      if (sortBy === 'alpha') return a.symbol.localeCompare(b.symbol);
      return 0;
    });
  }, [displayPositions, filterCategory, searchQuery, sortBy]);

  // Mock chart data for timeframe
  const chartData = useMemo(() => {
    const points = 30;
    const data = [];
    const cv = summary.currentValue || 0;
    if (cv === 0) return [];
    
    let baseValue = cv * (timeframe === '1D' ? 0.99 : timeframe === '1W' ? 0.95 : timeframe === '1M' ? 0.90 : 0.70);
    const vol = timeframe === '1D' ? 0.005 : 0.02;
    
    for (let i = 0; i < points; i++) {
      if (i === points - 1) {
        data.push({ time: 'Now', value: cv });
      } else {
        const step = baseValue * (1 + (Math.random() * vol * 2 - vol));
        baseValue = step;
        data.push({ time: `T-${points - i}`, value: step });
      }
    }
    return data;
  }, [summary.currentValue, timeframe]);

  // Formatters
  const formatCurrency = (val: number) => {
    if (hideBalances) return '••••••';
    return formatRegionalCurrency(val, marketContext);
  };
  
  const formatCompactCurrency = (val: number) => {
    if (hideBalances) return '••••••';
    return formatRegionalCompact(val, marketContext);
  };

  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  if (displayPositions.length === 0 && summary.availableCash === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center h-[calc(100vh-140px)]">
        <div className="w-20 h-20 bg-ui-bg border border-ui-border rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
          <Briefcase size={32} className="text-text-muted" />
        </div>
        <h2 className="text-2xl font-serif font-black text-text-main mb-3">Your portfolio is empty</h2>
        <p className="text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
          Start building your wealth by exploring the market and making your first investment.
        </p>
        <button 
          onClick={() => navigate('market')}
          className="bg-primary text-black font-bold py-3.5 px-8 rounded-full hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Search size={18} />
          Explore Investments
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full pb-20">
      
      {/* Portfolio Header Controls */}
      <div className="flex justify-end items-center mb-4 gap-3 px-1 mt-2">
        <button 
          onClick={() => setHideBalances(!hideBalances)}
          className="w-9 h-9 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/50 transition-all shadow-sm"
          title={hideBalances ? "Show Balances" : "Hide Balances"}
        >
          {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button 
          className="w-9 h-9 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/50 transition-all shadow-sm"
          title="Portfolio Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Main Column */}
        <div className="xl:col-span-2 flex flex-col gap-6 md:gap-8">
          
          {/* Portfolio Summary Card */}
          <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-black/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <p className="text-sm font-bold text-text-muted uppercase tracking-widest mb-2 relative z-10">Total Portfolio Value</p>
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6 mb-6 md:mb-8 relative z-10">
              <h1 className="text-4xl md:text-5xl font-mono font-black text-text-main tracking-tight">
                {formatCurrency(summary.currentValue)}
              </h1>
              <div className={`flex items-center gap-1.5 text-lg font-bold font-mono px-3 py-1 rounded-full ${summary.totalGain >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'} self-start md:mb-1.5`}>
                {summary.totalGain >= 0 ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                {formatCurrency(Math.abs(summary.totalGain))} ({formatPercent(summary.returnPct)})
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-ui-border/60 relative z-10">
              <div>
                <p className="text-xs text-text-muted font-bold mb-1">Invested</p>
                <p className="text-sm md:text-base font-mono font-bold text-text-main">{formatCurrency(summary.investedValue)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted font-bold mb-1">Available Cash</p>
                <p className="text-sm md:text-base font-mono font-bold text-text-main">{formatCurrency(summary.availableCash)}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs text-text-muted font-bold mb-1">Today's P&L</p>
                <p className={`text-sm md:text-base font-mono font-bold ${todayPnL >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {todayPnL >= 0 ? '+' : ''}{formatCurrency(todayPnL)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Chart Component */}
          <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Performance</h3>
              <div className="flex items-center bg-ui-bg rounded-lg p-1 border border-ui-border">
                {(['1D', '1W', '1M', '6M', '1Y', '5Y', 'All'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${
                      timeframe === tf 
                        ? 'bg-ui-surface text-primary shadow-sm border border-primary/20' 
                        : 'text-text-muted hover:text-text-main hover:bg-ui-surface/50'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[200px] md:h-[260px] w-full">
              {!hideBalances && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-ui-surface border border-ui-border rounded-xl shadow-xl p-3">
                              <p className="text-xs text-text-muted font-bold mb-1">{payload[0].payload.time}</p>
                              <p className="text-sm font-mono font-bold text-primary">
                                {currencySymbol}{Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#D4AF37" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-text-muted font-bold font-mono tracking-widest text-xl opacity-50">••••••</div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden overflow-x-auto custom-scrollbar border-b border-ui-border bg-ui-bg sticky top-14 z-10 -mx-4 px-4 py-2">
            <div className="flex items-center gap-2">
              {(['Overview', 'Holdings', 'Performance', 'Activity'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-ui-surface text-text-muted border border-ui-border hover:bg-ui-surface-hover'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-6 border-b border-ui-border">
            {(['Overview', 'Holdings', 'Performance', 'Activity'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-bold relative transition-colors ${
                  activeTab === tab ? 'text-primary' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="desktopTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content - Main Column */}
          
          {(activeTab === 'Overview' || activeTab === 'Holdings') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-ui-surface p-2 md:p-3 rounded-2xl border border-ui-border">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search holdings..."
                    className="w-full bg-ui-bg border border-ui-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 text-text-main placeholder:text-text-muted"
                  />
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar sm:overflow-visible">
                    {(['All', 'Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Crypto'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          filterCategory === cat
                            ? 'bg-primary text-black'
                            : 'bg-ui-bg text-text-muted border border-ui-border hover:text-text-main'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text-main bg-ui-bg border border-ui-border px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                      <Filter size={14} />
                      <span className="hidden sm:inline">Sort</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 bg-ui-surface border border-ui-border rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      {[
                        { id: 'value', label: 'Value' },
                        { id: 'return', label: 'Return' },
                        { id: 'change', label: "Today's Change" },
                        { id: 'alpha', label: 'Alphabetical' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setSortBy(opt.id as any)}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                            sortBy === opt.id ? 'text-primary bg-primary/5' : 'text-text-muted hover:bg-ui-surface-hover hover:text-text-main'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {filteredAndSortedPositions.length === 0 ? (
                <div className="text-center py-12 bg-ui-surface border border-ui-border rounded-2xl">
                  <SearchX size={32} className="mx-auto text-ui-border mb-3" />
                  <p className="text-sm font-bold text-text-main">No holdings match your filters</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setFilterCategory('All'); }}
                    className="text-xs font-bold text-primary mt-2"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Desktop Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <div className="col-span-4">Asset</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-3 text-right">Holding</div>
                    <div className="col-span-3 text-right">Total P&L</div>
                  </div>

                  {filteredAndSortedPositions.map((pos, index) => (
                    <div 
                      key={`${pos.symbol}-${index}`}
                      onClick={() => {
                        if (pos.stock) {
                          navigate('trade', { stock: pos.stock });
                        }
                      }}
                      className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-xl p-4 hover:border-primary/40 hover:bg-ui-surface-hover transition-all cursor-pointer group"
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center shadow-sm text-text-main font-bold">
                              {pos.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-text-main leading-tight">{pos.symbol}</h4>
                              <p className="text-xs text-text-muted truncate max-w-[150px]">{pos.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-text-main text-sm">
                              {currencySymbol}{pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-[10px] font-bold font-mono ${pos.todayChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {pos.todayChange >= 0 ? '+' : ''}{pos.todayChange.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <div className="h-px bg-ui-border w-full" />
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Holding</p>
                            <p className="text-sm font-mono font-bold text-text-main">
                              {pos.shares} <span className="text-xs text-text-muted">@ {currencySymbol}{pos.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </p>
                            <p className="text-xs font-mono font-bold text-text-main mt-0.5">
                              {formatCurrency(pos.currentValue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Return</p>
                            <p className={`text-sm font-mono font-bold ${pos.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {pos.pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(pos.pnl))}
                            </p>
                            <p className={`text-xs font-mono font-bold mt-0.5 ${pos.pnlPercent >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center px-2">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center shadow-sm text-text-main font-bold shrink-0">
                            {pos.symbol.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text-main group-hover:text-primary transition-colors truncate">{pos.symbol}</h4>
                            <p className="text-xs text-text-muted truncate">{pos.name}</p>
                          </div>
                        </div>
                        
                        <div className="col-span-2 text-right">
                          <p className="font-mono font-bold text-text-main">{currencySymbol}{pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          <p className={`text-[10px] font-bold font-mono ${pos.todayChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {pos.todayChange >= 0 ? '+' : ''}{pos.todayChange.toFixed(2)}%
                          </p>
                        </div>
                        
                        <div className="col-span-3 text-right">
                          <p className="font-mono font-bold text-text-main">{formatCurrency(pos.currentValue)}</p>
                          <p className="text-[11px] text-text-muted font-mono">{pos.shares} shs @ {currencySymbol}{pos.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        
                        <div className="col-span-3 text-right">
                          <p className={`font-mono font-bold ${pos.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {pos.pnl >= 0 ? '+' : ''}{formatCurrency(Math.abs(pos.pnl))}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${pos.pnlPercent >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                              {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-4 md:p-6">
              <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Recent Transactions</h3>
              {(() => {
                const regionalTxs = profile.transactions.filter(tx => {
                  const s = stocks.find(stock => stock.symbol.toUpperCase() === tx.symbol.toUpperCase());
                  const stockCurrency = s?.currency || (['AMD', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ'].includes(tx.symbol.toUpperCase()) ? '$' : '₹');
                  return stockCurrency === currencySymbol;
                });

                if (regionalTxs.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <p className="text-text-muted text-sm">No recent activity for this market.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {regionalTxs.slice().reverse().map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-ui-bg rounded-xl border border-ui-border hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            tx.type === 'BUY' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {tx.type === 'BUY' ? 'B' : 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-text-main">{tx.symbol}</p>
                            <p className="text-xs text-text-muted">
                              {tx.type === 'BUY' ? 'Bought' : 'Sold'} {tx.shares} shares @ {currencySymbol}{tx.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className={`font-mono font-bold ${tx.type === 'BUY' ? 'text-text-main' : 'text-positive'}`}>
                            {tx.type === 'BUY' ? '-' : '+'}{formatCurrency(tx.shares * tx.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-text-muted font-mono">
                              {new Date(tx.timestamp).toLocaleDateString()}
                            </p>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-positive/10 text-positive uppercase tracking-wider">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'Performance' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Return", val: todayPnL, pct: (todayPnL / summary.investedValue) * 100 },
                { label: "Total Return", val: summary.totalGain, pct: summary.returnPct },
                { label: "Monthly Return", val: summary.totalGain * 0.4, pct: summary.returnPct * 0.4 }, // Mocked
                { label: "YTD Return", val: summary.totalGain * 0.8, pct: summary.returnPct * 0.8 }, // Mocked
              ].map((metric, i) => (
                <div key={i} className="bg-ui-surface border border-ui-border rounded-2xl p-4 md:p-6 text-center">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">{metric.label}</p>
                  <p className={`text-lg md:text-xl font-mono font-bold mb-1 ${metric.val >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {metric.val >= 0 ? '+' : ''}{formatCompactCurrency(Math.abs(metric.val))}
                  </p>
                  <div className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${metric.pct >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                    {metric.pct >= 0 ? '+' : ''}{metric.pct.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right / Secondary Column (Desktop context mainly, stacks on mobile) */}
        <div className={`xl:col-span-1 flex flex-col gap-6 md:gap-8 ${activeTab === 'Holdings' ? 'hidden xl:flex' : 'flex'}`}>
          
          {/* Asset Allocation */}
          <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-md">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Asset Allocation</h3>
            
            {assetAllocation.length > 0 ? (
              <>
                {!hideBalances && (
                  <div className="h-[180px] w-full mb-6 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetAllocation}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${currencySymbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']}
                          contentStyle={{ backgroundColor: 'var(--color-ui-surface)', borderColor: 'var(--color-ui-border)', borderRadius: '12px' }}
                          itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Assets</span>
                      <span className="text-lg font-mono font-black text-text-main">{assetAllocation.length}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {assetAllocation.map(alloc => (
                    <div key={alloc.name} className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-ui-bg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                        <span className="text-sm font-bold text-text-main">{alloc.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-text-main">{alloc.percent.toFixed(1)}%</p>
                        <p className="text-[10px] font-mono text-text-muted">{formatCompactCurrency(alloc.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <PieChartIcon size={24} className="mx-auto text-ui-border mb-2" />
                <p className="text-xs text-text-muted">No allocation data</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-md">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('market')}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-between group"
              >
                <span>Invest More</span>
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
              </button>
              <button 
                className="w-full bg-ui-bg hover:bg-ui-surface-hover text-text-main font-bold text-sm py-3 px-4 rounded-xl border border-ui-border transition-colors flex items-center justify-between group"
              >
                <span>Withdraw Funds</span>
                <ArrowUpRight size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
