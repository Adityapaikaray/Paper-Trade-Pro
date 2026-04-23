/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HistoryPoint } from '../types.ts';
import { motion } from 'framer-motion';

interface PortfolioGraphProps {
  history: HistoryPoint[];
  currentValue?: number; // In USD
  currencySymbol?: string;
  currencyRate?: number;
}

const PortfolioGraph: React.FC<PortfolioGraphProps> = ({ history, currentValue, currencySymbol = '$', currencyRate = 1 }) => {
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'ALL'>('ALL');
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
    
    const now = Date.now();
    let cutoff = 0;
    
    switch (timeRange) {
      case '1m': cutoff = now - 60 * 1000; break;
      case '5m': cutoff = now - 5 * 60 * 1000; break;
      case '15m': cutoff = now - 15 * 60 * 1000; break;
      case 'ALL': cutoff = 0; break;
    }
    
    return data
      .filter(p => p.timestamp >= cutoff)
      .map(p => ({
        time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: parseFloat((p.value * currencyRate).toFixed(2)),
        timestamp: p.timestamp
      }));
  }, [history, timeRange, currencyRate]);

  if (filteredData.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Collecting Market Intel...</p>
        <p className="text-[10px] text-slate-300 mt-2">Graph will populate shortly</p>
      </div>
    );
  }

  const isPositive = filteredData.length > 1 && filteredData[filteredData.length - 1].value >= filteredData[0].value;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['1m', '5m', '15m', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeRange === range 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-3">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-Time Valuation</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-lg font-mono font-black italic text-indigo-950">
                    {currencySymbol}{(currentValue ? currentValue * currencyRate : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              hide={true} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E293B',
                border: 'none',
                borderRadius: '12px',
                color: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Portfolio Value']}
              labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorPortfolio)"
              animationDuration={300}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioGraph;
