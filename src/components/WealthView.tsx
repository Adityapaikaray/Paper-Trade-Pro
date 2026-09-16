import React, { useState, useMemo, useEffect } from 'react';
import { 
  Eye, EyeOff, Plus, Target, ArrowRight, Wallet, 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, Info, ChevronRight, Activity, 
  ArrowLeft, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

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
  const formatCurrency = (val: number, maxDigits = 2) => {
    if (hideBalances) return '••••••';
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}`;
  };

  const formatCompactCurrency = (val: number) => {
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

  // Projections State
  const [projContrib, setProjContrib] = useState('25000');
  const [projYears, setProjYears] = useState('15');
  const [projReturn, setProjReturn] = useState('12');
  
  const projectedValue = useMemo(() => {
    const P = summary.currentValue;
    const PMT = parseFloat(projContrib) || 0;
    const t = parseFloat(projYears) || 0;
    const r = (parseFloat(projReturn) || 0) / 100;
    
    if (r === 0) return P + (PMT * 12 * t);
    
    // Compound interest for principal
    const principalFuture = P * Math.pow(1 + r, t);
    // Future value of a series for monthly contributions
    const monthlyRate = r / 12;
    const months = t * 12;
    const contribFuture = PMT * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    return principalFuture + contribFuture;
  }, [summary.currentValue, projContrib, projYears, projReturn]);

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
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 px-4 md:px-0"
          >
            {/* Main Column */}
            <div className="xl:col-span-8 flex flex-col gap-6 md:gap-8">
              
              {/* Wealth Overview Card */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 relative z-10">Total Wealth</p>
                <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6 mb-8 relative z-10">
                  <h2 className="text-4xl md:text-5xl font-mono font-black text-text-main tracking-tight">
                    {formatCurrency(summary.currentValue)}
                  </h2>
                  <div className={`flex items-center gap-1.5 text-sm md:text-base font-bold font-mono px-3 py-1 rounded-full ${summary.totalGain >= 0 ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'} self-start md:mb-1.5`}>
                    {summary.totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {summary.totalGain >= 0 ? '+' : ''}{formatCurrency(summary.totalGain)} ({summary.totalGain >= 0 ? '+' : ''}{summary.returnPct.toFixed(2)}%)
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-ui-border/60 relative z-10">
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold mb-1 tracking-wider">Invested Assets</p>
                    <p className="text-sm md:text-base font-mono font-bold text-text-main">{formatCurrency(summary.investedValue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold mb-1 tracking-wider">Available Cash</p>
                    <p className="text-sm md:text-base font-mono font-bold text-text-main">{formatCurrency(summary.availableCash)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold mb-1 tracking-wider">Total Returns</p>
                    <p className={`text-sm md:text-base font-mono font-bold ${summary.totalGain >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {summary.totalGain >= 0 ? '+' : ''}{formatCurrency(summary.totalGain)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-text-muted font-bold mb-1 tracking-wider">Monthly Change</p>
                    <p className="text-sm md:text-base font-mono font-bold text-positive">+₹24,500</p>
                  </div>
                </div>
              </div>

              {/* Wealth Growth Chart */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Wealth Growth</h3>
                  <div className="flex items-center bg-ui-bg rounded-lg p-1 border border-ui-border">
                    {(['1M', '6M', '1Y', '3Y', '5Y', 'All'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                          timeframe === tf 
                            ? 'bg-ui-surface text-primary shadow-sm border border-primary/20' 
                            : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-[220px] md:h-[280px] w-full">
                  {!hideBalances && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748B" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-ui-surface border border-ui-border rounded-xl shadow-xl p-3">
                                  <p className="text-[10px] text-text-muted font-bold mb-2 uppercase">{payload[0].payload.time}</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-xs text-text-muted font-bold flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-primary" /> Wealth
                                      </span>
                                      <span className="text-sm font-mono font-bold text-text-main">
                                        {formatCurrency(Number(payload[0].value))}
                                      </span>
                                    </div>
                                    {payload[1] && (
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-text-muted font-bold flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-slate-500" /> Invested
                                        </span>
                                        <span className="text-xs font-mono font-bold text-text-muted">
                                          {formatCurrency(Number(payload[1].value))}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="invested" 
                          stroke="#64748B" 
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          fillOpacity={1} 
                          fill="url(#colorInvested)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#D4AF37" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorWealth)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-text-muted font-bold font-mono tracking-widest text-xl opacity-50">••••••</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-wider text-text-muted justify-center">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Portfolio Value</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500" /> Invested Amount</div>
                </div>
              </div>

              {/* Your Goals */}
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Your Goals</h3>
                  <button 
                    onClick={() => setStep('CREATE_GOAL')}
                    className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Plus size={14} /> Create Goal
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map(goal => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    return (
                      <div 
                        key={goal.id} 
                        onClick={() => { setSelectedGoal(goal); setStep('GOAL_DETAILS'); }}
                        className="bg-ui-surface border border-ui-border rounded-2xl p-5 hover:border-primary/40 hover:bg-ui-surface-hover cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-xl">
                              {goal.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-text-main">{goal.name}</h4>
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Target: {goal.targetYear}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="font-mono font-bold text-text-main">{formatCompactCurrency(goal.currentAmount)} <span className="text-text-muted text-xs">/ {formatCompactCurrency(goal.targetAmount)}</span></span>
                            <span className="text-xs font-bold text-primary">{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-ui-bg rounded-full overflow-hidden border border-ui-border/50">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Your Investments */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Your Investments</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {assetAllocation.filter(a => a.name !== 'Cash').map(asset => (
                    <div 
                      key={asset.name} 
                      onClick={() => navigate('portfolio')}
                      className="bg-ui-bg border border-ui-border rounded-2xl p-4 hover:border-primary/30 cursor-pointer transition-colors group"
                    >
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 group-hover:text-text-main transition-colors">{asset.name}</p>
                      <p className="text-base md:text-lg font-mono font-bold text-text-main mb-1">{formatCompactCurrency(asset.value)}</p>
                      <p className="text-[10px] font-bold text-positive font-mono">+12.4%</p> {/* Mock return per category */}
                    </div>
                  ))}
                  {assetAllocation.length === 0 && (
                    <div className="col-span-full text-center py-6">
                      <p className="text-sm text-text-muted font-bold">No investments tracked yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 flex flex-col gap-6 md:gap-8">
              
              {/* Asset Allocation */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-6">Asset Allocation</h3>
                
                {assetAllocation.length > 0 ? (
                  <>
                    {!hideBalances && (
                      <div className="h-[200px] w-full mb-6 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={assetAllocation}
                              innerRadius={65}
                              outerRadius={85}
                              paddingAngle={3}
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
                          <span className="text-xl font-mono font-black text-text-main">{assetAllocation.length}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {assetAllocation.map(alloc => (
                        <div key={alloc.name} className="flex items-center justify-between group cursor-pointer p-2.5 -mx-2.5 rounded-xl hover:bg-ui-bg transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }} />
                            <div>
                              <span className="text-sm font-bold text-text-main block">{alloc.name}</span>
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{alloc.percent.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-bold text-text-main">{formatCompactCurrency(alloc.value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <PieChartIcon size={32} className="mx-auto text-ui-border mb-3" />
                    <p className="text-xs text-text-muted font-bold">No allocation data</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('market')} className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider shadow-md shadow-primary/20">
                    Invest
                  </button>
                  <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider">
                    Add Money
                  </button>
                  <button onClick={() => setStep('CREATE_GOAL')} className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider">
                    Create Goal
                  </button>
                  <button onClick={() => navigate('portfolio')} className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-3 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider">
                    Allocation
                  </button>
                </div>
              </div>

              {/* Portfolio Metrics */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-4">Portfolio Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-muted">Largest Holding</span>
                    <span className="font-mono font-bold text-text-main">{displayPositions.length > 0 ? displayPositions[0].symbol : 'N/A'} ({(displayPositions.length > 0 ? (displayPositions[0].currentValue / summary.currentValue) * 100 : 0).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-ui-border/50 pt-3">
                    <span className="font-bold text-text-muted">Equity Exposure</span>
                    <span className="font-mono font-bold text-text-main">{assetAllocation.find(a => a.name === 'Equities')?.percent.toFixed(1) || '0'}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-ui-border/50 pt-3">
                    <span className="font-bold text-text-muted">Historical Return (CAGR)</span>
                    <span className="font-mono font-bold text-text-main">14.2%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-ui-border/50 pt-3">
                    <span className="font-bold text-text-muted">Portfolio Volatility</span>
                    <span className="font-mono font-bold text-text-main">Low</span>
                  </div>
                </div>
              </div>

              {/* Wealth Insights */}
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest mb-4">
                  <Info size={16} /> Wealth Insights
                </h3>
                <div className="space-y-4">
                  <p className="text-xs text-text-main font-bold leading-relaxed border-l-2 border-primary/50 pl-3">
                    Your portfolio value increased by <span className="font-mono text-positive">+₹24,500</span> this month, primarily driven by Equities.
                  </p>
                  <p className="text-xs text-text-main font-bold leading-relaxed border-l-2 border-primary/50 pl-3">
                    Your <span className="text-primary uppercase tracking-wider">{goals[0]?.name || 'Retirement'}</span> goal is currently {goals[0] ? ((goals[0].currentAmount / goals[0].targetAmount) * 100).toFixed(0) : 0}% funded.
                  </p>
                </div>
              </div>

              {/* Future Wealth Projection */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest mb-1">Future Wealth Projection</h3>
                <p className="text-[10px] text-text-muted mb-4 uppercase tracking-widest font-bold">Illustrative Scenario</p>
                
                <div className="space-y-4 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-muted">Monthly Contrib.</span>
                    <input type="number" value={projContrib} onChange={e => setProjContrib(e.target.value)} className="bg-ui-bg border border-ui-border rounded-lg px-2 py-1 text-right font-mono font-bold w-24 text-text-main focus:outline-primary/50" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-muted">Time Horizon (Years)</span>
                    <input type="number" value={projYears} onChange={e => setProjYears(e.target.value)} className="bg-ui-bg border border-ui-border rounded-lg px-2 py-1 text-right font-mono font-bold w-20 text-text-main focus:outline-primary/50" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-muted">Assumed Return (%)</span>
                    <input type="number" value={projReturn} onChange={e => setProjReturn(e.target.value)} className="bg-ui-bg border border-ui-border rounded-lg px-2 py-1 text-right font-mono font-bold w-20 text-text-main focus:outline-primary/50" />
                  </div>
                </div>

                <div className="bg-ui-bg border border-ui-border rounded-xl p-4 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Projected Future Value</p>
                  <p className="text-2xl font-mono font-black text-primary">{formatCompactCurrency(projectedValue)}</p>
                </div>
              </div>

              {/* Explore Investments */}
              <div className="bg-ui-surface border border-ui-border rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Explore</h3>
                  <button onClick={() => navigate('market')} className="text-xs font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                    See All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Stocks', 'Mutual Funds', 'ETFs', 'Bonds', 'Gold'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => navigate('market')}
                      className="px-3 py-1.5 bg-ui-bg border border-ui-border hover:border-primary/50 rounded-lg text-xs font-bold text-text-muted hover:text-text-main transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WealthView;
