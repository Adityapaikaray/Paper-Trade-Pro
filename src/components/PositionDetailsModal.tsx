import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, ShieldCheck, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Stock, Holding } from '../types.ts';
import StockChart from './StockChart.tsx';
import { AskTradeProAIChip } from './VoiceAssistant/AskTradeProAIChip.tsx';

export interface PositionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock;
  holding?: Holding;
  onQuickTrade?: (stock: Stock) => void;
  onModifyAllocation?: (symbol: string, currentAllocation: number) => void;
}

export const PositionDetailsModal: React.FC<PositionDetailsModalProps> = ({
  isOpen,
  onClose,
  stock,
  holding,
  onQuickTrade,
  onModifyAllocation,
}) => {
  const [timeframe, setTimeframe] = useState('1M');
  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y'];

  if (!isOpen || !stock) return null;

  const isPositive = stock.change >= 0;
  const currencySymbol = stock.currency || '₹';

  // Fallback calculations if holding exists
  const quantity = holding?.shares || 245;
  const avgPrice = holding?.averagePrice || (stock.price * 0.93);
  const invested = avgPrice * quantity;
  const currentValue = stock.price * quantity;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
  const allocation = 56.6; // representative default or passed value

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17243A]/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-3xl bg-ui-surface rounded-2xl border border-ui-border shadow-2xl overflow-hidden my-6 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 pb-5 border-b border-ui-border flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold font-sans text-text-main leading-tight">{stock.symbol}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg">
                  {stock.sector || 'EQUITY'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1">
                <p className="text-xs text-text-muted">{stock.name}</p>
                <AskTradeProAIChip prompt={`Tell me about ${stock.symbol} and its key support levels`} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">CURRENT PRICE</p>
              <p className="text-2xl font-mono font-bold text-text-main leading-tight">
                {currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-xs font-mono font-bold flex items-center justify-end gap-1 mt-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{currencySymbol}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-ui-surface-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* Chart Controls & Stock Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Price Action</span>
              </div>

              <div className="flex items-center bg-ui-bg p-1 rounded-xl border border-ui-border">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      timeframe === tf
                        ? 'bg-ui-surface text-text-main shadow-xs border border-ui-border'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full bg-ui-bg/50 rounded-xl border border-ui-border p-4">
              <StockChart stock={stock} showDetails={false} showTimeframes={false} />
            </div>
          </div>

          {/* Your Position Section */}
          <div className="bg-ui-bg rounded-2xl border border-ui-border p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ui-border pb-3">
              <h4 className="text-sm font-bold text-text-main">Your Position</h4>
              <span className="text-xs font-mono font-bold text-primary">Holding #{stock.symbol}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Quantity</p>
                <p className="text-base font-mono font-bold text-text-main">{quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Average Price</p>
                <p className="text-base font-mono font-bold text-text-main">
                  {currencySymbol}{avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Invested</p>
                <p className="text-base font-mono font-bold text-text-main">
                  {currencySymbol}{invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Current Value</p>
                <p className="text-base font-mono font-bold text-text-main">
                  {currencySymbol}{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">P&L</p>
                <p className={`text-base font-mono font-bold ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {pnl >= 0 ? '+' : ''}{currencySymbol}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">Allocation</p>
                <p className="text-base font-mono font-bold text-text-main">{allocation.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Transaction / History Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Transaction History</h4>
            <div className="border border-ui-border rounded-xl overflow-hidden divide-y divide-ui-border bg-ui-surface">
              <div className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-positive/10 text-positive flex items-center justify-center font-bold text-[10px]">
                    B
                  </span>
                  <div>
                    <p className="font-bold text-text-main">Bought {quantity} shares</p>
                    <p className="text-[10px] text-text-muted">Paper trade filled at {currencySymbol}{avgPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-text-main">{currencySymbol}{invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-text-muted">Simulated settlement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-ui-border bg-ui-surface flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              onClose();
              if (onModifyAllocation) onModifyAllocation(stock.symbol, allocation);
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors"
          >
            Modify Allocation
          </button>

          <button
            onClick={() => {
              onClose();
              if (onQuickTrade) onQuickTrade(stock);
            }}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            Quick Trade {stock.symbol} <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
