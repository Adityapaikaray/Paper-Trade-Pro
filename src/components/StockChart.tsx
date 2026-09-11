/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import { Stock } from '../types.ts';
import axios from 'axios';

interface StockChartProps {
  stock: Stock;
  height?: number;
  showDetails?: boolean;
  showTimeframes?: boolean;
}

interface ChartPoint {
  time: string;
  price: number;
  timestamp: number;
}

export const StockChart: React.FC<StockChartProps> = ({
  stock,
  height = 220,
  showDetails = true,
  showTimeframes = false
}) => {
  const [selectedRange, setSelectedRange] = useState<'1d' | '5d' | '1mo' | '1y'>('1d');
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const lastPrice = useRef(stock.price);

  // Initialize data from stock.history or generate sensible points
  useEffect(() => {
    if (selectedRange === '1d') {
      if (Array.isArray(stock.history) && stock.history.length > 0) {
        const points = stock.history.map((pt, i) => ({
          time: pt.time,
          price: pt.price,
          timestamp: Date.now() - (stock.history!.length - i) * 60000
        }));
        setHistory(points);
      } else {
        // Fallback: 30 point walk anchored to prevClose / price
        const points = 30;
        const initial: ChartPoint[] = [];
        const base = stock.prevClose || stock.price;
        const delta = stock.price - base;
        
        for (let i = points; i >= 0; i--) {
          const t = new Date(Date.now() - i * 60000);
          const ratio = (points - i) / points;
          const noise = (Math.random() - 0.48) * (stock.price * 0.003);
          const p = Number((base + delta * ratio + noise).toFixed(2));
          initial.push({
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: i === 0 ? stock.price : p,
            timestamp: t.getTime()
          });
        }
        setHistory(initial);
      }
    }
  }, [stock.symbol, stock.history, selectedRange]);

  // Append new real-time price updates dynamically
  useEffect(() => {
    if (selectedRange === '1d' && stock.price !== lastPrice.current) {
      lastPrice.current = stock.price;
      const now = new Date();
      const newPoint: ChartPoint = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: stock.price,
        timestamp: now.getTime()
      };
      setHistory(prev => {
        const next = [...prev, newPoint];
        return next.slice(-100);
      });
    }
  }, [stock.price, selectedRange]);

  // Fetch higher timeframes on demand
  const handleRangeChange = async (range: '1d' | '5d' | '1mo' | '1y') => {
    setSelectedRange(range);
    if (range === '1d') return; // Handled by standard live feed

    setIsLoadingRange(true);
    try {
      const res = await axios.get(`/api/chart/${encodeURIComponent(stock.symbol)}?range=${range}`);
      if (res.data?.points && Array.isArray(res.data.points)) {
        setHistory(res.data.points);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingRange(false);
    }
  };

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive ? '#34d399' : '#f87171'; // emerald-400 : rose-400
  const gradientId = `stockGradient-${stock.symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  if (!showDetails) {
    // Ultra-lightweight sparkline
    return (
      <div style={{ width: '100%', height: '40px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const prices = history.map(h => h.price).filter(p => typeof p === 'number' && !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.998 : 'auto';
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.002 : 'auto';

  return (
    <div className="w-full flex flex-col justify-between" style={{ height }}>
      {showTimeframes && (
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-text-muted uppercase tracking-wider">
              Timeframe:
            </span>
            <div className="flex items-center gap-1 bg-ui-bg p-1 rounded-xl border border-ui-border">
              {(['1d', '5d', '1mo', '1y'] as const).map(rng => (
                <button
                  key={rng}
                  onClick={() => handleRangeChange(rng)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                    selectedRange === rng
                      ? 'bg-primary text-ui-bg font-black shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {rng === '1mo' ? '1M' : rng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {isLoadingRange && (
            <span className="text-[9px] font-mono text-primary animate-pulse">
              Streaming candles...
            </span>
          )}
        </div>
      )}

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-border)" opacity={0.5} />
            <XAxis
              dataKey="time"
              hide={history.length < 15}
              stroke="var(--text-muted)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              hide={false}
              orientation="right"
              stroke="var(--text-muted)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${stock.currency}${v.toFixed(1)}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--ui-bg)',
                border: '1px solid rgba(197, 160, 89, 0.25)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                fontWeight: '800',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                padding: '8px 12px'
              }}
              formatter={(value: number) => [
                `${stock.currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                'Price'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            {stock.prevClose && (
              <ReferenceLine
                y={stock.prevClose}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                opacity={0.4}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              animationDuration={500}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
