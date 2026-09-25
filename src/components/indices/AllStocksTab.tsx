/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { IndexConstituent } from '../../data/indices/types.ts';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters.ts';
import { Stock } from '../../types.ts';

interface AllStocksTabProps {
  index: {
    name: string;
    currency: '$' | '₹';
    region: 'US' | 'IN';
  };
  constituents: IndexConstituent[];
  onSelectStock: (stock: Stock) => void;
}

type DirectionFilter = 'all' | 'gainers' | 'losers';
type QuickFilter = 'none' | 'largest_weight' | 'largest_contributor' | 'largest_detractor';
type SortKey =
  | 'rank'
  | 'symbol'
  | 'name'
  | 'price'
  | 'change'
  | 'changePercent'
  | 'volume'
  | 'marketCap'
  | 'weight'
  | 'pointsContribution'
  | 'sector';

export const AllStocksTab: React.FC<AllStocksTabProps> = ({
  index,
  constituents,
  onSelectStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('none');
  const [sortKey, setSortKey] = useState<SortKey>('weight');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Extract all distinct sectors available in this constituent list
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    constituents.forEach(c => {
      if (c.sector && c.sector.trim().length > 0) {
        set.add(c.sector.trim());
      }
    });
    return Array.from(set).sort();
  }, [constituents]);

  // Handle header sorting click
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder(key === 'rank' || key === 'symbol' || key === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  // Helper parser for marketCap & volume numbers
  const parseVal = (str?: string): number => {
    if (!str) return 0;
    const clean = str.replace(/[$,₹,\s]/g, '').toUpperCase();
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    if (clean.endsWith('T')) return num * 1e12;
    if (clean.endsWith('B')) return num * 1e9;
    if (clean.endsWith('M')) return num * 1e6;
    if (clean.endsWith('K')) return num * 1e3;
    return num;
  };

  // Filter and sort constituents
  const filteredAndSorted = useMemo(() => {
    let list = [...constituents];

    // 1. Search query (ticker or company name)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.symbol.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      );
    }

    // 2. Direction filter
    if (directionFilter === 'gainers') {
      list = list.filter(c => c.changePercent > 0);
    } else if (directionFilter === 'losers') {
      list = list.filter(c => c.changePercent < 0);
    }

    // 3. Sector filter
    if (selectedSector !== 'ALL') {
      list = list.filter(c => c.sector === selectedSector);
    }

    // 4. Quick filter overrides
    if (quickFilter === 'largest_weight') {
      list.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    } else if (quickFilter === 'largest_contributor') {
      list.sort((a, b) => (b.pointsContribution || 0) - (a.pointsContribution || 0));
    } else if (quickFilter === 'largest_detractor') {
      list.sort((a, b) => (a.pointsContribution || 0) - (b.pointsContribution || 0));
    } else {
      // 5. User selected sort
      list.sort((a, b) => {
        let valA: any = a[sortKey];
        let valB: any = b[sortKey];

        if (sortKey === 'marketCap' || sortKey === 'volume') {
          valA = parseVal(String(valA));
          valB = parseVal(String(valB));
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        } else {
          valA = valA ?? 0;
          valB = valB ?? 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    constituents,
    searchQuery,
    directionFilter,
    selectedSector,
    quickFilter,
    sortKey,
    sortOrder
  ]);

  // Pagination logic
  const totalCount = filteredAndSorted.length;
  const effectivePageSize = pageSize === 0 ? totalCount : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / (effectivePageSize || 1)));
  const paginatedList = useMemo(() => {
    if (pageSize === 0) return filteredAndSorted;
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Export constituents to CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Ticker',
      'Company Name',
      'Sector',
      'Price',
      'Change',
      'Change %',
      'Volume',
      'Market Cap',
      'Index Weight %',
      'Point Contribution',
      'Market Status'
    ];
    const rows = filteredAndSorted.map(c => [
      c.rank || '',
      c.symbol,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.sector || ''}"`,
      c.price,
      c.change,
      c.changePercent,
      c.volume || '',
      c.marketCap || '',
      c.weight || '',
      c.pointsContribution ?? '',
      c.marketStatus || 'REGULAR'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${index.name.replace(/[^a-zA-Z0-9]/g, '_')}_constituents.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert constituent to Stock object for detail modal
  const openStockModal = (c: IndexConstituent) => {
    const stock: Stock = {
      symbol: c.symbol,
      name: c.name,
      description: c.name,
      price: c.price,
      change: c.change,
      changePercent: c.changePercent,
      volume: c.volume,
      marketCap: c.marketCap,
      sector: c.sector,
      country: index.region === 'IN' ? 'India' : 'USA',
      currency: index.currency,
      dayHigh: c.dayHigh,
      dayLow: c.dayLow,
      prevClose: c.prevClose,
      exchange: c.exchange || (index.region === 'IN' ? 'NSE' : 'NASDAQ'),
      history: []
    };
    onSelectStock(stock);
  };

  const renderSortIndicator = (key: SortKey) => {
    if (quickFilter !== 'none') return null;
    if (sortKey !== key) {
      return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-70 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-primary font-bold" />
    ) : (
      <ArrowDown size={12} className="text-primary font-bold" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search bar, direction filter, sector filter, quick filters & export */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search stocks in ${index.name}...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-ui-surface-subtle border border-ui-border focus:border-primary focus:outline-none text-xs text-text-main placeholder:text-text-muted transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Export & summary count */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-text-muted">
              Showing <strong className="text-text-main font-mono">{filteredAndSorted.length}</strong> of{' '}
              <strong className="text-text-main font-mono">{constituents.length}</strong> stocks
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ui-border hover:bg-ui-surface-subtle text-text-main text-xs font-medium transition-all"
              title="Export all stocks to CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-ui-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Direction Filter Segment */}
            <div className="inline-flex rounded-xl bg-ui-surface-subtle p-0.5 border border-ui-border text-xs">
              {(['all', 'gainers', 'losers'] as DirectionFilter[]).map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setDirectionFilter(d);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                    directionFilter === d
                      ? 'bg-ui-surface text-text-main shadow-xs font-bold border border-ui-border'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Sector Dropdown */}
            {availableSectors.length > 0 && (
              <select
                value={selectedSector}
                onChange={e => {
                  setSelectedSector(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl bg-ui-surface-subtle border border-ui-border text-xs font-medium text-text-main focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Sectors ({availableSectors.length})</option>
                {availableSectors.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {/* Quick Filter buttons */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-ui-border">
              <span className="text-[11px] font-bold text-text-muted">Quick:</span>
              <button
                onClick={() => {
                  setQuickFilter(quickFilter === 'largest_weight' ? 'none' : 'largest_weight');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  quickFilter === 'largest_weight'
                    ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                    : 'bg-ui-surface-subtle border-ui-border text-text-muted hover:text-text-main'
                }`}
              >
                Largest Weight
              </button>
              <button
                onClick={() => {
                  setQuickFilter(quickFilter === 'largest_contributor' ? 'none' : 'largest_contributor');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  quickFilter === 'largest_contributor'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                    : 'bg-ui-surface-subtle border-ui-border text-text-muted hover:text-text-main'
                }`}
              >
                Top Contributor
              </button>
              <button
                onClick={() => {
                  setQuickFilter(quickFilter === 'largest_detractor' ? 'none' : 'largest_detractor');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  quickFilter === 'largest_detractor'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
                    : 'bg-ui-surface-subtle border-ui-border text-text-muted hover:text-text-main'
                }`}
              >
                Top Detractor
              </button>
            </div>
          </div>

          {/* Page size dropdown */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-ui-surface-subtle border border-ui-border text-xs text-text-main focus:outline-none"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="0">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Constituents Table */}
      <div className="bg-ui-surface border border-ui-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="border-b border-ui-border bg-ui-surface-subtle text-[11px] font-bold text-text-muted uppercase tracking-wider">
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-3 w-10 cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    {renderSortIndicator('rank')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('symbol')}
                  className="py-3 px-3 cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center gap-1">
                    <span>Ticker</span>
                    {renderSortIndicator('symbol')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center gap-1">
                    <span>Company</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    {renderSortIndicator('price')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change</span>
                    {renderSortIndicator('change')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Change</span>
                    {renderSortIndicator('changePercent')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('weight')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weight</span>
                    {renderSortIndicator('weight')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pointsContribution')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Contribution</span>
                    {renderSortIndicator('pointsContribution')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Market Cap</span>
                    {renderSortIndicator('marketCap')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="py-3 px-3 text-right cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Volume</span>
                    {renderSortIndicator('volume')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sector')}
                  className="py-3 px-3 text-center cursor-pointer group hover:text-text-main"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Sector</span>
                    {renderSortIndicator('sector')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border/60 text-xs">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-text-muted">
                    No constituent stocks match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedList.map(c => {
                  const isPos = c.changePercent >= 0;
                  const contrib = c.pointsContribution;
                  const isContribPos = typeof contrib === 'number' && contrib >= 0;

                  return (
                    <tr
                      key={c.symbol}
                      onClick={() => openStockModal(c)}
                      className="hover:bg-ui-surface-subtle/80 cursor-pointer transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-3 text-text-muted font-mono text-[11px]">
                        {c.rank || '—'}
                      </td>

                      {/* Ticker */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-text-main group-hover:text-primary transition-colors font-mono">
                          {c.symbol}
                        </span>
                      </td>

                      {/* Company Name */}
                      <td className="py-3 px-3">
                        <span className="text-[12px] font-medium text-text-muted group-hover:text-text-main transition-colors truncate block max-w-[200px]" title={c.name}>
                          {c.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-text-main">
                        {index.currency}{formatCurrency(c.price, index.currency)}
                      </td>

                      {/* Price Change (Points / Currency) */}
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        <span className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPos ? '+' : ''}{index.currency}{Math.abs(c.change).toFixed(2)}
                        </span>
                      </td>

                      {/* Percentage Change */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                            isPos
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          <span>
                            {isPos ? '+' : ''}{c.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      {/* Index Weight */}
                      <td className="py-3 px-3 text-right font-mono text-text-main">
                        <span className="font-semibold">{c.weight.toFixed(2)}%</span>
                      </td>

                      {/* Contribution */}
                      <td className="py-3 px-3 text-right font-mono">
                        {typeof contrib === 'number' ? (
                          <span
                            className={`font-bold ${
                              isContribPos ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isContribPos ? '+' : ''}{contrib.toFixed(2)} pts
                          </span>
                        ) : (
                          <span className="text-text-muted text-[11px]">N/A</span>
                        )}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-3 text-right font-mono text-text-muted">
                        {c.marketCap || '—'}
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 text-right font-mono text-text-muted">
                        {c.volume || '—'}
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-ui-surface-subtle border border-ui-border text-text-muted truncate max-w-[130px]">
                          {c.sector || 'General'}
                        </span>
                      </td>

                      {/* Market Status */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {c.marketStatus || 'REGULAR'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && pageSize > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-ui-border bg-ui-surface text-xs text-text-muted">
            <div>
              Showing <span className="font-mono text-text-main font-bold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-mono text-text-main font-bold">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{' '}
              of <span className="font-mono text-text-main font-bold">{totalCount}</span> constituents
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-ui-border hover:bg-ui-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 px-2">
                <span className="font-bold text-text-main font-mono">{currentPage}</span>
                <span>/</span>
                <span className="font-mono">{totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-ui-border hover:bg-ui-surface-subtle disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
