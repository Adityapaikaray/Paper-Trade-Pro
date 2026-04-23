/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Star, TrendingUp, TrendingDown, PlusCircle, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useMarketData } from '../hooks/useMarketData.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { Stock } from '../types.ts';
import AlertModal from './AlertModal.tsx';
import StockChart from './StockChart.tsx';

interface MarketViewProps {
  onTrade: (stock: Stock) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ onTrade }) => {
  const stocks = useMarketData();
  const { toggleWatchlist, isWatchlisted } = usePortfolio();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState('All');
  const [alertStock, setAlertStock] = React.useState<Stock | null>(null);
  const [expandedSymbol, setExpandedSymbol] = React.useState<string | null>(null);

  const countries = ['All', ...new Set(stocks.map(s => s.country))];

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || s.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const toggleExpand = (symbol: string) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-indigo-950 tracking-tighter italic">Live Exchange</h2>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Real-time Trading Simulation Engine</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCountry === country 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              {country}
            </button>
          ))}
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assets (e.g. NVDA, Apple)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-600 transition-all text-sm font-bold shadow-sm"
          />
        </div>
      </header>

      <div className="vibrant-card overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-ui-border">
              <th className="px-8 py-5 font-black">Market Asset</th>
              <th className="px-8 py-5 font-black">Last Price</th>
              <th className="px-8 py-5 font-black">24h Change</th>
              <th className="px-8 py-5 font-black">Trend</th>
              <th className="px-8 py-5 font-black">Market Cap</th>
              <th className="px-8 py-5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStocks.map((stock) => (
              <React.Fragment key={stock.symbol}>
                <tr 
                  className={`group hover:bg-indigo-50/30 transition-all cursor-pointer ${expandedSymbol === stock.symbol ? 'bg-indigo-50/50' : ''}`}
                  onClick={() => toggleExpand(stock.symbol)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(stock.symbol);
                        }}
                        className={`transition-all hover:scale-125 ${isWatchlisted(stock.symbol) ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                      >
                        <Star size={18} fill={isWatchlisted(stock.symbol) ? 'currentColor' : 'none'} />
                      </button>
                      <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">
                        {stock.symbol.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-indigo-950 tracking-tight">{stock.symbol}</p>
                          {expandedSymbol === stock.symbol ? <ChevronUp size={14} className="text-indigo-400" /> : <ChevronDown size={14} className="text-slate-300" />}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stock.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-black text-slate-900 tabular-nums text-lg italic tracking-tighter">
                    {stock.currency}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-lg text-xs ${stock.change >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StockChart stock={stock} showDetails={false} />
                  </td>
                  <td className="px-8 py-6 text-xs font-bold font-mono text-slate-400 uppercase tracking-tighter">{stock.marketCap}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlertStock(stock);
                        }}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Set Price Alert"
                      >
                        <Bell size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrade(stock);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all transform active:scale-95"
                      >
                        Trade
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedSymbol === stock.symbol && (
                  <tr>
                    <td colSpan={6} className="px-8 py-0 bg-slate-50/30">
                      <div className="py-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-black text-indigo-950 uppercase text-[10px] tracking-widest">Performance Insight</h4>
                            <p className="text-slate-400 text-[10px] font-bold">24-Hour Price Action Protocol</p>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Valuation</span>
                             <p className="text-xl font-mono font-black italic tracking-tighter text-indigo-600">{stock.currency}{stock.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm overflow-hidden relative">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[64px] -mr-8 -mt-8 opacity-50" />
                           <StockChart stock={stock} height={250} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredStocks.length === 0 && (
          <div className="py-20 text-center text-zinc-600 flex flex-col items-center">
            <Search size={40} className="mb-4 opacity-20" />
            <p>No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      <AlertModal 
        stock={alertStock} 
        onClose={() => setAlertStock(null)} 
      />
    </div>
  );
};

export default MarketView;
