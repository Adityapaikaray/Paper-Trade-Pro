/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Briefcase, Activity, History as HistoryIcon, Bell, Trash2, Plus, Globe } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import StockChart from './StockChart.tsx';
import PortfolioGraph from './PortfolioGraph.tsx';
import NumberCounter from './NumberCounter.tsx';
import { Stock } from '../types.ts';

interface DashboardViewProps {
  onTrade: (stock: Stock) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onTrade }) => {
  const { profile, removePriceAlert, setPreferredCurrency } = usePortfolio();
  const { stocks, isLive } = useMarketData();
  const currency = profile.preferredCurrency!;

  const currencies = [
    { code: 'USD', symbol: '$', rate: 1 },
    { code: 'INR', symbol: '₹', rate: 83.2 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
    { code: 'EUR', symbol: '€', rate: 0.92 }
  ];

  const totalBalanceInSelectedCurrency = profile.balances[currency.symbol] || (profile.balances['$'] * currency.rate);

  const portfolioValue = profile.holdings.reduce((total, holding) => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (!stock) return total + (holding.averagePrice * holding.shares);
    
    // Convert stock price to selected currency if different
    const priceInSelectedCurrency = stock.currency === currency.symbol 
      ? stock.price 
      : (stock.currency === '$' ? stock.price * currency.rate : stock.price / 83.2 * currency.rate); // Simple conversion
      
    return total + (priceInSelectedCurrency * holding.shares);
  }, 0);

  const totalValue = portfolioValue + totalBalanceInSelectedCurrency;
  const totalProfit = profile.holdings.reduce((total, holding) => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (!stock) return total;
    
    const profit = (stock.price - holding.averagePrice) * holding.shares;
    const profitInSelectedCurrency = stock.currency === currency.symbol 
      ? profit 
      : (stock.currency === '$' ? profit * currency.rate : profit / 83.2 * currency.rate);
      
    return total + profitInSelectedCurrency;
  }, 0);

  const profitPercent = (totalProfit / (totalValue - totalProfit)) * 100;

  // Real-time value in USD for the graph
  const liveValueInUSD = profile.holdings.reduce((total, holding) => {
    const stock = stocks.find(s => s.symbol === holding.symbol);
    if (!stock) return total;
    const priceInUSD = stock.currency === '$' ? stock.price : stock.price / 83.2;
    return total + (priceInUSD * holding.shares);
  }, profile.balances['$'] + (profile.balances['₹'] / 83.2));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-indigo-950 tracking-tighter italic">Portfolio Pulse</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Live Simulation Performance Network</p>
            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
              isLive 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse' 
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {isLive ? 'Network Connected: Real-Time' : 'Standalone: Simulated'}
            </div>
          </div>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border-2 border-slate-100 flex items-center gap-1">
          <div className="px-3 text-slate-300">
            <Globe size={16} />
          </div>
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => setPreferredCurrency(c)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                currency.code === c.code 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Value', value: totalValue, icon: Wallet, color: 'text-indigo-900', sub: 'Calculated Net' },
          { label: 'Asset Value', value: portfolioValue, icon: Briefcase, color: 'text-indigo-700', sub: `${profile.holdings.length} Active Positions` },
          { label: 'Total P/L', value: totalProfit, icon: Activity, color: totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500', isPL: true },
          { label: 'Buying Power', value: totalBalanceInSelectedCurrency, icon: Wallet, color: 'text-indigo-600', sub: 'Unallocated Capital' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
            key={stat.label} 
            className="p-6 vibrant-card bg-white relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-100/50 transition-all cursor-default"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <stat.icon size={80} />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <stat.icon size={20} className="text-indigo-600" />
              </div>
              {stat.isPL && (
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${totalProfit >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                   {profitPercent.toFixed(2)}%
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <NumberCounter 
              value={stat.value} 
              prefix={currency.symbol} 
              className={`text-2xl font-mono font-black tabular-nums tracking-tight ${stat.color} block`}
            />
          </motion.div>
        ))}
      </div>

      <div className="vibrant-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-indigo-950 tracking-tight text-xl">Equity Trajectory</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Aggregated Capital Analytics</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-950 uppercase tracking-widest">Recording Market Sync</span>
          </div>
        </div>
        <div className="mb-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Protocol: Use the slider below to zoom & pan history</p>
        </div>
        <PortfolioGraph 
          history={profile.history} 
          currentValue={liveValueInUSD}
          currencySymbol={currency.symbol}
          currencyRate={currency.rate}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 vibrant-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-indigo-950 tracking-tight text-xl">Top Movers</h3>
            <button className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest">Market Feed</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.sort((a, b) => b.changePercent - a.changePercent).slice(0, 6).map((stock) => (
              <div 
                key={stock.symbol} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                onClick={() => onTrade(stock)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-900 border border-indigo-950 flex items-center justify-center font-black text-white text-lg italic shadow-md">
                    {stock.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-black text-indigo-950 tracking-tighter">{stock.symbol}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{stock.currency}{stock.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block">
                    <StockChart stock={stock} showDetails={false} />
                  </div>
                  <div className="text-right">
                    <div className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md inline-block ${stock.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 vibrant-card flex flex-col">
          <h3 className="font-black text-indigo-950 tracking-tight text-xl mb-8">Trade Log</h3>
          <div className="space-y-6 flex-1">
            {profile.transactions.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center opacity-20">
                <HistoryIcon className="text-indigo-900 mb-4" size={48} />
                <p className="text-xs font-black uppercase tracking-widest">Awaiting Activity</p>
              </div>
            ) : (
              profile.transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${tx.type === 'BUY' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {tx.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-indigo-950 tracking-tight">{tx.type} {tx.symbol}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600 font-mono italic">
                      {stocks.find(s => s.symbol === tx.symbol)?.currency || '$'}{(tx.shares * tx.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {profile.transactions.length > 0 && (
            <button className="mt-8 w-full py-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 transition-all">
              Full Archive
            </button>
          )}
        </div>
      </div>

      <div className="vibrant-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-amber-900 shadow-lg shadow-amber-100">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 tracking-tight text-xl">Sentinel Alerts</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Price Monitoring Network</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profile.alerts.filter(a => !a.triggered).length === 0 ? (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active sentinels deployed</p>
            </div>
          ) : (
            profile.alerts.filter(a => !a.triggered).map((alert) => (
              <div key={alert.id} className="p-5 rounded-2xl border-2 border-slate-50 bg-white hover:border-indigo-100 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-indigo-950 text-lg leading-none">{alert.symbol}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md ${alert.type === 'above' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      Target {alert.type}
                    </span>
                  </div>
                  <button 
                    onClick={() => removePriceAlert(alert.id)}
                    className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-mono font-black italic tracking-tighter text-indigo-600">
                    {stocks.find(s => s.symbol === alert.symbol)?.currency || '$'}{alert.threshold.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
