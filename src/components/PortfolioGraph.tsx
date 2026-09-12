/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { HistoryPoint } from '../types.ts';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface PortfolioGraphProps {
  history: HistoryPoint[];
  currentValue?: number; // In USD
  currencySymbol?: string;
  currencyRate?: number;
  baseline?: number; // In USD
  premiumMode?: boolean;
}

const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ history, currentValue, currencySymbol = '$', currencyRate = 1, baseline = 112000, premiumMode = false }) => {
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'ALL'>('ALL');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [now, setNow] = useState(Date.now());

  // Force a re-render every second to keep the "live" point moving on the x-axis
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredData = useMemo(() => {
    let data = [...history];
    
    // Add real-time point if provided
    if (currentValue !== undefined) {
      data.push({ timestamp: now, value: currentValue });
    }

    if (data.length === 0) return [];
    
    const currentTime = Date.now();
    let cutoff = 0;
    
    switch (timeRange) {
      case '1m': cutoff = currentTime - 60 * 1000; break;
      case '5m': cutoff = currentTime - 5 * 60 * 1000; break;
      case '15m': cutoff = currentTime - 15 * 60 * 1000; break;
      case 'ALL': cutoff = 0; break;
    }
    
    return data
      .filter(p => p.timestamp >= cutoff)
      .map(p => ({
        time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: parseFloat((p.value * currencyRate).toFixed(2)),
        timestamp: p.timestamp,
        raw: p.value
      }));
  }, [history, timeRange, currencyRate, currentValue, now]);

  const { minVal, maxVal, gradientOffset } = useMemo(() => {
    if (filteredData.length === 0) return { minVal: 0, maxVal: 0, gradientOffset: 0 };
    const values = filteredData.map(d => d.value);
    const min = Math.min(...values, baseline * currencyRate);
    const max = Math.max(...values, baseline * currencyRate);
    
    if (max === min) return { minVal: min, maxVal: max, gradientOffset: 0 };
    
    // Calculate color transition point (baseline) as a percentage of total height
    const offset = (max - (baseline * currencyRate)) / (max - min);
    return { minVal: min, maxVal: max, gradientOffset: offset };
  }, [filteredData, baseline, currencyRate]);

  if (filteredData.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-ui-surface rounded-3xl border border-dashed border-ui-border">
        <p className="text-xs font-black text-text-muted uppercase tracking-widest">Collecting Market Intel...</p>
        <p className="text-[10px] text-text-muted mt-2">Graph will populate shortly</p>
      </div>
    );
  }

  const latestValue = filteredData[filteredData.length - 1].value;
  const isPositive = latestValue >= (baseline * currencyRate);
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className={`space-y-6 ${premiumMode ? 'h-full w-full' : ''}`}>
      {!premiumMode && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['1m', '5m', '15m', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range 
                    ? 'bg-primary text-ui-bg shadow-lg shadow-primary/20 scale-105' 
                    : 'text-text-muted hover:bg-ui-surface'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Live Portfolio Performance</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <p className={`text-lg font-mono font-black italic ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {currencySymbol}{latestValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
      <div className={`${premiumMode ? 'h-[360px]' : 'h-80'} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: premiumMode ? 40 : 10, left: 0, bottom: 0 }}>
            <defs>
              {premiumMode ? (
                <>
                  <linearGradient id="premiumColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#00D084" : "#00A878"} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isDark ? "#00D084" : "#00A878"} stopOpacity={0.0} />
                  </linearGradient>
                </>
              ) : (
                <>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="splitColorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset={gradientOffset} stopColor="#f43f5e" stopOpacity={0.2} />
                  </linearGradient>
                </>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-border)" opacity={0.5} />
            <XAxis 
              dataKey="time" 
              fontSize={10}
              tickMargin={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontWeight: premiumMode ? '600' : 'bold' }}
              minTickGap={30}
            />
            <YAxis 
              orientation="right"
              domain={[minVal, maxVal]} 
              hide={!premiumMode} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
              tickMargin={10}
              tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(1)}K`}
            />
            
            {premiumMode ? (
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const currentVal = payload[0].value as number;
                    const pctChange = ((currentVal / (baseline * currencyRate)) - 1) * 100;
                    const isUp = pctChange >= 0;
                    return (
                      <div className="bg-ui-surface rounded-xl p-3 shadow-xl border border-primary flex flex-col gap-1 relative overflow-hidden">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-[15px] font-mono font-bold text-text-main">
                            {currencySymbol}{currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className={`text-[11px] font-mono font-bold ${isUp ? 'text-positive' : 'text-rose-500'}`}>
                            {isUp ? '+' : ''}{pctChange.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-text-main/50 uppercase tracking-widest">{label}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-positive blur-xl opacity-20 rounded-full" />
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: isDark ? '#00D084' : '#00A878', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
            ) : (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--ui-surface)',
                  border: '1px solid var(--ui-border)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
                itemStyle={{ color: 'var(--text-main)' }}
                labelStyle={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '900' }}
                formatter={(value: number) => [
                  <span className={value >= (baseline * currencyRate) ? 'text-emerald-400' : 'text-rose-400'}>
                    {currencySymbol}{value.toLocaleString()}
                  </span>, 
                  'Live Valuation'
                ]}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={premiumMode ? (isDark ? "#00D084" : "#00A878") : "url(#splitColor)"}
              strokeWidth={premiumMode ? 2.5 : 4}
              fillOpacity={1}
              fill={premiumMode ? "url(#premiumColor)" : "url(#splitColorFill)"}
              animationDuration={1000}
              isAnimationActive={true}
              baseLine={baseline * currencyRate}
              activeDot={premiumMode ? { r: 6, fill: isDark ? '#00D084' : '#00A878', stroke: isDark ? '#FFFFFF' : '#0B1728', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(0,168,120,0.8))' } } : true}
            />
            
            {!premiumMode && (
              <Brush 
                dataKey="time" 
                height={30} 
                stroke="var(--primary)" 
                fill="var(--ui-bg)"
                travellerWidth={10}
                gap={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioGraph;
