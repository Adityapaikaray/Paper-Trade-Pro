/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
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
  // Generate mock historical data based on current price and change
  const data = useMemo(() => {
    const points = 24;
    const history = [];
    const currentPrice = stock.price;
    const changeAmount = (stock.change / 100) * currentPrice;
    const startPrice = currentPrice - changeAmount;
    
    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      // Slighly randomized path from startPrice to currentPrice
      const randomFactor = (Math.random() - 0.5) * (changeAmount * 0.2);
      const price = startPrice + (changeAmount * progress) + randomFactor;
      
      const time = new Date();
      time.setHours(time.getHours() - (points - i));
      
      history.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: parseFloat(price.toFixed(2)),
      });
    }
    return history;
  }, [stock.symbol, stock.price, stock.change]);

  const isPositive = stock.change >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 : rose-500
  const fillColor = isPositive ? '#10b98120' : '#f43f5e20';

  if (!showDetails) {
    // Mini sparkline for table
    return (
      <div style={{ width: '100px', height: '40px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: '#F8FAFC' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelStyle={{ display: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#colorPrice-${stock.symbol})`}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
