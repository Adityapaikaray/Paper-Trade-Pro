import React, { useState, useMemo, useEffect } from 'react';
import { 
  Eye, EyeOff, Plus, Target, ArrowRight, Wallet, 
  TrendingUp, ArrowUpRight, TrendingDown, PieChart as PieChartIcon, Info, ChevronRight, Activity, 
  ArrowLeft, Edit2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { FutureWealthProjection } from './FutureWealthProjection.tsx';

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetYear: number;
  icon: string;
}

const PIE_COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B', '#A78BFA'];

type WealthStep = 'DASHBOARD' | 'CREATE_GOAL' | 'GOAL_DETAILS';

export const WealthView: React.FC = () => {
  const { summary, profile, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { navigate, goBack } = useNavigation();

  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  const [step, setStep] = useState<WealthStep>('DASHBOARD');
  const [hideBalances, setHideBalances] = useState(false);
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y' | '3Y' | '5Y' | 'All'>('1Y');

  // Goals State (Mocking persistence using LocalStorage for standalone wealth module)
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('papertrade_wealth_goals');
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default Goals
      setGoals([
        { id: 'g1', name: 'Retirement', targetAmount: 10000000, currentAmount: summary.currentValue * 0.4, targetYear: 2045, icon: '🏖️' },
        { id: 'g2', name: 'Home Down Payment', targetAmount: 2500000, currentAmount: summary.currentValue * 0.15, targetYear: 2028, icon: '🏠' }
      ]);
    }
  }, [summary.currentValue]);

  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('papertrade_wealth_goals', JSON.stringify(goals));
    }
  }, [goals]);

  // Derived Portfolio Data for Wealth Context
  const displayPositions = useMemo(() => {
    return (profile.holdings || []).map(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      const currentPrice = stock?.price || holding.averagePrice;
      const currentValue = currentPrice * holding.shares;
      
      let category = 'Equities';
      if (holding.symbol.includes('BEES') || holding.symbol.includes('ETF')) category = 'ETFs';
      else if (holding.symbol.includes('BTC') || holding.symbol.includes('ETH')) category = 'Crypto';
      else if (holding.symbol.includes('MUTUAL') || holding.symbol.includes('FUND')) category = 'Mutual Funds';
      else if (holding.symbol.includes('GOLD')) category = 'Gold';
      else if (holding.symbol.includes('BOND') || holding.symbol.includes('GS')) category = 'Bonds';

      return { ...holding, currentPrice, currentValue, category, stock };
    }).filter(h => h.shares > 0);
  }, [profile.holdings, stocks]);

  const assetAllocation = useMemo(() => {
    const alloc = displayPositions.reduce((acc, pos) => {
      acc[pos.category] = (acc[pos.category] || 0) + pos.currentValue;
      return acc;
    }, {} as Record<string, number>);
    
    if (summary.availableCash > 0) {
      alloc['Cash'] = summary.availableCash;
    }

    const entries = Object.entries(alloc) as [string, number][];
    const total = entries.reduce((sum, [_, val]) => sum + val, 0);
    
    return entries
      .map(([name, val], index) => ({
        name,
        value: val,
        percent: total > 0 ? (val / total) * 100 : 0,
        color: PIE_COLORS[index % PIE_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [displayPositions, summary.availableCash]);

  // Formatters
  const formatCurrency = (val: number = 0, maxDigits = 2) => {
    if (hideBalances) return '••••••';
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}`;
  };

  const formatCompactCurrency = (val: number = 0) => {
    if (hideBalances) return '••••••';
    if (val >= 10000000) return `${currencySymbol}${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `${currencySymbol}${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(2)}K`;
    return `${currencySymbol}${val.toFixed(2)}`;
  };

  // Chart Data Generator
  const chartData = useMemo(() => {
    const points = 30;
    const data = [];
    const cv = summary.currentValue || 100000;
    let baseValue = cv * (timeframe === '1M' ? 0.95 : timeframe === '6M' ? 0.85 : timeframe === '1Y' ? 0.70 : 0.50);
    const vol = timeframe === '1M' ? 0.01 : 0.03;
    
    for (let i = 0; i < points; i++) {
      if (i === points - 1) {
        data.push({ time: 'Now', value: cv, invested: summary.investedValue });
      } else {
        const step = baseValue * (1 + (Math.random() * vol * 2 - vol));
        baseValue = step;
        data.push({ time: `T-${points - i}`, value: step, invested: step * 0.9 });
      }
    }
    return data;
  }, [summary.currentValue, summary.investedValue, timeframe]);

  // Create Goal Flow State
  const [newGoalName, setNewGoalName] = useState('Home');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalYear, setNewGoalYear] = useState('2030');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');



  const handleCreateGoal = () => {
    const t = parseFloat(newGoalTarget) || 0;
    const c = parseFloat(newGoalCurrent) || 0;
    const y = parseInt(newGoalYear) || 2030;
    if (t <= 0) return;

    setGoals([...goals, {
      id: `g${Date.now()}`,
      name: newGoalName,
      targetAmount: t,
      currentAmount: c,
      targetYear: y,
      icon: newGoalName === 'Retirement' ? '🏖️' : newGoalName === 'Education' ? '🎓' : '🏠'
    }]);
    setStep('DASHBOARD');
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-24">
      {/* Wealth Header */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0 mt-2">
        {step !== 'DASHBOARD' ? (
          <button 
            onClick={() => setStep('DASHBOARD')}
            className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors py-2 -ml-2"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="font-bold tracking-wide">Back to Wealth</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-primary">
            <Wallet size={24} strokeWidth={2.5} />
            <h1 className="text-lg md:text-xl font-serif font-black tracking-wide">Wealth Management</h1>
          </div>
        )}
        {step === 'DASHBOARD' && (
          <button 
            onClick={() => setHideBalances(!hideBalances)}
            className="w-9 h-9 rounded-full bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-primary transition-colors shadow-sm"
          >
            {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        
        {/* CREATE GOAL FLOW */}
        {step === 'CREATE_GOAL' && (
          <motion.div
            key="create_goal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-2xl font-serif font-black text-text-main mb-6">Create Goal</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Goal Name</label>
                  <select 
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 text-sm font-bold text-text-main focus:outline-none focus:border-primary/50"
                  >
                    <option value="Retirement">Retirement</option>
                    <option value="Home">Home Down Payment</option>
                    <option value="Education">Education</option>
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Target Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(e.target.value)}
                      placeholder="e.g. 5000000"
                      className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 pl-8 text-sm font-mono font-bold text-text-main focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Target Year</label>
                  <input 
                    type="number" 
                    value={newGoalYear}
                    onChange={(e) => setNewGoalYear(e.target.value)}
                    className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 text-sm font-mono font-bold text-text-main focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Current Savings (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={newGoalCurrent}
                      onChange={(e) => setNewGoalCurrent(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 pl-8 text-sm font-mono font-bold text-text-main focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-ui-border">
                  <button
                    onClick={handleCreateGoal}
                    disabled={!newGoalTarget || !newGoalYear}
                    className="w-full py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all bg-primary text-black hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* GOAL DETAILS FLOW */}
        {step === 'GOAL_DETAILS' && selectedGoal && (
          <motion.div
            key="goal_details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                    {selectedGoal.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-black text-text-main mb-1">{selectedGoal.name}</h2>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Target: {selectedGoal.targetYear}</p>
                  </div>
                </div>
                <button className="p-2 text-text-muted hover:text-text-main transition-colors">
                  <Edit2 size={20} />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Current Progress</p>
                    <p className="text-3xl font-mono font-bold text-text-main">
                      {formatCurrency(selectedGoal.currentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Target Amount</p>
                    <p className="text-lg font-mono font-bold text-text-muted">
                      {formatCurrency(selectedGoal.targetAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-primary">{((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}% Complete</span>
                    <span className="text-text-muted">{formatCompactCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)} Remaining</span>
                  </div>
                  <div className="h-3 w-full bg-ui-bg rounded-full overflow-hidden border border-ui-border/50">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                      style={{ width: `${Math.min(100, (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-ui-border/60">
                <button className="py-4 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  Add Funds
                </button>
                <button className="py-4 bg-ui-bg text-text-main font-bold border border-ui-border rounded-xl hover:bg-ui-surface-hover transition-colors">
                  Adjust Target
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* MAIN DASHBOARD */}
        {step === 'DASHBOARD' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 pb-12 px-4 md:px-0"
          >
              {/* 1. WEALTH HERO */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Total Wealth</h2>
                  <div className="flex items-end gap-4 mb-2">
                    <p className="text-4xl md:text-5xl font-mono font-black text-text-main tracking-tight">
                      {hideBalances ? '••••••••' : formatCompactCurrency(summary.currentValue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono font-bold ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'} flex items-center bg-positive/10 px-2 py-1 rounded-md`}>
                      {summary.totalGain >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                      {summary.totalGain >= 0 ? '+' : ''}{formatCompactCurrency(summary.totalGain)} ({summary.totalGain >= 0 ? '+' : ''}{((summary.totalGain / summary.investedValue) * 100 || 0).toFixed(2)}%)
                    </span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-ui-bg px-2 py-1 rounded-md border border-ui-border">All Time</span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-row md:flex-col gap-4 md:gap-6 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested Assets</p>
                    <p className="text-lg font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(summary.investedValue)}</p>
                  </div>
                  <div className="min-w-[140px]">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Available Cash</p>
                    <p className="text-lg font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(160000)}</p>
                  </div>
                </div>
              </div>

              {/* 2. WEALTH PERFORMANCE & SNAPSHOT */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Wealth Performance</h3>
                  
                  <div className="flex items-center bg-ui-bg rounded-lg p-1 border border-ui-border">
                    {['1M', '6M', '1Y', '3Y', '5Y', 'All'].map(period => (
                      <button 
                        key={period}
                        onClick={() => setTimeframe(period as any)}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${timeframe === period ? 'bg-ui-surface shadow-sm text-text-main border border-ui-border' : 'text-text-muted hover:text-text-main'}`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[250px] md:h-[300px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-ui-surface border border-ui-border rounded-xl shadow-xl p-4 min-w-[150px]">
                                <p className="text-[10px] text-text-muted font-bold mb-2 uppercase">{payload[0].payload.date}</p>
                                <p className="text-sm font-mono font-bold text-text-main mb-1 flex justify-between gap-4">
                                  <span>Value:</span>
                                  <span>{hideBalances ? '••••••••' : formatCompactCurrency(payload[0].value as number)}</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Wealth Snapshot Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-ui-border">
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested</p>
                    <p className="text-sm font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(summary.investedValue)}</p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Returns</p>
                    <p className={`text-sm font-mono font-bold ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {summary.totalGain >= 0 ? '+' : ''}{hideBalances ? '••••••••' : formatCompactCurrency(summary.totalGain)}
                    </p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Return %</p>
                    <p className={`text-sm font-mono font-bold ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {summary.totalGain >= 0 ? '+' : ''}{((summary.totalGain / summary.investedValue) * 100 || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Cash</p>
                    <p className="text-sm font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(160000)}</p>
                  </div>
                  <div className="bg-ui-bg p-4 rounded-2xl border border-ui-border">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Today's P&L</p>
                    <p className="text-sm font-mono font-bold text-positive">+₹4,250</p>
                  </div>
                </div>
              </div>

              {/* 3. ASSET ALLOCATION & INVESTMENTS (2-COLUMN) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Asset Allocation */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Asset Allocation</h3>
                  
                  {assetAllocation.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                      <div className="h-[200px] w-[200px] relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {assetAllocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [hideBalances ? '••••••••' : `${currencySymbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']}
                              contentStyle={{ backgroundColor: 'var(--color-ui-surface)', borderColor: 'var(--color-ui-border)', borderRadius: '12px' }}
                              itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-bold text-text-muted uppercase">Assets</span>
                          <span className="text-xl font-mono font-black text-text-main">{assetAllocation.length}</span>
                        </div>
                      </div>
                      
                      <div className="w-full space-y-3">
                        {assetAllocation.map(alloc => (
                          <div key={alloc.name} onClick={() => navigate('portfolio')} className="flex items-center justify-between group cursor-pointer p-3 bg-ui-bg border border-ui-border rounded-xl hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                              <div>
                                <span className="text-sm font-bold text-text-main block">{alloc.name}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{alloc.percent.toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(alloc.value)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 flex-1 flex flex-col justify-center">
                      <PieChartIcon size={40} className="mx-auto text-ui-border mb-4" />
                      <p className="text-sm text-text-muted font-bold">No allocation data</p>
                    </div>
                  )}
                </div>

                {/* Investments Overview */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Investments</h3>
                    <button onClick={() => navigate('portfolio')} className="text-[10px] font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider">
                      View All <ArrowRight size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="bg-ui-bg border border-ui-border p-5 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('portfolio')}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-bold text-text-main">Stocks</h4>
                        <p className="text-lg font-mono font-black text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(summary.currentValue)}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-ui-border/50 pt-3">
                        <div>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested</p>
                          <p className="text-sm font-mono font-bold text-text-main">{hideBalances ? '••••••••' : formatCompactCurrency(summary.investedValue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Returns</p>
                          <p className={`text-sm font-mono font-bold ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {summary.totalGain >= 0 ? '+' : ''}{hideBalances ? '••••••••' : formatCompactCurrency(summary.totalGain)}
                            <span className="ml-1 text-[10px]">({summary.totalGain >= 0 ? '+' : ''}{((summary.totalGain / summary.investedValue) * 100 || 0).toFixed(2)}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-ui-bg border border-ui-border p-5 rounded-2xl opacity-50 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => navigate('market')}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-bold text-text-main">Mutual Funds</h4>
                        <p className="text-lg font-mono font-black text-text-main">{hideBalances ? '••••••••' : '₹0'}</p>
                      </div>
                      <div className="flex justify-between items-end border-t border-ui-border/50 pt-3">
                        <div>
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Invested</p>
                          <p className="text-sm font-mono font-bold text-text-main">{hideBalances ? '••••••••' : '₹0'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Explore</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. FINANCIAL GOALS & INSIGHTS (2-COLUMN) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Goals */}
                <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Financial Goals</h3>
                    <button onClick={() => setStep('CREATE_GOAL')} className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded-full">
                      <Plus size={14} /> Create Goal
                    </button>
                  </div>
                  
                  {goals.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center py-10 bg-ui-bg rounded-2xl border border-ui-border border-dashed">
                       <Target size={40} className="text-ui-border mb-4" />
                       <h4 className="text-sm font-bold text-text-main mb-2">Create your first financial goal</h4>
                       <p className="text-xs text-text-muted max-w-xs mb-4">Set a target and we'll help you track your progress over time.</p>
                       <button onClick={() => setStep('CREATE_GOAL')} className="bg-primary text-black px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
                         + Create Goal
                       </button>
                     </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {goals.map(goal => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                        return (
                          <div 
                            key={goal.id} 
                            onClick={() => setSelectedGoal(goal)}
                            className="bg-ui-bg border border-ui-border rounded-2xl p-5 hover:border-primary/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{goal.icon}</div>
                                <div>
                                  <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">{goal.name}</h4>
                                  <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">Target: {new Date(goal.targetDate).getFullYear()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-mono font-bold text-text-main">
                                  {hideBalances ? '••••••••' : formatCompactCurrency(goal.currentAmount)} / <span className="text-text-muted">{hideBalances ? '••••••••' : formatCompactCurrency(goal.targetAmount)}</span>
                                </p>
                                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest">{progress.toFixed(0)}% Complete</p>
                              </div>
                            </div>
                            
                            <div className="h-2 w-full bg-ui-border rounded-full overflow-hidden mb-4">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary relative"
                              >
                                <div className="absolute inset-0 bg-white/20" />
                              </motion.div>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] text-text-muted font-bold uppercase tracking-widest border-t border-ui-border/50 pt-3">
                              <span>Monthly Contrib: {hideBalances ? '••••••••' : `₹${(25000).toLocaleString('en-IN')}`}</span>
                              <span className="text-primary group-hover:underline">View Detail</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. FUTURE WEALTH PROJECTION */}
              <div className="w-full">
                <FutureWealthProjection />
              </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default WealthView;
