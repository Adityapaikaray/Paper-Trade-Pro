import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketData } from '../hooks/useMarketData.ts';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { Stock, IndexQuote } from '../types.ts';

const HeaderSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const { stocks, indices } = useMarketData();
  const { navigate } = useNavigation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Simulate network delay for loading state
    if (query.trim().length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const filteredStocks = query.length > 0 
    ? stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredIndices = query.length > 0
    ? indices.filter(idx => 
        idx.symbol.toLowerCase().includes(query.toLowerCase()) || 
        idx.name.toLowerCase().includes(query.toLowerCase()) ||
        idx.displaySymbol.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const combinedResults = [...filteredStocks, ...filteredIndices].slice(0, 5);

  const handleSelect = (item: Stock | IndexQuote) => {
    setIsOpen(false);
    setQuery('');
    
    const symbolToUse = 'currency' in item && 'key' in item ? (item as IndexQuote).displaySymbol : (item as Stock).symbol;
    const nameToUse = item.name;

    // We can just store a lightweight version for recent searches if needed, or just store it as is
    // Let's store it as Stock-like to keep types simple in Recent Searches
    const stockLike: Stock = 'key' in item 
      ? {
          symbol: (item as IndexQuote).displaySymbol,
          name: (item as IndexQuote).name,
          price: item.price,
          change: item.change,
          changePercent: item.percentChange,
          currency: (item as IndexQuote).currency,
          sector: 'Index',
          country: (item as IndexQuote).region,
          description: '',
          volume: '0',
          marketCap: '0'
        }
      : item as Stock;

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.symbol !== stockLike.symbol);
      return [stockLike, ...filtered].slice(0, 5);
    });

    if ('key' in item) {
      // It's an index, usually traded or viewed differently, but for now we route to trade view with the stockLike representation
      navigate('trade', { stock: stockLike });
    } else {
      navigate('trade', { stock: item });
    }
  };

  const removeRecent = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(s => s.symbol !== symbol));
  };

  return (
    <div className="relative w-full lg:w-[480px]" ref={searchRef}>
      <div 
        className={`relative group w-full transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/50 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.15)]' : ''}`}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
          <Search size={16} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          className="w-full bg-ui-surface border border-ui-border text-text-main placeholder:text-text-muted text-[14px] md:text-[15px] font-medium rounded-full py-2.5 md:py-3 pl-10 md:pl-11 pr-4 focus:outline-none focus:border-primary transition-all shadow-sm"
          placeholder="Search stocks, ETFs, funds..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.trim().length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-ui-surface border border-ui-border rounded-2xl shadow-2xl overflow-hidden z-[100] max-h-[60vh] flex flex-col"
          >
            <div className="overflow-y-auto custom-scrollbar p-2">
              {query.trim().length === 0 ? (
                // Empty state / Recent Searches
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-bold text-text-muted uppercase tracking-widest flex justify-between items-center">
                    Recent Searches
                  </div>
                  {recentSearches.map(stock => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelect(stock)}
                      className="w-full text-left px-3 py-2.5 hover:bg-ui-surface-hover transition-colors rounded-xl flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ui-bg flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                          <Clock size={14} strokeWidth={2} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-main">{stock.symbol}</div>
                          <div className="text-xs text-text-muted">{stock.name}</div>
                        </div>
                      </div>
                      <div 
                        onClick={(e) => removeRecent(e, stock.symbol)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-main transition-opacity rounded-full hover:bg-ui-bg"
                      >
                        <X size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : isLoading ? (
                // Loading Skeleton
                <div className="py-4 px-2 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between px-3 animate-pulse">
                      <div className="flex flex-col gap-2">
                        <div className="w-24 h-4 bg-ui-border rounded" />
                        <div className="w-40 h-3 bg-ui-border/50 rounded" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="w-16 h-4 bg-ui-border rounded" />
                        <div className="w-12 h-3 bg-ui-border/50 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : combinedResults.length > 0 ? (
                // Search Results
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-bold text-text-muted uppercase tracking-widest">
                    Search Results
                  </div>
                  {combinedResults.map(item => {
                    const isIndex = 'key' in item;
                    const symbol = isIndex ? (item as any).displaySymbol : (item as any).symbol;
                    const change = item.change;
                    const changePercent = isIndex ? (item as any).percentChange : (item as any).changePercent;
                    
                    return (
                    <button
                      key={symbol}
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-3 py-2.5 hover:bg-ui-surface-hover transition-colors rounded-xl flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <div className="text-sm font-bold font-mono text-text-main">{symbol}</div>
                        <div className="text-xs text-text-muted">{item.name}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-bold font-mono text-text-main">
                          {item.currency === 'INR' ? '₹' : '$'}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-bold font-mono flex items-center gap-0.5 ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {change >= 0 ? '+' : ''}{changePercent?.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              ) : (
                // No Results
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-ui-bg mx-auto flex items-center justify-center text-text-muted mb-3">
                    <Search size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-text-main mb-1">No matching securities found</h3>
                  <p className="text-xs text-text-muted">Try another symbol or company name.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderSearch;
