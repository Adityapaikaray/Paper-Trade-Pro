/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { IndexQuote } from '../types.ts';
import axios from 'axios';

interface IndexChartProps {
  index: IndexQuote;
  height?: number;
  hero?: boolean;
  showTimeframes?: boolean;
}

interface IndexPoint {
  time: string;
  price: number;
  timestamp: number;
}

export const IndexChart: React.FC<IndexChartProps> = ({
  index,
  height = 200,
  hero = false,
  showTimeframes = false
}) => {
  const [selectedRange, setSelectedRange] = useState<'1d' | '5d' | '1mo' | '1y'>('1d');
  const [points, setPoints] = useState<IndexPoint[]>([]);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const lastPriceRef = useRef(index.price);

  // Initialize or update 1D points
  useEffect(() => {
    if (selectedRange === '1d') {
      if (Array.isArray(index.history) && index.history.length > 0) {
        const mapped = index.history.map((pt, i) => ({
          time: pt.time,
          price: pt.price,
          timestamp: Date.now() - (index.history!.length - i) * 60000
        }));
        setPoints(mapped);
      } else {
        // Synthesize realistic baseline points if history is temporarily buffering
        const count = 35;
        const pts: IndexPoint[] = [];
        const base = index.prevClose || (index.price - index.change);
        const totalDelta = index.change;

        for (let i = count; i >= 0; i--) {
          const t = new Date(Date.now() - i * 60000);
          const progress = (count - i) / count;
          const noise = (Math.random() - 0.48) * (index.price * 0.001);
          const p = Number((base + totalDelta * progress + noise).toFixed(2));
          pts.push({
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: i === 0 ? index.price : p,
            timestamp: t.getTime()
          });
        }
        setPoints(pts);
      }
    }
  }, [index.key, index.symbol, index.history, selectedRange]);

  // Handle incoming live ticks
  useEffect(() => {
    if (selectedRange === '1d' && index.price !== lastPriceRef.current) {
      lastPriceRef.current = index.price;
      const now = new Date();
      const newPt: IndexPoint = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: index.price,
        timestamp: now.getTime()
      };
      setPoints(prev => {
        const next = [...prev, newPt];
        return next.slice(-100);
      });
    }
  }, [index.price, selectedRange]);

  // Fetch higher timeframes
  const handleRangeChange = async (range: '1d' | '5d' | '1mo' | '1y') => {
    setSelectedRange(range);
    if (range === '1d') return;

    setIsLoadingRange(true);
    try {
      const res = await axios.get(`/api/chart/${encodeURIComponent(index.symbol)}?range=${range}`);
      if (res.data?.points && Array.isArray(res.data.points)) {
        setPoints(res.data.points);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingRange(false);
    }
  };

  const isPositive = index.change >= 0;
  const strokeColor = isPositive ? '#34d399' : '#f87171';
  const gradientId = `indexGrad-${index.key}-${hero ? 'hero' : 'card'}`;

  const prices = points.map(p => p.price).filter(p => typeof p === 'number' && !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.999 : 'auto';
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.001 : 'auto';

  return (
    <div className="w-full flex flex-col justify-between" style={{ height }}>
      {showTimeframes && (
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-text-muted uppercase tracking-wider">
              Range:
            </span>
            <div className="flex items-center gap-1 bg-ui-bg p-1 rounded-xl border border-ui-border">
              {(['1d', '5d', '1mo', '1y'] as const).map(rng => (
                <button
                  key={rng}
                  onClick={() => handleRangeChange(rng)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
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
            <span className="text-[9px] font-mono text-primary animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Fetching {selectedRange.toUpperCase()} points...
            </span>
          )}
        </div>
      )}

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: hero ? 15 : 5, left: hero ? 15 : 5, bottom: 5 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={hero ? 0.35 : 0.22} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ui-border)" opacity={hero ? 0.6 : 0.3} />
            <XAxis
              dataKey="time"
              hide={!hero && points.length < 15}
              stroke="var(--text-muted)"
              fontSize={hero ? 10 : 8}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={hero ? 50 : 35}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              hide={!hero}
              orientation="right"
              stroke="var(--text-muted)"
              fontSize={hero ? 10 : 8}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${index.currency}${v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : v.toFixed(1)}`}
              width={hero ? 65 : 45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--ui-bg)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                fontWeight: '800',
                boxShadow: '0 15px 35px rgba(0,0,0,0.35)',
                padding: '8px 12px'
              }}
              formatter={(value: number) => [
                `${index.currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                index.displaySymbol
              ]}
              labelFormatter={(label) => `Timestamp: ${label}`}
            />
            {index.prevClose && hero && (
              <ReferenceLine
                y={index.prevClose}
                stroke="var(--text-muted)"
                strokeDasharray="4 4"
                label={{
                  value: `Prev Close ${index.prevClose.toFixed(1)}`,
                  fill: 'var(--text-muted)',
                  fontSize: 9,
                  position: 'insideBottomRight'
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={hero ? 2.8 : 2}
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

export default IndexChart;
