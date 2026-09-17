with open('src/components/FutureWealthProjection.tsx', 'r') as f:
    content = f.read()

# Let's replace the whole file since we need to add a lot of logic
new_content = """import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectionMode = 'SIP' | 'LUMPSUM' | 'SIP_LUMPSUM';

export const FutureWealthProjection: React.FC = () => {
  const { summary } = usePortfolio();
  
  const [mode, setMode] = useState<ProjectionMode>('SIP_LUMPSUM');
  
  const [projContrib, setProjContrib] = useState('25000');
  const [projLumpsum, setProjLumpsum] = useState('0');
  const [projYears, setProjYears] = useState('15');
  const [projReturn, setProjReturn] = useState('13');
  const [useCurrentPortfolio, setUseCurrentPortfolio] = useState(true);

  // Initialize lumpsum with current portfolio value if flag is set
  useEffect(() => {
    if (useCurrentPortfolio && summary) {
      setProjLumpsum(Math.round(summary.currentValue).toString());
    }
  }, [summary, useCurrentPortfolio]);

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
    return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: maxDigits })}`;
  };

  const formatCompactCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(2)}K`;
    return `₹${val.toFixed(2)}`;
  };

  const formatYAxis = (tickItem: number) => {
    return formatCompactCurrency(tickItem);
  };

  return (
    <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-10 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 border-b border-ui-border pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-text-main uppercase tracking-widest leading-none mb-2">Wealth Projection</h2>
          <p className="text-sm font-bold text-text-muted uppercase tracking-wider">Explore how your wealth can grow with SIP, Lumpsum or a combination of both.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-ui-bg px-3 py-1.5 rounded-full border border-ui-border self-start">
          <span className="text-primary font-serif italic text-sm leading-none">i</span>
          Illustrative scenario. Actual investment returns may vary.
        </div>
      </div>

      <div className="flex bg-ui-bg p-1.5 rounded-xl border border-ui-border w-full md:w-max mb-8 overflow-x-auto custom-scrollbar">
        {[
          { id: 'SIP', label: 'SIP', desc: 'Monthly investment' },
          { id: 'LUMPSUM', label: 'Lumpsum', desc: 'One-time investment' },
          { id: 'SIP_LUMPSUM', label: 'SIP + Lumpsum', desc: 'Use your current value + add SIP' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ProjectionMode)}
            className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg min-w-[140px] transition-all whitespace-nowrap ${
              mode === tab.id 
                ? 'bg-ui-surface border border-primary/30 shadow-md shadow-primary/5 relative' 
                : 'text-text-muted hover:text-text-main hover:bg-ui-surface/50'
            }`}
          >
            <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${mode === tab.id ? 'text-primary' : ''}`}>
              {tab.label}
            </span>
            <span className={`text-[9px] font-bold tracking-widest uppercase ${mode === tab.id ? 'text-text-main' : 'text-text-muted/70'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Left Side: Chart */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500/80" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Invested</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Projected Future Value</span>
              </div>
            </div>
            
            <div className="flex items-center bg-ui-bg border border-ui-border rounded-lg overflow-hidden">
              {['5', '10', '15', '20', '25', '30'].map(yr => (
                <button
                  key={yr}
                  onClick={() => setProjYears(yr)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    projYears === yr ? 'bg-primary text-black' : 'text-text-muted hover:bg-ui-surface hover:text-text-main'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[300px] md:h-[400px] w-full relative">
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
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  stroke="var(--color-ui-border)"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 'bold' }}
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
                        <div className="bg-ui-surface border border-ui-border rounded-xl shadow-xl p-4 min-w-[240px]">
                          <p className="text-xs text-primary font-bold mb-3 uppercase tracking-wider">Year {label}</p>
                          <div className="space-y-2">
                            {mode !== 'SIP' && (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                  Starting Wealth
                                </span>
                                <span className="text-xs font-mono font-bold text-text-main">
                                  {formatCurrency(P, 0)}
                                </span>
                              </div>
                            )}
                            
                            {mode !== 'LUMPSUM' && (
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                  SIP Contributions
                                </span>
                                <span className="text-xs font-mono font-bold text-text-main">
                                  {formatCurrency(data.sipInvested || 0, 0)}
                                </span>
                              </div>
                            )}
                            
                            <div className="h-px w-full bg-ui-border/50 my-2" />
                            
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[11px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-slate-500/80" /> Total Invested
                              </span>
                              <span className="text-sm font-mono font-bold text-text-main">
                                {formatCurrency(invested, 0)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-[11px] text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                <div className="w-2 h-2 rounded-full bg-primary" /> Projected Value
                              </span>
                              <span className="text-sm font-mono font-black text-primary">
                                {formatCurrency(projected, 0)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4 pt-1">
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
            
            {/* End Point Labels */}
            {chartData.length > 0 && (
              <div className="absolute right-0 top-0 translate-x-4 md:translate-x-8 -translate-y-4 flex flex-col items-end gap-1 pointer-events-none hidden sm:flex">
                 <div className="bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-md text-[10px] font-mono font-bold shadow-sm whitespace-nowrap">
                   {formatCompactCurrency(projectedValue)}
                 </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Side: Inputs & Value */}
        <div className="w-full xl:w-80 shrink-0 flex flex-col gap-6">
          <div className="space-y-4 bg-ui-bg p-5 rounded-2xl border border-ui-border">
            
            <AnimatePresence mode="popLayout">
              {mode !== 'SIP' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      {mode === 'SIP_LUMPSUM' ? 'Current Portfolio Value' : 'Lumpsum Investment'}
                    </label>
                  </div>
                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">₹</span>
                    <input 
                      type="number" 
                      value={projLumpsum} 
                      onChange={e => setProjLumpsum(e.target.value)} 
                      disabled={useCurrentPortfolio && mode === 'SIP_LUMPSUM'}
                      className="w-full bg-ui-surface border border-ui-border rounded-xl p-3 pl-8 text-right font-mono font-bold text-text-main focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50" 
                    />
                  </div>
                  {mode === 'SIP_LUMPSUM' && (
                    <label className="flex items-center gap-2 cursor-pointer mt-2 group">
                      <input 
                        type="checkbox" 
                        checked={useCurrentPortfolio} 
                        onChange={(e) => setUseCurrentPortfolio(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-ui-border text-primary focus:ring-primary bg-ui-surface"
                      />
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest group-hover:text-text-main transition-colors">
                        Use current portfolio value
                      </span>
                    </label>
                  )}
                </motion.div>
              )}

              {mode !== 'LUMPSUM' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">Monthly SIP Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">₹</span>
                    <input 
                      type="number" 
                      value={projContrib} 
                      onChange={e => setProjContrib(e.target.value)} 
                      className="w-full bg-ui-surface border border-ui-border rounded-xl p-3 pl-8 text-right font-mono font-bold text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">Time Horizon (Years)</label>
              <input 
                type="number" 
                value={projYears} 
                onChange={e => setProjYears(e.target.value)} 
                className="w-full bg-ui-surface border border-ui-border rounded-xl p-3 text-right font-mono font-bold text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                min="1" max="50"
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">Expected Return (p.a.)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={projReturn} 
                  onChange={e => setProjReturn(e.target.value)} 
                  className="w-full bg-ui-surface border border-ui-border rounded-xl p-3 pr-8 text-right font-mono font-bold text-text-main focus:outline-none focus:border-primary/50 transition-colors" 
                  min="0" max="30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="bg-ui-surface border border-primary/30 rounded-2xl p-6 text-center shadow-[0_4px_20px_rgba(212,175,55,0.1)] relative overflow-hidden group flex-1 flex flex-col justify-center">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 relative z-10">Projected Future Value</p>
            <p className="text-4xl lg:text-5xl font-mono font-black text-primary tracking-tight relative z-10 mb-3">
              {formatCompactCurrency(projectedValue)}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-positive font-bold text-xs uppercase tracking-wider relative z-10 bg-positive/10 w-max mx-auto px-3 py-1 rounded-full border border-positive/20">
              <span className="text-lg leading-none">↑</span> {multiplier.toFixed(1)}x <span className="text-[9px]">your investment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 pt-8 border-t border-ui-border">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-ui-bg p-5 rounded-2xl border border-ui-border flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Total Invested</p>
              <p className="text-xl md:text-2xl font-mono font-black text-text-main mb-1">{formatCurrency(totalInvested, 0)}</p>
            </div>
            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-3">
              {mode === 'SIP' ? 'SIP Contributions' : mode === 'LUMPSUM' ? 'Lumpsum Amount' : 'Starting Portfolio + SIP'}
            </p>
          </div>
          
          <div className="bg-ui-bg p-5 rounded-2xl border border-ui-border flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Estimated Growth</p>
              <p className="text-xl md:text-2xl font-mono font-black text-positive mb-1">+{formatCurrency(estimatedGrowth, 0)}</p>
            </div>
            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-3">(Approx.)</p>
          </div>
          
          <div className="bg-ui-surface p-5 rounded-2xl border border-primary/30 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Projected Value</p>
              <p className="text-xl md:text-2xl font-mono font-black text-primary mb-1">{formatCurrency(projectedValue, 0)}</p>
            </div>
            <p className="text-[9px] text-primary/70 font-bold tracking-widest uppercase mt-3 relative z-10">(Approx.)</p>
          </div>
          
          <div className="bg-ui-bg p-5 rounded-2xl border border-ui-border flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Wealth Multiplier</p>
              <p className="text-xl md:text-2xl font-mono font-black text-text-main mb-1">{multiplier.toFixed(1)}x</p>
            </div>
            <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-3">Of your total investment</p>
          </div>
        </div>
      </div>

      {/* SIP + Lumpsum Breakdown */}
      {mode === 'SIP_LUMPSUM' && (
        <div className="mt-6 pt-6 border-t border-ui-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Value Breakdown</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-ui-surface rounded-xl border border-ui-border">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Starting Wealth</p>
              <p className="text-sm font-mono font-bold text-text-main">{formatCompactCurrency(parseFloat(projLumpsum) || 0)}</p>
            </div>
            <div className="p-3 bg-ui-surface rounded-xl border border-ui-border">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Growth of Starting</p>
              <p className="text-sm font-mono font-bold text-positive">+{formatCompactCurrency(lumpsumGrowth)}</p>
            </div>
            <div className="p-3 bg-ui-surface rounded-xl border border-ui-border">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Total SIP Contrib.</p>
              <p className="text-sm font-mono font-bold text-text-main">{formatCompactCurrency(sipInvested)}</p>
            </div>
            <div className="p-3 bg-ui-surface rounded-xl border border-ui-border">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Growth from SIP</p>
              <p className="text-sm font-mono font-bold text-positive">+{formatCompactCurrency(sipGrowth)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1">Projected Future</p>
              <p className="text-sm font-mono font-bold text-primary">{formatCompactCurrency(projectedValue)}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[9px] text-text-muted font-bold tracking-widest uppercase mt-8 text-center max-w-2xl mx-auto leading-relaxed">
        This is an illustrative projection based on the return assumption you entered. Actual investment returns may vary based on market conditions. Projected returns are not guaranteed.
      </p>
    </div>
  );
};
"""

with open('src/components/FutureWealthProjection.tsx', 'w') as f:
    f.write(new_content)
    
print("Success")
