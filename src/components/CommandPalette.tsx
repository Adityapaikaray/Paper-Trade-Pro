/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, TrendingUp, TrendingDown, LayoutDashboard, Briefcase, History, Settings, Moon, Sun, ArrowRight, BarChart3, LayoutGrid } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { Stock } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onTrade: (stock: Stock, side?: "BUY" | "SELL") => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onTrade }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { stocks, indices } = useMarketData();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigationItems = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'heatmap', label: 'Go to Stock Heatmap of Index (Treemap & Constituents)', icon: LayoutGrid, category: 'Navigation' },
    { id: 'key-index', label: 'Go to Key Index (All Indices & Live Graphs)', icon: BarChart3, category: 'Navigation' },
    { id: 'market', label: 'Go to Market', icon: TrendingUp, category: 'Navigation' },
    { id: 'portfolio', label: 'Go to Portfolio', icon: Briefcase, category: 'Navigation' },
    { id: 'history', label: 'Go to Audit Ledger', icon: History, category: 'Navigation' },
  ];

  const actionItems = [
    { id: 'theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? Sun : Moon, category: 'Action', action: toggleTheme },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIndices = query.length > 0
    ? indices.filter(idx =>
        idx.name.toLowerCase().includes(query.toLowerCase()) ||
        idx.key.toLowerCase().includes(query.toLowerCase()) ||
        idx.displaySymbol.toLowerCase().includes(query.toLowerCase()) ||
        idx.symbol.toLowerCase().includes(query.toLowerCase())
      ).map(idx => ({
        id: idx.key,
        label: `${idx.name} (${idx.displaySymbol})`,
        icon: TrendingUp,
        category: `Key Index • ${idx.region}`,
        type: 'index',
        indexQuote: idx
      }))
    : [];

  const filteredStocks = query.length > 0 
    ? stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const results = [
    ...filteredNavigation.map(item => ({ ...item, type: 'nav' })),
    ...filteredActions.map(item => ({ ...item, type: 'action' })),
    ...filteredIndices,
    ...filteredStocks.map(stock => ({
      id: stock.symbol,
      label: `${stock.name} (${stock.symbol})`,
      icon: TrendingUp,
      category: 'Asset',
      type: 'stock',
      stock
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % results.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      executeAction(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeAction = (item: any) => {
    if (!item) return;
    if (item.type === 'nav') {
      onNavigate(item.id);
    } else if (item.type === 'action') {
      item.action();
    } else if (item.type === 'stock') {
      onTrade(item.stock);
    } else if (item.type === 'stock-trade') {
      onTrade(item.stock, item.side);
    } else if (item.type === 'index') {
      onNavigate('key-index');
    }
    onClose();
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : onClose(); // This will be handled by the parent
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-ui-surface border border-ui-border rounded-3xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="relative p-6 border-b border-ui-border">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search assets, views, or execute actions..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-ui-bg/50 border border-ui-border rounded-2xl py-4 pl-16 pr-12 focus:outline-none focus:border-primary/30 text-text-main font-bold placeholder:text-text-muted"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="px-2 py-1 bg-ui-bg border border-ui-border rounded text-[10px] text-text-muted font-black uppercase">ESC</span>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((item, index) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => executeAction(item)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${
                        index === selectedIndex 
                          ? 'bg-primary/10 border border-primary/20 shadow-lg' 
                          : 'border border-transparent hover:bg-ui-bg'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          index === selectedIndex ? 'bg-primary text-ui-bg' : 'bg-ui-bg text-text-muted'
                        }`}>
                          <item.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold transition-colors ${index === selectedIndex ? 'text-primary-light' : 'text-text-main'}`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">
                            {item.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {'stock' in item && item.stock && (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-mono font-black italic text-sm text-text-main">
                                {item.stock.currency}{item.stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                              <p className={`text-[10px] font-mono font-bold ${item.stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.stock.change >= 0 ? '+' : ''}{item.stock.changePercent.toFixed(2)}%
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onTrade(item.stock, 'BUY'); onClose(); }}
                                className="px-3 py-1.5 bg-positive text-white rounded-lg text-[10px] font-bold hover:bg-positive/90 transition-colors"
                              >
                                Buy
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onTrade(item.stock, 'SELL'); onClose(); }}
                                className="px-3 py-1.5 bg-negative text-white rounded-lg text-[10px] font-bold hover:bg-negative/90 transition-colors"
                              >
                                Sell
                              </button>
                            </div>
                          </div>
                        )}
                        {'indexQuote' in item && item.indexQuote && (
                          <div className="text-right">
                            <p className="font-mono font-black italic text-sm text-text-main">
                              {item.indexQuote.currency}{item.indexQuote.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                            </p>
                            <p className={`text-[10px] font-mono font-bold ${item.indexQuote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {item.indexQuote.change >= 0 ? '+' : ''}{item.indexQuote.percentChange.toFixed(2)}%
                            </p>
                          </div>
                        )}
                        {index === selectedIndex && (
                          <ArrowRight size={16} className="text-primary animate-in slide-in-from-left-2 duration-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-ui-bg border border-ui-border flex items-center justify-center mx-auto mb-4 text-text-muted opacity-30">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-bold text-text-muted italic">No commands found for "{query}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-ui-bg/50 border-t border-ui-border flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Navigate</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 bg-ui-bg border border-ui-border rounded text-[9px] text-text-muted uppercase">↑</span>
                    <span className="px-1.5 py-0.5 bg-ui-bg border border-ui-border rounded text-[9px] text-text-muted uppercase">↓</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Execute</span>
                  <span className="px-1.5 py-0.5 bg-ui-bg border border-ui-border rounded text-[9px] text-text-muted uppercase italic">Enter</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <Command size={14} className="text-text-muted" />
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Institutional Access</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
