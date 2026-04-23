/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
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
} from 'recharts';
import { Stock } from '../types.ts';

interface StockChartProps {
  stock: Stock;
  height?: number;
  showDetails?: boolean;
}

const StockChart: React.FC<StockChartProps> = ({ stock, height = 200, showDetails = true }) => {
  const [history, setHistory] = useState<{ time: string; price: number; timestamp: number }[]>([]);
  const lastPrice = useRef(stock.price);

  // Initialize and update history
  useEffect(() => {
    // If history is empty, generate initial mock history
    if (history.length === 0) {
      const points = 30;
      const initialHistory = [];
      const currentPrice = stock.price;
      const volatility = 0.01;
      
      let prevPrice = currentPrice;
      for (let i = points; i >= 0; i--) {
        const time = new Date(Date.now() - i * 2000);
        // Random walk backwards
        const change = (Math.random() - 0.5) * 2 * (prevPrice * volatility);
        const price = prevPrice - (i === 0 ? 0 : change);
        
        initialHistory.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: parseFloat(price.toFixed(2)),
          timestamp: time.getTime()
        });
        prevPrice = price;
      }
      setHistory(initialHistory);
    } else if (stock.price !== lastPrice.current) {
      // Append new price point
      const now = new Date();
      const newPoint = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        price: stock.price,
        timestamp: now.getTime()
      };
      
      setHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep last 50 points for performance
        if (updated.length > 50) return updated.slice(updated.length - 50);
        return updated;
      });
      lastPrice.current = stock.price;
    }
  }, [stock.price, stock.symbol]);

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 : rose-500
  const fillColor = isPositive ? '#10b98120' : '#f43f5e20';

  if (!showDetails) {
    // Mini sparkline for table
    return (
      <div style={{ width: '120px', height: '40px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorPrice-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
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
              fontSize: '10px',
              fontWeight: 'bold',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: '#F8FAFC' }}
            formatter={(value: number) => [`${stock.currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Price']}
            labelStyle={{ display: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#colorPrice-${stock.symbol})`}
            animationDuration={300}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
