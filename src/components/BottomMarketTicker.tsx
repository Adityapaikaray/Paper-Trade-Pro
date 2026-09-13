/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const BottomMarketTicker: React.FC = () => {
  const tickerItems = [
    { symbol: 'NIFTY 50', price: '24,716.30', change: '+0.82%', isPositive: true },
    { symbol: 'SENSEX', price: '81,123.45', change: '+0.76%', isPositive: true },
    { symbol: 'NASDAQ', price: '17,623.91', change: '+1.14%', isPositive: true },
    { symbol: 'S&P 500', price: '5,487.21', change: '+0.67%', isPositive: true },
    { symbol: 'RELIANCE', price: '2,840.75', change: '-0.61%', isPositive: false },
    { symbol: 'TCS', price: '4,120.50', change: '+2.40%', isPositive: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-white dark:bg-[#0B1728] border-t border-ui-border z-40 flex items-center px-4 md:px-6 shadow-sm overflow-hidden select-none">
      {/* Live Indicator */}
      <div className="flex items-center gap-2 pr-4 border-r border-ui-border shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-main">
          LIVE MARKETS
        </span>
      </div>

      {/* Ticker Stream */}
      <div className="flex-1 flex items-center gap-6 overflow-x-auto no-scrollbar pl-4 text-xs font-mono">
        {tickerItems.map((item) => (
          <div key={item.symbol} className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-text-main">{item.symbol}</span>
            <span className="text-text-muted">{item.price}</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                item.isPositive ? 'text-positive' : 'text-negative'
              }`}
            >
              {item.isPositive ? (
                <TrendingUp size={11} strokeWidth={2.5} />
              ) : (
                <TrendingDown size={11} strokeWidth={2.5} />
              )}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomMarketTicker;
