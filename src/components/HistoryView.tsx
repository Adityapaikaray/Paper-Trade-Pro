import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, ArrowUpRight, ArrowDownLeft, Download, Filter, ArrowUpDown, Search } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useUI } from '../contexts/UIContext.tsx';

const HistoryView: React.FC = () => {
  const { profile, marketContext } = usePortfolio();
  const { addToast } = useUI();
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = profile.transactions || [];
  const defaultCurrency = marketContext === 'US' ? '$' : '₹';

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (filterType !== 'ALL' && tx.type !== filterType) return false;
        if (searchQuery.trim() && !tx.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        return sortOrder === 'NEWEST' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
      });
  }, [transactions, filterType, sortOrder, searchQuery]);

  const exportCSV = () => {
    if (filteredTransactions.length === 0) {
      addToast('No transaction records to export.', 'warning');
      return;
    }

    const headers = ['Transaction ID', 'Asset Symbol', 'Type', 'Quantity', 'Execution Price', 'Total Value', 'Date', 'Time'];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      tx.symbol,
      tx.type,
      tx.shares,
      tx.price.toFixed(2),
      (tx.shares * tx.price).toFixed(2),
      new Date(tx.timestamp).toISOString().split('T')[0],
      new Date(tx.timestamp).toLocaleTimeString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TradePro_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Audit ledger exported to CSV successfully.', 'success');
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
            Transaction History
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
            Immutable surveillance log of all simulated paper fills, asset acquisitions, and liquidations.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ui-surface hover:bg-ui-surface-hover border border-ui-border text-text-main rounded-xl text-xs font-bold transition-all shadow-2xs hover:border-primary active:scale-95"
        >
          <Download size={14} className="text-primary" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-ui-surface border border-ui-border rounded-xl shadow-2xs">
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type
                    ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
                }`}
              >
                {type === 'ALL' ? 'All Events' : type}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-ui-surface border border-ui-border hover:bg-ui-surface-hover rounded-xl text-xs font-bold text-text-main transition-all shadow-2xs"
          >
            <ArrowUpDown size={12} className="text-primary" />
            <span>{sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticker symbol..."
            className="w-full bg-ui-surface border border-ui-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-ui-surface rounded-2xl border border-ui-border shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-muted mb-4">
              <HistoryIcon size={28} />
            </div>
            <h3 className="text-base font-bold text-text-main">No Transactions Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              {transactions.length === 0
                ? 'Execute your first paper trade from the Dashboard or Market view to populate your transaction audit log.'
                : 'No transaction records match the current filter or search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-ui-border bg-ui-bg/40 text-[10px] uppercase font-bold text-text-muted tracking-wider">
                  <th className="py-3.5 px-6">Event</th>
                  <th className="py-3.5 px-6">Contract</th>
                  <th className="py-3.5 px-6 text-center">Volume</th>
                  <th className="py-3.5 px-6">Execution Price</th>
                  <th className="py-3.5 px-6">Net Value</th>
                  <th className="py-3.5 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border text-xs">
                {filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  const symbolCurrency = tx.symbol === 'AMD' || tx.symbol === 'NVDA' || tx.symbol === 'AAPL' || tx.symbol === 'MSFT' ? '$' : defaultCurrency;

                  return (
                    <tr key={tx.id} className="hover:bg-ui-surface-hover/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${
                          isBuy
                            ? 'bg-positive/10 text-positive border border-positive/30'
                            : 'bg-negative/10 text-negative border border-negative/30'
                        }`}>
                          {isBuy ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-text-main block">{tx.symbol}</span>
                        <span className="text-[10px] text-text-muted font-mono">ID: {tx.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold text-text-main text-sm">
                        {tx.shares.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-text-main">
                        {symbolCurrency}{tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-primary">
                        {symbolCurrency}{(tx.shares * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-text-muted">
                        <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] opacity-75">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;

