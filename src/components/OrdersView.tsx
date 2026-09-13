import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';

interface OrderItem {
  id: string;
  symbol: string;
  companyName: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  orderPrice: number;
  executionPrice: number;
  currency: string;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  timestamp: number;
  orderType: 'Market' | 'Limit' | 'Stop-Loss';
}

export const OrdersView: React.FC = () => {
  const { profile, marketContext } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const currencySymbol = marketContext === 'US' ? '$' : '₹';

  // Generate simulated historical and open orders combined with user real transactions
  const orders: OrderItem[] = useMemo(() => {
    const list: OrderItem[] = [];

    // Map existing transactions to filled orders
    (profile?.transactions || []).forEach((tx, idx) => {
      list.push({
        id: `ORD-${tx.id.slice(0, 8).toUpperCase()}`,
        symbol: tx.symbol,
        companyName: tx.symbol === 'TITAN' ? 'Titan Company Ltd.' : (tx.symbol === 'AMD' ? 'Advanced Micro Devices' : `${tx.symbol} Corp`),
        type: tx.type,
        quantity: tx.shares,
        orderPrice: tx.price,
        executionPrice: tx.price,
        currency: currencySymbol,
        status: 'FILLED',
        timestamp: tx.timestamp,
        orderType: 'Market',
      });
    });

    // Add seeded institutional realistic orders if transactions are empty or sparse
    const seededOrders: OrderItem[] = [
      {
        id: 'ORD-894102',
        symbol: 'TITAN',
        companyName: 'Titan Company Ltd.',
        type: 'BUY',
        quantity: 245,
        orderPrice: 3394.60,
        executionPrice: 3394.60,
        currency: '₹',
        status: 'FILLED',
        timestamp: Date.now() - 3600 * 1000 * 48,
        orderType: 'Market',
      },
      {
        id: 'ORD-894088',
        symbol: 'AMD',
        companyName: 'Advanced Micro Devices, Inc.',
        type: 'BUY',
        quantity: 245,
        orderPrice: 460.10,
        executionPrice: 460.10,
        currency: '$',
        status: 'FILLED',
        timestamp: Date.now() - 3600 * 1000 * 96,
        orderType: 'Market',
      },
      {
        id: 'ORD-895120',
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Ltd.',
        type: 'BUY',
        quantity: 80,
        orderPrice: 2750.00,
        executionPrice: 2750.00,
        currency: '₹',
        status: 'FILLED',
        timestamp: Date.now() - 3600 * 1000 * 12,
        orderType: 'Limit',
      },
      {
        id: 'ORD-895400',
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        type: 'BUY',
        quantity: 35,
        orderPrice: 4150.00,
        executionPrice: 0,
        currency: '₹',
        status: 'PENDING',
        timestamp: Date.now() - 1000 * 60 * 35,
        orderType: 'Limit',
      },
      {
        id: 'ORD-895390',
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        type: 'SELL',
        quantity: 15,
        orderPrice: 135.00,
        executionPrice: 0,
        currency: '$',
        status: 'PENDING',
        timestamp: Date.now() - 1000 * 60 * 120,
        orderType: 'Limit',
      },
      {
        id: 'ORD-893910',
        symbol: 'INFY',
        companyName: 'Infosys Ltd.',
        type: 'BUY',
        quantity: 50,
        orderPrice: 1850.00,
        executionPrice: 0,
        currency: '₹',
        status: 'CANCELLED',
        timestamp: Date.now() - 3600 * 1000 * 120,
        orderType: 'Limit',
      },
    ];

    // Merge without duplicate IDs
    seededOrders.forEach((so) => {
      if (!list.find((o) => o.id === so.id)) {
        list.push(so);
      }
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [profile?.transactions, currencySymbol]);

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
          order.companyName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, activeTab, typeFilter, searchQuery]);

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

      {/* Tabs and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-ui-surface border border-ui-border rounded-xl shadow-2xs">
          {(['All', 'Open', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
              }`}
            >
              {tab}
            </button>
          ))}
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-ui-border bg-ui-bg/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Symbol</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5">Quantity</th>
                <th className="py-3.5 px-5">Order Price</th>
                <th className="py-3.5 px-5">Execution Price</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted font-medium">
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
                            <span className="text-[10px] text-text-muted truncate max-w-[120px] block">{ord.companyName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
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
                              ? 'bg-primary/10 text-primary'
                              : 'bg-ui-bg text-text-muted'
                          }`}
                        >
                          {isFilled && <CheckCircle2 size={12} />}
                          {isPending && <Clock size={12} />}
                          {!isFilled && !isPending && <XCircle size={12} />}
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-mono text-text-muted">
                        <div>{new Date(ord.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] opacity-75">
                          {new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
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
