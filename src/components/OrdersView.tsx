import React, { useState, useMemo } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, Ban, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { Stock } from '../types.ts';

export interface OrdersViewProps {
  onTrade?: (stock: Stock) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onTrade }) => {
  const { profile, marketContext, cancelOrder } = usePortfolio();
  const { addToast } = useUI();
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const isIndia = marketContext === 'IN';
  const targetCurrency = isIndia ? '₹' : '$';

  const orders = useMemo(() => {
    return (profile.orders || []).filter(o => !o.currency || o.currency === targetCurrency);
  }, [profile.orders, targetCurrency]);

  // Summary counts
  const openCount = useMemo(() => orders.filter(o => o.status === 'PENDING').length, [orders]);
  const completedCount = useMemo(() => orders.filter(o => o.status === 'FILLED').length, [orders]);
  const cancelledCount = useMemo(() => orders.filter(o => o.status === 'CANCELLED').length, [orders]);

  // Tab filtering
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === 'Open' && order.status !== 'PENDING') return false;
      if (activeTab === 'Completed' && order.status !== 'FILLED') return false;
      if (activeTab === 'Cancelled' && order.status !== 'CANCELLED') return false;

      // Type filter
      if (typeFilter !== 'ALL' && order.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          order.symbol.toLowerCase().includes(q) ||
          order.id.toLowerCase().includes(q) ||
          (order.companyName && order.companyName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, activeTab, typeFilter, searchQuery]);

  const handleCancelOrder = (orderId: string, symbol: string) => {
    const success = cancelOrder(orderId);
    if (success) {
      addToast(`Order ${orderId} for ${symbol} successfully cancelled. Funds refunded.`, 'info');
    } else {
      addToast(`Unable to cancel order ${orderId}.`, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
            Orders
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
            Simulated paper order lifecycle, executions, fills, and pending limit triggers.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or symbol..."
            className="w-full bg-ui-surface border border-ui-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-ui-surface border border-ui-border p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Orders</p>
          <p className="text-2xl font-mono font-bold text-text-main mt-1">{orders.length}</p>
        </div>
        <div className="bg-ui-surface border border-ui-border p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Open / Pending</p>
          <p className="text-2xl font-mono font-bold text-primary mt-1">{openCount}</p>
        </div>
        <div className="bg-ui-surface border border-ui-border p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Filled</p>
          <p className="text-2xl font-mono font-bold text-emerald-500 mt-1">{completedCount}</p>
        </div>
        <div className="bg-ui-surface border border-ui-border p-4 rounded-xl shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Cancelled</p>
          <p className="text-2xl font-mono font-bold text-text-muted mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-ui-surface border border-ui-border rounded-xl shadow-2xs">
          {(['All', 'Open', 'Completed', 'Cancelled'] as const).map((tab) => {
            const count = tab === 'All' ? orders.length : tab === 'Open' ? openCount : tab === 'Completed' ? completedCount : cancelledCount;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-ui-bg text-text-muted'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-muted">Order Side:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-ui-surface border border-ui-border rounded-xl px-3 py-1.5 text-xs font-bold text-text-main focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">Buy Orders</option>
            <option value="SELL">Sell Orders</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-ui-border bg-ui-bg/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Symbol</th>
                <th className="py-3.5 px-5">Type / Side</th>
                <th className="py-3.5 px-5">Quantity</th>
                <th className="py-3.5 px-5">Order Price</th>
                <th className="py-3.5 px-5">Execution Price</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Date & Time</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted font-medium">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isBuy = ord.type === 'BUY';
                  const isFilled = ord.status === 'FILLED';
                  const isPending = ord.status === 'PENDING';

                  return (
                    <tr key={ord.id} className="hover:bg-ui-surface-hover/60 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-text-muted">{ord.id}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#17243A] text-white flex items-center justify-center font-bold text-[10px]">
                            {ord.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold font-sans text-text-main block">{ord.symbol}</span>
                            <span className="text-[10px] text-text-muted truncate max-w-[120px] block">{ord.companyName || ord.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isBuy
                                ? 'bg-positive/10 text-positive border border-positive/30'
                                : 'bg-negative/10 text-negative border border-negative/30'
                            }`}
                          >
                            {isBuy ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                            {ord.type}
                          </span>
                          <span className="text-[10px] font-medium text-text-muted bg-ui-bg px-2 py-0.5 rounded border border-ui-border">
                            {ord.orderType || 'Market'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-text-main">{ord.quantity.toLocaleString()}</td>
                      <td className="py-4 px-5 font-mono text-text-main">
                        {ord.currency}{ord.orderPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5 font-mono text-text-main">
                        {isFilled
                          ? `${ord.currency}${ord.executionPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isFilled
                              ? 'bg-positive/10 text-positive'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              : 'bg-ui-bg text-text-muted'
                          }`}
                        >
                          {isFilled && <CheckCircle2 size={12} />}
                          {isPending && <Clock size={12} />}
                          {!isFilled && !isPending && <XCircle size={12} />}
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-text-muted">
                        <div>{new Date(ord.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] opacity-75">
                          {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleCancelOrder(ord.id, ord.symbol)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-[0.98] active:scale-95"
                          >
                            <Ban size={12} />
                            Cancel
                          </button>
                        ) : (
                          <span className="text-text-muted text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default OrdersView;

