import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Zap, CheckCircle2, ChevronDown, DollarSign } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';

export const QuickTradePanel: React.FC = () => {
  const { stocks } = useMarketData();
  const { profile, executeTrade, marketContext } = usePortfolio();
  const { addToast } = useUI();

  const [symbol, setSymbol] = useState('TITAN');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop'>('Market');
  const [quantity, setQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<string>('');

  const currentStock = stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase()) || stocks[0];
  const currencySymbol = currentStock?.currency || (marketContext === 'US' ? '$' : '₹');
  const effectivePrice = orderType === 'Market' ? currentStock?.price || 0 : Number(limitPrice) || currentStock?.price || 0;
  const estimatedTotal = effectivePrice * quantity;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStock || quantity <= 0) {
      addToast('Please enter a valid quantity', 'error');
      return;
    }

    try {
      executeTrade(currentStock, quantity, side);
      addToast(
        `Successfully placed ${orderType} ${side} order: ${quantity} shares of ${currentStock.symbol} at ${currencySymbol}${effectivePrice.toFixed(2)}`,
        'success'
      );
    } catch (err: any) {
      addToast(err?.message || 'Order placement failed', 'error');
    }
  };

  return (
    <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-ui-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Zap size={15} />
            </div>
            <h3 className="text-base font-bold font-sans text-text-main">Quick Trade</h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-ui-bg border border-ui-border text-text-muted">
            Instant Execution
          </span>
        </div>

        <form onSubmit={handleExecute} className="space-y-4 pt-4">
          {/* Side Toggle: Buy / Sell */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-ui-bg rounded-xl border border-ui-border">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                side === 'BUY'
                  ? 'bg-positive text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <ArrowUpRight size={14} /> Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                side === 'SELL'
                  ? 'bg-negative text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <ArrowDownLeft size={14} /> Sell
            </button>
          </div>

          {/* Symbol Select */}
          <div>
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
              INSTRUMENT
            </label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:outline-none focus:border-primary cursor-pointer"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} — {s.name} ({s.currency || '₹'}{s.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Order Type */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-ui-bg rounded-xl border border-ui-border">
            {(['Market', 'Limit', 'Stop'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  orderType === t
                    ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Limit Price Input if not Market */}
          {orderType !== 'Market' && (
            <div>
              <label className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                {orderType.toUpperCase()} PRICE ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.05"
                placeholder={currentStock?.price.toFixed(2)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">
              <span>SHARES</span>
              <span>Price: {currencySymbol}{currentStock?.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-ui-bg border border-ui-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main"
              />
              <div className="flex gap-1">
                {[10, 50, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className="px-2.5 py-2 rounded-xl bg-ui-bg border border-ui-border text-[11px] font-mono font-bold text-text-muted hover:text-text-main"
                  >
                    +{q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estimated Total */}
          <div className="p-3.5 bg-ui-bg rounded-xl border border-ui-border flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted">Estimated Total:</span>
            <span className="text-base font-mono font-bold text-text-main">
              {currencySymbol}{estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 text-white ${
              side === 'BUY'
                ? 'bg-positive hover:bg-positive/90'
                : 'bg-negative hover:bg-negative/90'
            }`}
          >
            Submit {side} Order ({quantity} {currentStock?.symbol})
          </button>
        </form>
      </div>
    </div>
  );
};
