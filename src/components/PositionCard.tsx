import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown, Eye, Edit2 } from 'lucide-react';

export interface PositionCardProps {
  symbol: string;
  name: string;
  tags?: string[];
  currentPrice: number;
  currencySymbol?: string;
  change?: number;
  changePercent?: number;
  quantity: number;
  avgBuyPrice: number;
  costOfPurchase: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  pieColor?: string;
  onViewDetails: () => void;
  onModifyAllocation: () => void;
  onOptions?: () => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  symbol,
  name,
  tags = ['EQUITY'],
  currentPrice,
  currencySymbol = '₹',
  change = 0,
  changePercent = 0,
  quantity,
  avgBuyPrice,
  costOfPurchase,
  currentValue,
  pnl,
  pnlPercent,
  allocation,
  pieColor = '#D4A72C',
  onViewDetails,
  onModifyAllocation,
  onOptions,
}) => {
  const isPositive = pnl >= 0;
  const isChangePositive = change >= 0;

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full bg-ui-surface rounded-2xl p-6 md:p-7 border border-ui-border shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-ui-border/80">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-sm shrink-0">
            {symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xl font-bold font-sans text-text-main leading-tight tracking-tight truncate">
              {symbol}
            </h4>
            <p className="text-xs text-text-muted mt-0.5 truncate">{name}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-ui-border text-text-muted bg-ui-bg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-0.5">CURRENT PRICE</p>
          <p className="text-2xl font-mono font-bold text-text-main leading-tight">
            {formatCurrency(currentPrice)}
          </p>
          <p className={`text-xs font-mono font-bold flex items-center sm:justify-end gap-1 mt-0.5 ${isChangePositive ? 'text-positive' : 'text-negative'}`}>
            {isChangePositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isChangePositive ? '+' : ''}{formatCurrency(change)} ({isChangePositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* 3-Column Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-5 border-b border-ui-border/80">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">QUANTITY</p>
            <p className="text-base font-mono font-bold text-text-main">{quantity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">COST OF PURCHASE</p>
            <p className="text-base font-mono font-bold text-text-main">{formatCurrency(costOfPurchase)}</p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">AVERAGE BUY PRICE</p>
            <p className="text-base font-mono font-bold text-text-main">{formatCurrency(avgBuyPrice)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">P&L</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-base font-mono font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? '+' : ''}{formatCurrency(pnl)}
              </span>
              <span className={`text-xs font-mono font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                ({isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">CURRENT VALUE</p>
            <p className="text-base font-mono font-bold text-text-main">{formatCurrency(currentValue)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-1">ALLOCATION</p>
            <div className="flex items-center gap-3">
              <span className="text-base font-mono font-bold text-text-main">{allocation.toFixed(1)}%</span>
              <div
                className="w-6 h-6 rounded-full shrink-0 shadow-sm border border-ui-border/50"
                style={{
                  background: `conic-gradient(${pieColor} 0% ${Math.min(100, Math.max(0, allocation))}%, #2B3545 ${Math.min(100, Math.max(0, allocation))}% 100%)`
                }}
                title={`${allocation.toFixed(1)}% portfolio allocation`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: View Details | Modify Allocation + Overflow */}
      <div className="flex items-center justify-between pt-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onViewDetails}
            className="w-9 h-9 rounded-xl bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-text-main hover:bg-ui-surface-hover shadow-sm transition-all active:scale-[0.98]"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onModifyAllocation}
            className="w-9 h-9 rounded-xl bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-text-main hover:bg-ui-surface-hover shadow-sm transition-all active:scale-[0.98]"
            title="Modify Allocation"
          >
            <Edit2 size={16} />
          </button>
        </div>
        <button
          onClick={onOptions || onViewDetails}
          className="w-9 h-9 rounded-xl bg-ui-surface border border-ui-border flex items-center justify-center text-text-muted hover:text-text-main hover:bg-ui-surface-hover shadow-sm transition-all active:scale-[0.98]"
          title="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};
