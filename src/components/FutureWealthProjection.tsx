import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, TrendingUp, ArrowUpRight, Target, PieChart as PieChartIcon, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatCurrency as globalFormatCurrency, formatCompactCurrency as globalFormatCompactCurrency } from '../utils/formatters.ts';

type ProjectionMode = 'SIP' | 'LUMPSUM' | 'SIP_LUMPSUM';

export const FutureWealthProjection: React.FC = () => {
  const { summary, profile, marketContext } = usePortfolio();
  const { navigate } = useNavigation();

  const isIndia = marketContext === 'IN';
  const currencySymbol = isIndia ? '₹' : '$';
  
  const [mode, setMode] = useState<ProjectionMode>('SIP_LUMPSUM');
  
  const [projContrib, setProjContrib] = useState(marketContext === 'US' ? '2500' : '25000');
  const [projLumpsum, setProjLumpsum] = useState(marketContext === 'US' ? '25000' : '2500000');
  const [projYears, setProjYears] = useState('15');
  const [projReturn, setProjReturn] = useState('13');
  const [useCurrentPortfolio, setUseCurrentPortfolio] = useState(true);

  // Sync inputs when market region changes
  useEffect(() => {
    if (isIndia) {
      setProjContrib(prev => (prev === '2500' ? '25000' : prev));
      if (useCurrentPortfolio && summary) {
        setProjLumpsum(Math.round(summary.currentValue).toString());
      } else {
        setProjLumpsum(prev => (prev === '25000' ? '2500000' : prev));
      }
    } else {
      setProjContrib(prev => (prev === '25000' ? '2500' : prev));
      if (useCurrentPortfolio && summary) {
        setProjLumpsum(Math.round(summary.currentValue).toString());
      } else {
        setProjLumpsum(prev => (prev === '2500000' ? '25000' : prev));
      }
    }
  }, [marketContext, isIndia]);

  // Initialize lumpsum with current portfolio value if flag is set
  useEffect(() => {
    if (useCurrentPortfolio && summary) {
      setProjLumpsum(Math.round(summary.currentValue).toString());
    }
  }, [summary?.currentValue, useCurrentPortfolio]);

  const { chartData, totalInvested, projectedValue, estimatedGrowth, multiplier, lumpsumGrowth, sipGrowth, sipInvested } = useMemo(() => {
    const SIP = mode === 'LUMPSUM' ? 0 : (parseFloat(projContrib) || 0);
    const P = mode === 'SIP' ? 0 : (parseFloat(projLumpsum) || 0);
    
    let t = parseInt(projYears, 10) || 0;
    if (t < 1) t = 1;
    if (t > 50) t = 50;
    
    const annualReturn = (parseFloat(projReturn) || 0) / 100;
    const r = annualReturn / 12;

    const points = [];
    
    // Add year 0
    points.push({
      year: 0,
      label: `Year 0`,
      invested: P,
      projected: P,
    });

    for (let year = 1; year <= t; year++) {
      const currentMonths = year * 12;
      const currentSIPInvested = SIP * currentMonths;
      const currentTotalInvested = P + currentSIPInvested;
      
      // Calculate lumpsum future value at this year
      const currentLumpsumFV = P * Math.pow(1 + annualReturn, year);
      
      // Calculate SIP future value at this year
      const currentSipFV = r === 0 ? currentSIPInvested : SIP * ((Math.pow(1 + r, currentMonths) - 1) / r) * (1+r); // Adding * (1+r) assuming beginning of period (standard SIP) or without it for end of period. We'll stick to end of period standard: SIP * ((Math.pow(1 + r, currentMonths) - 1) / r)
      
      const sipFV_corrected = r === 0 ? currentSIPInvested : SIP * ((Math.pow(1 + r, currentMonths) - 1) / r);

      const projected = currentLumpsumFV + sipFV_corrected;
      
      points.push({
        year: year,
        label: `Year ${year}`,
        invested: currentTotalInvested,
        projected: projected,
        lumpsumFV: currentLumpsumFV,
        sipFV: sipFV_corrected,
        sipInvested: currentSIPInvested
      });
    }

    const finalPoint = points[points.length - 1];
    
    const finalTotalInvested = finalPoint.invested;
    const finalProjectedValue = finalPoint.projected;
    const finalEstimatedGrowth = finalProjectedValue - finalTotalInvested;
    
    const finalLumpsumFV = finalPoint.lumpsumFV || 0;
    const finalSipFV = finalPoint.sipFV || 0;
    const finalSipInvested = finalPoint.sipInvested || 0;
    
    const mult = finalTotalInvested > 0 ? (finalProjectedValue / finalTotalInvested) : 0;

    return { 
      chartData: points, 
      totalInvested: finalTotalInvested, 
      projectedValue: finalProjectedValue, 
      estimatedGrowth: finalEstimatedGrowth,
      multiplier: mult,
      lumpsumGrowth: finalLumpsumFV - P,
      sipGrowth: finalSipFV - finalSipInvested,
      sipInvested: finalSipInvested
    };
  }, [mode, projContrib, projLumpsum, projYears, projReturn]);

  const formatCurrency = (val: number, maxDigits = 2) => {
    return globalFormatCurrency(val, marketContext, {
      minimumFractionDigits: maxDigits === 0 ? 0 : 2,
      maximumFractionDigits: maxDigits,
    });
  };

  const formatCompactCurrency = (val: number) => {
    return globalFormatCompactCurrency(val, marketContext);
  };

  const formatYAxis = (tickItem: number) => {
    return formatCompactCurrency(tickItem);
  };

  const marketTransactions = useMemo(() => {
    return (profile.transactions || []).filter(t => {
      if (t.currency) return t.currency === currencySymbol;
      const isUSStock = ['AAPL', 'MSFT', 'NVDA', 'AMD', 'TSLA', 'AMZN', 'GOOGL', 'META', 'SPY', 'QQQ', 'VTI', 'VOO', 'IWM', 'BND'].includes(t.symbol?.toUpperCase());
      return marketContext === 'US' ? isUSStock : !isUSStock;
    });
  }, [profile.transactions, currencySymbol, marketContext]);

  return (
    <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 md:p-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4 border-b border-ui-border pb-4">
        <div>
          <h2 className="text-xl md:text-[28px] font-serif font-black text-text-main uppercase tracking-widest leading-none mb-1">Wealth Projection</h2>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Explore how your wealth can grow with SIP, Lumpsum or a combination of both.</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-text-muted uppercase tracking-widest bg-ui-bg px-2 py-1 rounded-lg border border-ui-border self-start">
          <span className="text-primary font-serif italic text-xs leading-none">i</span>
          Illustrative scenario. Actual returns may vary.
        </div>
      </div>

      <div className="flex bg-ui-bg p-1 rounded-xl border border-ui-border w-full md:w-max mb-5 overflow-x-auto custom-scrollbar h-[56px] items-center">
        {[
          { id: 'SIP', label: 'SIP', desc: 'Monthly investment' },
          { id: 'LUMPSUM', label: 'Lumpsum', desc: 'One-time investment' },
          { id: 'SIP_LUMPSUM', label: 'SIP + Lumpsum', desc: 'Use your current value + add SIP' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ProjectionMode)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[120px] transition-all whitespace-nowrap h-full ${
              mode === tab.id 
                ? 'bg-ui-surface border border-primary/30 shadow-md shadow-primary/5 relative' 
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface/50'
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${mode === tab.id ? 'text-primary' : ''}`}>
              {tab.label}
            </span>
            <span className={`text-[8px] font-bold tracking-widest uppercase ${mode === tab.id ? 'text-text-main' : 'text-text-muted/70'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-4">
        {/* Left Side: Chart, Summary, Breakdown */}
        <div className="flex-1 w-full xl:w-[68%] min-w-0 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-500/80" />
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Invested</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Projected Future Value</span>
              </div>
            </div>
            
            <div className="flex items-center bg-ui-bg border border-ui-border rounded-lg overflow-hidden h-8">
              {['5', '10', '15', '20', '25', '30'].map(yr => (
                <button
                  key={yr}
                  onClick={() => setProjYears(yr)}
                  className={`px-2.5 h-full text-[9px] font-bold uppercase tracking-wider transition-colors ${
                    projYears === yr ? 'bg-primary text-black' : 'text-text-muted hover:bg-ui-surface hover:text-text-main'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
              <div
                className={`px-2.5 h-full flex items-center justify-center text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  !['5', '10', '15', '20', '25', '30'].includes(projYears) ? 'bg-primary text-black' : 'text-text-muted'
                }`}
              >
                Custom
              </div>
            </div>
          </div>
          
          <div className="h-[280px] md:h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-ui-border)" opacity={0.5} />
                <XAxis 
                  dataKey="year" 
                  tickFormatter={(val) => `Yr ${val}`}
                  stroke="var(--color-ui-border)"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  stroke="var(--color-ui-border)"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const invested = data.invested as number;
                      const projected = data.projected as number;
                      const growth = projected - invested;
                      const P = mode === 'SIP' ? 0 : parseFloat(projLumpsum) || 0;
                      
                      return (
                        <div className="bg-ui-surface border border-ui-border rounded-lg shadow-xl p-3 min-w-[200px]">
                          <p className="text-[10px] text-primary font-bold mb-2 uppercase tracking-wider">Year {label}</p>
                          <div className="space-y-1.5">
                            {mode !== 'SIP' && (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                  Current Portfolio Growth
                                </span>
                                <span className="text-[10px] font-mono font-bold text-text-main">
                                  {formatCurrency(data.lumpsumFV || P, 0)}
                                </span>
                              </div>
                            )}
                            
                            {mode !== 'LUMPSUM' && (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                  SIP Contributions
                                </span>
                                <span className="text-[10px] font-mono font-bold text-text-main">
                                  {formatCurrency(data.sipInvested || 0, 0)}
                                </span>
                              </div>
                            )}
                            
                            <div className="h-px w-full bg-ui-border/50 my-1.5" />
                            
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[9px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500/80" /> Total Invested
                              </span>
                              <span className="text-[11px] font-mono font-bold text-text-main">
                                {formatCurrency(invested, 0)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-[9px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Projected Value
                              </span>
                              <span className="text-[11px] font-mono font-black text-primary">
                                {formatCurrency(projected, 0)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-3 pt-1">
                              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                Estimated Growth
                              </span>
                              <span className="text-xs font-mono font-bold text-positive">
                                +{formatCurrency(growth, 0)}
                              </span>
                            </div>
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
                  strokeWidth={2}
                  fillOpacity={0} 
                  activeDot={{ r: 6, fill: '#64748B', strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProjected)" 
                  activeDot={{ r: 6, fill: '#D4AF37', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Start Point Label */}
            {chartData.length > 0 && mode !== 'SIP' && (
              <div className="absolute left-[50px] bottom-[30px] flex flex-col items-start gap-1 pointer-events-none hidden sm:flex z-10">
                 <div className="bg-ui-surface/80 backdrop-blur-sm border border-ui-border px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap text-left">
                   <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Current Value</p>
                   <p className="text-[11px] font-mono font-bold text-text-main leading-none">{formatCompactCurrency(parseFloat(projLumpsum) || 0)}</p>
                 </div>
              </div>
            )}

            {/* End Point Labels */}
            {chartData.length > 0 && (
              <div className="absolute right-0 top-6 translate-x-2 md:translate-x-4 flex flex-col items-end gap-2 pointer-events-none hidden sm:flex z-10">
                 <div className="bg-primary/10 backdrop-blur-sm text-primary border border-primary/20 px-2.5 py-1.5 rounded-lg text-right shadow-sm whitespace-nowrap">
                   <p className="text-[8px] font-bold uppercase tracking-wider mb-0.5">Projected Value</p>
                   <p className="text-[11px] font-mono font-black leading-none">{formatCompactCurrency(projectedValue)}</p>
                 </div>
                 <div className="bg-slate-500/10 backdrop-blur-sm text-text-main border border-ui-border px-2.5 py-1.5 rounded-lg text-right shadow-sm whitespace-nowrap">
                   <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Invested</p>
                   <p className="text-[11px] font-mono font-bold leading-none">{formatCompactCurrency(totalInvested)}</p>
                 </div>
              </div>
            )}
            
          </div>

        </div>
        {/* UPPER RIGHT: Inputs */}
        <div className="w-full xl:w-[32%] shrink-0 flex flex-col gap-4">
          <div className="space-y-3 bg-ui-bg p-4 rounded-xl border border-ui-border">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 border-b border-ui-border/50 pb-1.5">Projection Details</h3>
            
            <AnimatePresence mode="popLayout">
              {mode !== 'SIP' && (
                <motion.div
                  key="lumpsum-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-1.5 mt-1">
                    <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                      {mode === 'SIP_LUMPSUM' ? 'Current Portfolio' : (isIndia ? 'Lumpsum Invest' : 'One-Time Investment')}
                    </label>
                  </div>
                  <div className="relative mb-2">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold text-[11px]">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={projLumpsum} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) {
                          setProjLumpsum(val);
                          if (useCurrentPortfolio) setUseCurrentPortfolio(false);
                        }
                      }} 
                      className="w-full bg-ui-surface border border-ui-border rounded-lg py-1.5 px-3 pl-6 text-right font-mono font-bold text-[11px] text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                      min="0"
                    />
                  </div>
                  {mode === 'SIP_LUMPSUM' && (
                    <div className="mt-1 flex flex-col gap-1">
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={useCurrentPortfolio} 
                          onChange={(e) => setUseCurrentPortfolio(e.target.checked)}
                          className="w-3 h-3 rounded border-ui-border text-primary focus:ring-primary bg-ui-surface"
                        />
                        <span className="text-[9px] font-bold text-text-main uppercase tracking-widest group-hover:text-primary transition-colors">
                          Use current value
                        </span>
                      </label>
                    </div>
                  )}
                </motion.div>
              )}

              {mode !== 'LUMPSUM' && (
                <motion.div
                  key="sip-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1.5 mt-1">
                    {isIndia ? 'Monthly SIP Amount' : 'Monthly Investment'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold text-[11px]">{currencySymbol}</span>
                    <input 
                      type="number" 
                      value={projContrib} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) setProjContrib(val);
                      }} 
                      className="w-full bg-ui-surface border border-ui-border rounded-lg py-1.5 px-3 pl-6 text-right font-mono font-bold text-[11px] text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                      min="0"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Time Horizon (Years)</label>
              <input 
                type="number" 
                value={projYears} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setProjYears('');
                    return;
                  }
                  let num = parseInt(val, 10);
                  if (isNaN(num)) return;
                  if (num > 50) setProjYears('50');
                  else if (num < 0) setProjYears('1');
                  else setProjYears(num.toString());
                }} 
                onBlur={() => {
                  if (!projYears || parseInt(projYears, 10) < 1) setProjYears('1');
                }}
                className="w-full bg-ui-surface border border-ui-border rounded-lg py-1.5 px-3 text-right font-mono font-bold text-[11px] text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                min="1" max="50" step="1"
              />
              <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase mt-1 text-right">Max 50 years</p>
            </div>
            
            <div className="mt-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Expected Return (p.a.)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={projReturn} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) setProjReturn(val);
                  }} 
                  className="w-full bg-ui-surface border border-ui-border rounded-lg py-1.5 px-3 pr-6 text-right font-mono font-bold text-[11px] text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                  min="0" max="100"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold text-[11px]">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* LOWER DASHBOARD */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* LOWER LEFT: Summary, Breakdown, Recent Activity */}
        <div className="flex-1 w-full xl:w-[68%] min-w-0 flex flex-col gap-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            <div className="bg-ui-bg p-3 rounded-xl border border-ui-border flex flex-col justify-between min-h-[75px]">
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Invested Amount</p>
                <p className="text-lg font-mono font-black text-text-main mb-0.5">{formatCurrency(totalInvested, 0)}</p>
              </div>
              <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase mt-1">
                {mode === 'SIP' ? 'SIP Contributions' : mode === 'LUMPSUM' ? 'Lumpsum Amount' : 'Starting Portfolio + SIP Contributions'}
              </p>
            </div>
            
            <div className="bg-ui-bg p-3 rounded-xl border border-ui-border flex flex-col justify-between min-h-[75px]">
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Estimated Growth</p>
                <p className="text-lg font-mono font-black text-positive mb-0.5">+{formatCurrency(estimatedGrowth, 0)}</p>
              </div>
              <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase mt-1">Approx.</p>
            </div>
            
            <div className="bg-ui-surface p-3 rounded-xl border border-primary/30 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[75px]">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Projected Future Value</p>
                <p className="text-lg font-mono font-black text-primary mb-0.5">{formatCurrency(projectedValue, 0)}</p>
              </div>
              <p className="text-[8px] text-primary/70 font-bold tracking-widest uppercase mt-1 relative z-10">Approx.</p>
            </div>
            
            <div className="bg-ui-bg p-3 rounded-xl border border-ui-border flex flex-col justify-between min-h-[75px]">
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Wealth Multiplier</p>
                <p className="text-lg font-mono font-black text-text-main mb-0.5">{multiplier.toFixed(1)}x</p>
              </div>
              <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase mt-1">Of your total investment</p>
            </div>
          </div>

          {/* Projection Breakdown */}
          <div className="mt-2 bg-ui-bg border border-ui-border rounded-xl p-3">
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-2">Projection Breakdown</p>
            
            {mode === 'SIP' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total SIP Contribs</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(sipInvested)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Estimated SIP Growth</p>
                  <p className="text-[11px] font-mono font-bold text-positive">+{formatCompactCurrency(sipGrowth)}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-[8px] font-bold text-primary uppercase tracking-wider mb-0.5">Projected Value</p>
                  <p className="text-[11px] font-mono font-bold text-primary">{formatCompactCurrency(projectedValue)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Invested</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(totalInvested)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Wealth Multiplier</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{multiplier.toFixed(1)}x</p>
                </div>
              </div>
            )}

            {mode === 'LUMPSUM' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Starting Lumpsum</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(parseFloat(projLumpsum) || 0)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Estimated Growth</p>
                  <p className="text-[11px] font-mono font-bold text-positive">+{formatCompactCurrency(lumpsumGrowth)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Invested</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(totalInvested)}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-[8px] font-bold text-primary uppercase tracking-wider mb-0.5">Projected Value</p>
                  <p className="text-[11px] font-mono font-bold text-primary">{formatCompactCurrency(projectedValue)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Wealth Multiplier</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{multiplier.toFixed(1)}x</p>
                </div>
              </div>
            )}

            {mode === 'SIP_LUMPSUM' && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Starting Portfolio</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(parseFloat(projLumpsum) || 0)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Portfolio Growth</p>
                  <p className="text-[11px] font-mono font-bold text-positive">+{formatCompactCurrency(lumpsumGrowth)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Total SIP Contribs</p>
                  <p className="text-[11px] font-mono font-bold text-text-main">{formatCompactCurrency(sipInvested)}</p>
                </div>
                <div className="p-2 bg-ui-surface rounded-lg border border-ui-border">
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Growth from SIP</p>
                  <p className="text-[11px] font-mono font-bold text-positive">+{formatCompactCurrency(sipGrowth)}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-[8px] font-bold text-primary uppercase tracking-wider mb-0.5">Projected Value</p>
                  <p className="text-[11px] font-mono font-bold text-primary">{formatCompactCurrency(projectedValue)}</p>
                </div>
              </div>
            )}
          </div>
          {/* Recent Activity */}
          <div className="bg-ui-bg border border-ui-border rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest">Recent Activity</h3>
              <button 
                onClick={() => navigate('transactions')}
                className="text-[9px] font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider">
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-2">
              {marketTransactions && marketTransactions.length > 0 ? (
                marketTransactions.slice(0, 3).map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-ui-surface border border-ui-border rounded-xl hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center shadow-sm shrink-0">
                        {activity.type === 'BUY' ? <ArrowUpRight size={16} className="text-primary" /> : <TrendingUp size={16} className="text-positive" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-main truncate capitalize">{activity.type.toLowerCase()} {activity.symbol}</p>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-0.5 truncate">
                          {activity.type === 'BUY' ? 'Investment' : 'Withdrawal'} • {new Date(activity.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className={`text-sm font-mono font-bold ${activity.type === 'SELL' ? 'text-positive' : 'text-text-main'}`}>
                        {activity.type === 'SELL' ? '+' : ''}{formatCurrency(activity.shares * activity.price, 2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-2">No recent activity</p>
                  <p className="text-[9px] text-text-muted/60 mb-3 max-w-[200px] mx-auto">Your latest investments and transactions will appear here.</p>
                  <button onClick={() => navigate('transactions')} className="text-[9px] bg-ui-surface border border-ui-border py-1.5 px-3 rounded-lg text-text-main font-bold uppercase tracking-wider hover:text-primary transition-colors">
                    View Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* LOWER RIGHT: Value, Insights, Quick Actions */}
        <div className="w-full xl:w-[32%] shrink-0 flex flex-col gap-4">

          <div className="bg-ui-surface border border-primary/30 rounded-xl p-4 text-center shadow-[0_4px_20px_rgba(212,175,55,0.1)] relative overflow-hidden group flex-1 flex flex-col justify-center min-h-[100px]">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mb-1.5 relative z-10">Projected Future Value</p>
            <p className="text-2xl lg:text-3xl font-mono font-black text-primary tracking-tight relative z-10 mb-2">
              {formatCompactCurrency(projectedValue)}
            </p>
            <div className="flex items-center justify-center gap-1 text-positive font-bold text-[10px] uppercase tracking-wider relative z-10 bg-positive/10 w-max mx-auto px-2 py-0.5 rounded-full border border-positive/20">
              <span className="text-sm leading-none">↑</span> {multiplier.toFixed(1)}x <span className="text-[8px]">your investment</span>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Info size={12} /> Key Insights
            </h3>
            <div className="space-y-2">
              <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                <p className="text-[9px] text-text-main font-medium leading-relaxed">
                  Projected value: <span className="font-mono font-bold text-primary">{formatCompactCurrency(projectedValue)}</span> after {projYears} years.
                </p>
              </div>
              {mode !== 'LUMPSUM' && (
                <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 shrink-0" />
                  <p className="text-[9px] text-text-main font-medium leading-relaxed">
                    SIP contributions: <span className="font-mono font-bold">{formatCompactCurrency(sipInvested)}</span> over {projYears} years.
                  </p>
                </div>
              )}
              <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-positive mt-1 shrink-0" />
                <p className="text-[9px] text-text-main font-medium leading-relaxed">
                  Estimated growth: <span className="font-mono font-bold text-positive">{formatCompactCurrency(estimatedGrowth)}</span>.
                </p>
              </div>
              {mode === 'SIP_LUMPSUM' && (
                <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 shrink-0" />
                  <p className="text-[9px] text-text-main font-medium leading-relaxed">
                    Starting portfolio growth: <span className="font-mono font-bold">{formatCompactCurrency(lumpsumGrowth)}</span>.
                  </p>
                </div>
              )}
              {mode === 'LUMPSUM' && (
                <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 shrink-0" />
                  <p className="text-[9px] text-text-main font-medium leading-relaxed">
                    Starting lumpsum: <span className="font-mono font-bold">{formatCompactCurrency(parseFloat(projLumpsum) || 0)}</span>.
                  </p>
                </div>
              )}
              <div className="bg-ui-surface p-2.5 rounded-lg border border-ui-border flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1 shrink-0" />
                <p className="text-[9px] text-text-main font-medium leading-relaxed">
                  Wealth multiplier: <span className="font-bold">{multiplier.toFixed(1)}x</span> of total invested amount.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-ui-surface border border-ui-border rounded-xl p-4 shadow-sm">
            <h3 className="text-[10px] font-bold text-text-main uppercase tracking-widest mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              <button className="bg-primary hover:bg-primary-hover text-black font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <TrendingUp size={14} />
                Invest
              </button>
              <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <ArrowUpRight size={14} className="text-positive" />
                Add Money
              </button>
              <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <Target size={14} className="text-primary" />
                Goal
              </button>
              <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <PieChartIcon size={14} className="text-blue-500" />
                Portfolio
              </button>
              <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <Search size={14} className="text-text-muted" />
                Explore
              </button>
              <button className="bg-ui-bg hover:bg-ui-surface-hover text-text-main border border-ui-border font-bold py-2.5 px-2 rounded-lg text-[8px] transition-colors uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <ArrowLeft size={14} className="text-text-muted" />
                History
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[8px] text-text-muted font-bold tracking-widest uppercase mt-6 text-center max-w-2xl mx-auto leading-relaxed">
        This is an illustrative projection based on the return assumption you entered. Actual investment returns may vary based on market conditions. Projected returns are not guaranteed.
      </p>
    </div>
  );
};
