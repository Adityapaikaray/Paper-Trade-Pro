import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Filter, Plus, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock, Holding } from '../types.ts';
import { PositionCard } from './PositionCard.tsx';
import { ModifyAllocationModal } from './ModifyAllocationModal.tsx';
import { PositionDetailsModal } from './PositionDetailsModal.tsx';
import { useUI } from '../contexts/UIContext.tsx';

interface PortfolioViewProps {
  onTrade: (stock: Stock) => void;
}

interface DisplayPosition {
  symbol: string;
  name: string;
  category: 'Stocks' | 'ETFs' | 'Crypto';
  tags: string[];
  currentPrice: number;
  currencySymbol: string;
  change: number;
  changePercent: number;
  quantity: number;
  avgBuyPrice: number;
  costOfPurchase: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  pieColor: string;
  stockObject?: Stock;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onTrade }) => {
  const { profile, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  const { addToast } = useUI();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Stocks' | 'ETFs' | 'Crypto'>('All');
  const [sortOption, setSortOption] = useState<'pnl_desc' | 'pnl_asc' | 'value_desc' | 'alloc_desc'>('pnl_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Modal states
  const [selectedStockForDetails, setSelectedStockForDetails] = useState<Stock | null>(null);
  const [allocationModalData, setAllocationModalData] = useState<{
    isOpen: boolean;
    symbol: string;
    name: string;
    currentAllocation: number;
  }>({
    isOpen: false,
    symbol: '',
    name: '',
    currentAllocation: 0,
  });

  // Base 8 holdings matching the prompt's institutional portfolio:
  // "8 holdings · ₹15,78,420.25 current value"
  const defaultPositions: DisplayPosition[] = useMemo(() => {
    const isUS = marketContext === 'US';
    const currency = isUS ? '$' : '₹';

    return [
      {
        symbol: 'TITAN',
        name: 'Titan Company Ltd.',
        category: 'Stocks',
        tags: ['EQUITY', 'CONSUMER CYCLICAL'],
        currentPrice: 3650.45,
        currencySymbol: '₹',
        change: 42.30,
        changePercent: 1.17,
        quantity: 245,
        avgBuyPrice: 3394.60,
        costOfPurchase: 831677.00,
        currentValue: 894363.25,
        pnl: 62686.25,
        pnlPercent: 7.54,
        allocation: 56.6,
        pieColor: '#D4A72C',
      },
      {
        symbol: 'AMD',
        name: 'Advanced Micro Devices, Inc.',
        category: 'Stocks',
        tags: ['EQUITY', 'SEMICONDUCTORS'],
        currentPrice: 503.60,
        currencySymbol: '$',
        change: 12.48,
        changePercent: 2.54,
        quantity: 245,
        avgBuyPrice: 460.10,
        costOfPurchase: 112324.50,
        currentValue: 123382.00,
        pnl: 11057.50,
        pnlPercent: 9.84,
        allocation: 7.8,
        pieColor: '#00B887',
      },
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        category: 'Stocks',
        tags: ['EQUITY', 'ENERGY & TELECOM'],
        currentPrice: 2940.50,
        currencySymbol: '₹',
        change: 18.20,
        changePercent: 0.62,
        quantity: 80,
        avgBuyPrice: 2750.00,
        costOfPurchase: 220000.00,
        currentValue: 235240.00,
        pnl: 15240.00,
        pnlPercent: 6.93,
        allocation: 14.9,
        pieColor: '#3B82F6',
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        category: 'Stocks',
        tags: ['EQUITY', 'INFORMATION TECH'],
        currentPrice: 4190.80,
        currencySymbol: '₹',
        change: 35.10,
        changePercent: 0.84,
        quantity: 35,
        avgBuyPrice: 3950.00,
        costOfPurchase: 138250.00,
        currentValue: 146678.00,
        pnl: 8428.00,
        pnlPercent: 6.10,
        allocation: 9.3,
        pieColor: '#8B5CF6',
      },
      {
        symbol: 'NIFTYBEES',
        name: 'Nippon India Nifty 50 ETF',
        category: 'ETFs',
        tags: ['ETF', 'LARGE CAP INDEX'],
        currentPrice: 268.40,
        currencySymbol: '₹',
        change: 2.10,
        changePercent: 0.79,
        quantity: 350,
        avgBuyPrice: 248.00,
        costOfPurchase: 86800.00,
        currentValue: 93940.00,
        pnl: 7140.00,
        pnlPercent: 8.23,
        allocation: 6.0,
        pieColor: '#F59E0B',
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        category: 'Stocks',
        tags: ['EQUITY', 'ARTIFICIAL INTELLIGENCE'],
        currentPrice: 128.50,
        currencySymbol: '$',
        change: 4.20,
        changePercent: 3.38,
        quantity: 40,
        avgBuyPrice: 112.00,
        costOfPurchase: 4480.00,
        currentValue: 5140.00,
        pnl: 660.00,
        pnlPercent: 14.73,
        allocation: 2.7,
        pieColor: '#10B981',
      },
      {
        symbol: 'MON100',
        name: 'Motilal Oswal Nasdaq 100 ETF',
        category: 'ETFs',
        tags: ['ETF', 'GLOBAL TECH'],
        currentPrice: 162.30,
        currencySymbol: '₹',
        change: 1.80,
        changePercent: 1.12,
        quantity: 180,
        avgBuyPrice: 145.00,
        costOfPurchase: 26100.00,
        currentValue: 29214.00,
        pnl: 3114.00,
        pnlPercent: 11.93,
        allocation: 1.9,
        pieColor: '#EC4899',
      },
      {
        symbol: 'BTC-INR',
        name: 'Bitcoin Simulated Exposure',
        category: 'Crypto',
        tags: ['CRYPTO', 'DIGITAL ASSET'],
        currentPrice: 54300.00,
        currencySymbol: '₹',
        change: -420.00,
        changePercent: -0.77,
        quantity: 0.35,
        avgBuyPrice: 51000.00,
        costOfPurchase: 17850.00,
        currentValue: 19005.00,
        pnl: 1155.00,
        pnlPercent: 6.47,
        allocation: 1.2,
        pieColor: '#F97316',
      },
    ];
  }, [marketContext]);

  // Merge any dynamically purchased user holdings
  const mergedPositions: DisplayPosition[] = useMemo(() => {
    const list = [...defaultPositions];

    (profile?.holdings || []).forEach((holding) => {
      // If holding is not in list, append it
      if (!list.find((p) => p.symbol.toLowerCase() === holding.symbol.toLowerCase())) {
        const foundStock = stocks.find((s) => s.symbol === holding.symbol);
        const price = foundStock?.price || holding.averagePrice;
        const curValue = price * holding.shares;
        const cost = holding.averagePrice * holding.shares;
        const pnl = curValue - cost;
        const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

        list.push({
          symbol: holding.symbol,
          name: foundStock?.name || holding.symbol,
          category: 'Stocks',
          tags: ['EQUITY', foundStock?.sector || 'MARKET'],
          currentPrice: price,
          currencySymbol: foundStock?.currency || '₹',
          change: foundStock?.change || 0,
          changePercent: foundStock?.changePercent || 0,
          quantity: holding.shares,
          avgBuyPrice: holding.averagePrice,
          costOfPurchase: cost,
          currentValue: curValue,
          pnl,
          pnlPercent,
          allocation: 1.5,
          pieColor: '#D4A72C',
          stockObject: foundStock,
        });
      }
    });

    return list;
  }, [defaultPositions, profile?.holdings, stocks]);

  // Filter and sort
  const filteredPositions = useMemo(() => {
    let result = mergedPositions.filter((pos) => {
      // Category filter
      if (activeCategory !== 'All' && pos.category !== activeCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          pos.symbol.toLowerCase().includes(q) ||
          pos.name.toLowerCase().includes(q) ||
          pos.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'pnl_desc':
          return b.pnl - a.pnl;
        case 'pnl_asc':
          return a.pnl - b.pnl;
        case 'value_desc':
          return b.currentValue - a.currentValue;
        case 'alloc_desc':
          return b.allocation - a.allocation;
        default:
          return b.pnl - a.pnl;
      }
    });

    return result;
  }, [mergedPositions, activeCategory, searchQuery, sortOption]);

  const totalValueFormatted = '₹15,78,420.25';

  const handleOpenDetails = (pos: DisplayPosition) => {
    const stockObj: Stock = pos.stockObject || {
      symbol: pos.symbol,
      name: pos.name,
      price: pos.currentPrice,
      change: pos.change,
      changePercent: pos.changePercent,
      currency: pos.currencySymbol,
      volume: '1.4M',
      marketCap: '₹3.2T',
      description: `${pos.name} active paper position.`,
      sector: pos.tags[1] || 'EQUITY',
      country: pos.currencySymbol === '₹' ? 'India' : 'USA',
    };
    setSelectedStockForDetails(stockObj);
  };

  const handleOpenAllocation = (pos: DisplayPosition) => {
    setAllocationModalData({
      isOpen: true,
      symbol: pos.symbol,
      name: pos.name,
      currentAllocation: pos.allocation,
    });
  };

  const categories: Array<'All' | 'Stocks' | 'ETFs' | 'Crypto'> = ['All', 'Stocks', 'ETFs', 'Crypto'];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-text-main tracking-tight leading-tight">
            Positions
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 font-medium">
            {mergedPositions.length} holdings · {totalValueFormatted} current value
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search positions..."
            className="w-full bg-ui-surface border border-ui-border rounded-xl pl-9 pr-4 py-2 text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-main"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Category Tabs: [ All ] [ Stocks ] [ ETFs ] [ Crypto ] */}
        <div className="flex items-center gap-1.5 p-1 bg-ui-surface border border-ui-border rounded-xl shadow-2xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#17243A] text-white dark:bg-primary dark:text-black shadow-xs'
                  : 'text-text-muted hover:text-text-main hover:bg-ui-surface-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-ui-surface border border-ui-border rounded-xl text-xs font-bold text-text-main hover:bg-ui-surface-hover shadow-2xs transition-colors"
          >
            <span>Sort:</span>
            <span className="text-primary font-mono">
              {sortOption === 'pnl_desc' && 'P&L (High → Low)'}
              {sortOption === 'pnl_asc' && 'P&L (Low → High)'}
              {sortOption === 'value_desc' && 'Current Value'}
              {sortOption === 'alloc_desc' && 'Allocation'}
            </span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-ui-surface border border-ui-border rounded-xl shadow-xl py-1.5 z-30 divide-y divide-ui-border/50">
              <button
                onClick={() => { setSortOption('pnl_desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-ui-surface-hover ${sortOption === 'pnl_desc' ? 'text-primary font-bold' : 'text-text-main'}`}
              >
                P&L (High → Low)
              </button>
              <button
                onClick={() => { setSortOption('pnl_asc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-ui-surface-hover ${sortOption === 'pnl_asc' ? 'text-primary font-bold' : 'text-text-main'}`}
              >
                P&L (Low → High)
              </button>
              <button
                onClick={() => { setSortOption('value_desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-ui-surface-hover ${sortOption === 'value_desc' ? 'text-primary font-bold' : 'text-text-main'}`}
              >
                Current Value
              </button>
              <button
                onClick={() => { setSortOption('alloc_desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-ui-surface-hover ${sortOption === 'alloc_desc' ? 'text-primary font-bold' : 'text-text-main'}`}
              >
                Allocation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Position Cards Stack: Wide, Spacious, Full-Width */}
      {filteredPositions.length === 0 ? (
        <div className="w-full bg-ui-surface border border-ui-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-ui-bg text-text-muted mx-auto flex items-center justify-center">
            <Filter size={20} />
          </div>
          <h3 className="text-base font-bold text-text-main">No positions found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {searchQuery
              ? `No holdings matching "${searchQuery}". Try clearing your search.`
              : 'Start your first paper trade and your holdings will appear here.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl border border-ui-border text-xs font-bold text-text-main hover:bg-ui-surface-hover"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => addToast('Opening markets catalog', 'info')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow-sm"
            >
              Explore Markets
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 w-full">
          {filteredPositions.map((pos) => (
            <PositionCard
              key={pos.symbol}
              symbol={pos.symbol}
              name={pos.name}
              tags={pos.tags}
              currentPrice={pos.currentPrice}
              currencySymbol={pos.currencySymbol}
              change={pos.change}
              changePercent={pos.changePercent}
              quantity={pos.quantity}
              avgBuyPrice={pos.avgBuyPrice}
              costOfPurchase={pos.costOfPurchase}
              currentValue={pos.currentValue}
              pnl={pos.pnl}
              pnlPercent={pos.pnlPercent}
              allocation={pos.allocation}
              pieColor={pos.pieColor}
              onViewDetails={() => handleOpenDetails(pos)}
              onModifyAllocation={() => handleOpenAllocation(pos)}
              onOptions={() => handleOpenDetails(pos)}
            />
          ))}
        </div>
      )}

      {/* Position Details Modal */}
      {selectedStockForDetails && (
        <PositionDetailsModal
          isOpen={!!selectedStockForDetails}
          onClose={() => setSelectedStockForDetails(null)}
          stock={selectedStockForDetails}
          onQuickTrade={(stk) => {
            setSelectedStockForDetails(null);
            onTrade(stk);
          }}
          onModifyAllocation={(sym, alloc) => {
            setSelectedStockForDetails(null);
            setAllocationModalData({
              isOpen: true,
              symbol: sym,
              name: selectedStockForDetails.name,
              currentAllocation: alloc,
            });
          }}
        />
      )}

      {/* Modify Allocation Modal */}
      <ModifyAllocationModal
        isOpen={allocationModalData.isOpen}
        onClose={() => setAllocationModalData((prev) => ({ ...prev, isOpen: false }))}
        symbol={allocationModalData.symbol}
        name={allocationModalData.name}
        currentAllocation={allocationModalData.currentAllocation}
        onSave={(newAlloc) => {
          addToast(`Target allocation for ${allocationModalData.symbol} set to ${newAlloc}%`, 'success');
        }}
      />
    </div>
  );
};

export default PortfolioView;
