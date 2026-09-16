import React from 'react';
import { ArrowLeft, Star, MoreVertical, CheckCircle, Plus, Minus, TrendingUp, TrendingDown, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stock } from '../types.ts';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';
import StockChart from './StockChart.tsx';

interface TradeViewProps {
  stock: Stock | null;
  onClose: () => void;
  onBack?: () => void;
  initialSide?: 'BUY' | 'SELL';
}

const TradeView: React.FC<TradeViewProps> = ({ stock, onClose, onBack, initialSide }) => {
  const { profile, buyStock, sellStock } = usePortfolio();
  const { stocks, priceTicks, isLive } = useMarketData();
  
  const [type, setType] = React.useState<'BUY' | 'SELL'>(initialSide || 'BUY');
  const [shares, setShares] = React.useState<number>(1);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (initialSide) {
      setType(initialSide);
    }
  }, [initialSide, stock]);

  if (!stock) return null;

  // Always use the latest live stock data if available
  const liveStock = stocks.find(s => s.symbol === stock.symbol) || stock;
  const tick = priceTicks[liveStock.symbol];
  
  const total = liveStock.price * shares;
  const holding = (profile?.holdings || []).find(h => h.symbol === liveStock.symbol);
  const currentShares = holding?.shares || 0;

  const handleAction = () => {
    if (shares <= 0) {
      setMessage({ text: 'Please enter a valid amount of shares.', type: 'error' });
      return;
    }

    let success = false;
    if (type === 'BUY') {
      success = buyStock(liveStock, shares);
      if (!success) setMessage({ text: 'Insufficient balance to complete the trade.', type: 'error' });
    } else {
      success = sellStock(liveStock, shares);
      if (!success) setMessage({ text: 'Insufficient shares to complete the trade.', type: 'error' });
    }

    if (success) {
      setIsSuccess(true);
      setTimeout(onClose, 3000);
    }
  };

  const handleIncrement = () => setShares(prev => prev + 1);
  const handleDecrement = () => setShares(prev => (prev > 1 ? prev - 1 : 1));

  const dayLow = liveStock.dayLow ?? (liveStock.price * 0.985);
  const dayHigh = liveStock.dayHigh ?? (liveStock.price * 1.015);
  const rangeSpan = dayHigh - dayLow;
  const rangePercent = rangeSpan > 0 ? Math.min(100, Math.max(0, ((liveStock.price - dayLow) / rangeSpan) * 100)) : 50;
  
  const isPositive = liveStock.change >= 0;

  return (
    <div className="w-full h-full animate-in fade-in duration-300 relative">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center space-y-8 min-h-[60vh] max-w-lg mx-auto"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(197,160,89,0.2)]">
              <CheckCircle size={48} strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-4xl font-serif italic text-text-main tracking-tight leading-none">Order Executed</h2>
              <p className="text-[10px] font-black text-text-muted mt-4 uppercase tracking-[0.3em] italic">
                Successfully {type === 'BUY' ? 'purchased' : 'sold'} {shares} units of {liveStock.symbol}
              </p>
            </div>
            <div className="bg-ui-surface w-full p-8 rounded-[2.5rem] border border-ui-border space-y-4 text-left">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                <span>Asset Protocol</span>
                <span className="text-text-main font-bold">{liveStock.symbol}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                <span>Volume Allocated</span>
                <span className="text-text-main font-bold">{shares} Priority Units</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-text-muted pt-5 border-t border-ui-border">
                <span>Aggregate {type === 'BUY' ? 'Obligation' : 'Proceeds'}</span>
                <span className="text-xl text-primary font-mono italic">
                  {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="trade"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto pb-12"
          >
            {/* Desktop Back Navigation */}
            <div className="hidden md:flex items-center justify-between mb-8">
              <button 
                onClick={onBack || onClose}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-bold text-sm uppercase tracking-wider"
              >
                <ArrowLeft size={18} />
                Back to Markets
              </button>
            </div>

            {/* Mobile Compact Header */}
            <div className="md:hidden flex items-center justify-between mb-6 px-1">
              <button onClick={onBack || onClose} className="p-2 -ml-2 text-text-main hover:text-primary transition-colors">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-sm font-bold tracking-widest uppercase">Stock Details</h1>
              <div className="flex items-center gap-2 -mr-2">
                <button className="p-2 text-text-muted hover:text-primary transition-colors"><Star size={20} /></button>
                <button className="p-2 text-text-muted hover:text-text-main transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Chart & Info */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {/* Stock Price Header */}
                <div className="bg-ui-surface border border-ui-border rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-bold font-sans text-text-main">{liveStock.symbol}</h2>
                        <span className="px-2.5 py-0.5 rounded bg-ui-bg border border-ui-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          {liveStock.sector}
                        </span>
                      </div>
                      <p className="text-text-muted text-sm mt-1">{liveStock.name}</p>
                    </div>
                    {isLive && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-end gap-4">
                    <p className={`text-4xl md:text-5xl font-mono font-bold tracking-tight ${tick?.type === 'up' ? 'text-positive' : tick?.type === 'down' ? 'text-negative' : 'text-text-main'} transition-colors duration-300`}>
                      {liveStock.currency}{liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm md:text-base font-mono font-bold mb-1 flex items-center gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {isPositive ? '+' : ''}{liveStock.change.toFixed(2)} ({isPositive ? '+' : ''}{liveStock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-ui-surface border border-ui-border rounded-[2rem] p-6 shadow-sm">
                  <div className="h-[250px] md:h-[350px] w-full">
                    <StockChart stock={liveStock} showDetails={false} showTimeframes={true} />
                  </div>
                  
                  {/* Day Range */}
                  <div className="mt-8">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-text-muted mb-2">
                      <span>Day Low: {liveStock.currency}{dayLow.toFixed(2)}</span>
                      <span>Day High: {liveStock.currency}{dayHigh.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-ui-bg rounded-full overflow-hidden relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-ui-border rounded-full" style={{ width: '100%' }} />
                      <div className="absolute top-0 bottom-0 bg-primary shadow-[0_0_10px_rgba(197,160,89,0.5)] rounded-full transition-all duration-500" 
                           style={{ left: '0%', width: `${rangePercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Trading Panel */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="bg-ui-surface border border-ui-border rounded-[2rem] p-6 md:p-8 shadow-sm">
                  
                  {/* Buy / Sell Toggle */}
                  <div className="flex p-1 bg-ui-bg rounded-2xl mb-8 border border-ui-border">
                    <button
                      onClick={() => { setType('BUY'); setMessage(null); }}
                      className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all uppercase tracking-wider ${
                        type === 'BUY' 
                          ? 'bg-[#00D084] text-black shadow-md' 
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => { setType('SELL'); setMessage(null); }}
                      className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all uppercase tracking-wider ${
                        type === 'SELL' 
                          ? 'bg-[#FF4D4D] text-white shadow-md' 
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Sell
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Quantity Control */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted block mb-3 text-center">
                        Quantity (Shares)
                      </label>
                      <div className="flex items-center justify-between bg-ui-bg border border-ui-border rounded-2xl p-2">
                        <button 
                          onClick={handleDecrement}
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-ui-surface text-text-main hover:bg-ui-border transition-colors shadow-sm"
                        >
                          <Minus size={20} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={shares}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setShares(isNaN(val) ? 0 : val);
                          }}
                          className="flex-1 bg-transparent text-center text-3xl font-mono font-bold text-text-main focus:outline-none"
                        />
                        <button 
                          onClick={handleIncrement}
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-ui-surface text-text-main hover:bg-ui-border transition-colors shadow-sm"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Estimated Total */}
                    <div className="bg-ui-bg border border-ui-border rounded-2xl p-5 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">
                        Estimated Total
                      </span>
                      <span className="text-3xl font-mono font-bold text-text-main">
                        {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {message && (
                      <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-negative/10 text-negative border border-negative/20' : 'bg-positive/10 text-positive border border-positive/20'}`}>
                        {message.text}
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={handleAction}
                      className={`w-full py-5 rounded-2xl font-bold text-sm md:text-base uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 ${
                        type === 'BUY' 
                          ? 'bg-[#00D084] hover:bg-[#00D084]/90 text-black' 
                          : 'bg-[#FF4D4D] hover:bg-[#FF4D4D]/90 text-white'
                      }`}
                    >
                      {type === 'BUY' ? 'Buy' : 'Sell'} {shares} {shares === 1 ? 'Share' : 'Shares'}
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted mb-2">Available Cash</p>
                    <p className="text-base font-mono font-bold text-text-main">{liveStock.currency}{(profile?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-ui-surface border border-ui-border rounded-2xl p-5 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted mb-2">Current Position</p>
                    <p className="text-base font-mono font-bold text-text-main">{currentShares} Shares</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TradeView;
