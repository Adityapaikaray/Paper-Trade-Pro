/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';

interface LiveIndexContributorProps {
  onTrade?: (stock: Stock) => void;
}

const INDEX_CONSTITUENTS: Record<string, string[]> = {
  dow: ['AAPL', 'MSFT', 'GS', 'UNH', 'JPM', 'CAT'],
  sandp500: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META'],
  nasdaq: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'TSLA', 'GOOGL'],
  dax: ['SAP', 'SIE', 'ALV', 'DTE'],
  nifty: ['RELIANCE:NSE', 'TCS:NSE', 'HDFCBANK:NSE', 'INFY:NSE', 'ICICIBANK:NSE', 'SBIN:NSE'],
  sensex: ['RELIANCE:NSE', 'TCS:NSE', 'HDFCBANK:NSE', 'INFY:NSE', 'ITC:NSE', 'LT:NSE'],
  niftybank: ['HDFCBANK:NSE', 'ICICIBANK:NSE', 'SBIN:NSE', 'KOTAKBANK:NSE', 'AXISBANK:NSE']
};

export const LiveIndexContributor: React.FC<LiveIndexContributorProps> = ({ onTrade }) => {
  const { indices, stocks } = useMarketData();
  
  // Use S&P 500 or the first available index
  const selectedIndex = indices.find(idx => idx.key === 'sandp500') || indices[0];
  
  const constituentSymbols = selectedIndex ? INDEX_CONSTITUENTS[selectedIndex.key] || [] : [];
  const constituentStocks = useMemo(() => {
    return constituentSymbols
      .map(symbol => stocks.find(s => s.symbol === symbol))
      .filter((s): s is Stock => s !== undefined);
  }, [constituentSymbols, stocks]);

  if (constituentStocks.length === 0 || !selectedIndex) return null;

  return (
    <div className="pt-6 pb-6 relative z-10 w-full ">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary animate-pulse" />
          <span className="text-[10px] md:text-xs font-mono font-black uppercase text-primary tracking-wider">
            Live Index Contributors ({selectedIndex.displaySymbol})
          </span>
        </div>
        <span className="hidden md:inline-block text-[9px] font-mono text-text-muted">
          Real-time quotes • Click to place order
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {constituentStocks.map(stock => (
          <button
            key={stock.symbol}
            onClick={() => onTrade && onTrade(stock)}
            className="min-w-[120px] p-3 bg-ui-bg hover:bg-primary/5 border border-ui-border hover:border-primary/40 rounded-xl transition-all text-left flex flex-col justify-between group shadow-xs hover:shadow-md shrink-0"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-serif italic font-black text-text-main group-hover:text-primary transition-colors truncate pr-2">
                {stock.symbol.replace(':NSE', '')}
              </span>
              <ArrowUpRight size={12} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-mono font-black text-text-main">
                {stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className={`text-[9px] font-mono font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LiveIndexContributor;
