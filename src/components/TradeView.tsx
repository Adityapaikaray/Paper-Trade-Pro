import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle, Plus, Minus, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
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

type OrderType = 'Market' | 'Limit' | 'Stop-Loss';
type TradeStep = 'FORM' | 'REVIEW' | 'SUCCESS';

const TradeView: React.FC<TradeViewProps> = ({ stock, onClose, onBack, initialSide }) => {
  const { profile, executeTrade, summary } = usePortfolio();
  const { stocks, priceTicks, isLive } = useMarketData();
  
  const [step, setStep] = useState<TradeStep>('FORM');
  const [type, setType] = useState<'BUY' | 'SELL'>(initialSide || 'BUY');
  const [shares, setShares] = useState<number>(1);
  const [sharesInput, setSharesInput] = useState<string>('1');
  const [orderType, setOrderType] = useState<OrderType>('Market');
  const [limitPrice, setLimitPrice] = useState<string>('');
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialSide) setType(initialSide);
  }, [initialSide, stock]);

  if (!stock) return null;

  const liveStock = stocks.find(s => s.symbol === stock.symbol) || stock;
  const tick = priceTicks[liveStock.symbol];
  
  const holding = (profile.holdings || []).find(h => h.symbol === liveStock.symbol);
  const currentShares = holding?.shares || 0;
  const availableCash = summary.availableCash || 0;

  // Prices and Totals
  const currentPrice = liveStock.price;
  const parsedLimitPrice = parseFloat(limitPrice);
  const estimatedPrice = orderType === 'Market' || isNaN(parsedLimitPrice) ? currentPrice : parsedLimitPrice;
  const estimatedTotal = shares * estimatedPrice;
  const isPositive = liveStock.change >= 0;

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    if (shares <= 0) {
      errors.push("Quantity must be greater than 0");
    }
    
    if (type === 'BUY' && estimatedTotal > availableCash) {
      errors.push(`Insufficient cash. You need ${liveStock.currency}${estimatedTotal.toLocaleString()} but only ${liveStock.currency}${availableCash.toLocaleString()} is available.`);
    }
    
    if (type === 'SELL' && shares > currentShares) {
      errors.push(`Insufficient shares. You are trying to sell ${shares} but only own ${currentShares}.`);
    }

    if (orderType !== 'Market' && (isNaN(parsedLimitPrice) || parsedLimitPrice <= 0)) {
      errors.push(`Please enter a valid ${orderType === 'Limit' ? 'Limit' : 'Stop'} price.`);
    }
    
    setValidationErrors(errors);
  }, [shares, type, orderType, limitPrice, currentPrice, estimatedTotal, availableCash, currentShares, liveStock.currency]);

  const handleSharesChange = (val: string) => {
    setSharesInput(val);
    const num = parseInt(val);
    if (!isNaN(num)) {
      setShares(num);
    } else {
      setShares(0);
    }
  };

  const incrementShares = () => {
    const newVal = shares + 1;
    setShares(newVal);
    setSharesInput(newVal.toString());
  };

  const decrementShares = () => {
    if (shares > 1) {
      const newVal = shares - 1;
      setShares(newVal);
      setSharesInput(newVal.toString());
    }
  };

  const handleReview = () => {
    if (validationErrors.length === 0) {
      setStep('REVIEW');
    }
  };

  const handleConfirm = () => {
    try {
      const success = executeTrade(
        liveStock, 
        shares, 
        type, 
        orderType, 
        orderType !== 'Market' ? parsedLimitPrice : undefined
      );
      if (success) {
        setStep('SUCCESS');
      } else {
        // Fallback error, should be caught by validation
        alert("Trade failed to execute.");
      }
    } catch (e: any) {
      alert(e.message || "Trade failed");
    }
  };

  const formatCurrency = (val: number) => `${liveStock.currency}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="w-full h-full max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      
      {/* Header / Back */}
      <div className="flex items-center justify-between mb-6 px-2 md:px-0 mt-2">
        <button 
          onClick={onBack || onClose}
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors py-2 -ml-2"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span className="font-bold tracking-wide">Back</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {step === 'SUCCESS' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-8 min-h-[60vh] max-w-lg mx-auto"
          >
            <div className="w-24 h-24 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center text-positive shadow-[0_0_40px_rgba(16,185,129,0.2)]">
              <CheckCircle size={48} strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black text-text-main tracking-tight mb-2">Order Submitted</h2>
              <p className="text-sm font-bold text-text-muted">
                {liveStock.symbol} • {type === 'BUY' ? 'Buy' : 'Sell'} • {shares} Shares
              </p>
            </div>
            
            <div className="bg-ui-surface w-full p-6 rounded-2xl border border-ui-border space-y-4 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-text-muted">Status</span>
                <span className="font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider text-xs">Pending</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-ui-border pt-4">
                <span className="font-bold text-text-muted">Order Type</span>
                <span className="font-bold text-text-main">{orderType}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-ui-border pt-4">
                <span className="font-bold text-text-muted">Estimated Total</span>
                <span className="font-mono font-bold text-text-main text-lg">{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full pt-4">
              <button 
                onClick={onBack || onClose}
                className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all"
              >
                Back to Portfolio
              </button>
            </div>
          </motion.div>
        )}

        {step === 'REVIEW' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-ui-surface border border-ui-border rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-serif font-black text-text-main mb-6 text-center">Review Order</h2>
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${type === 'BUY' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                  {liveStock.symbol.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-text-main text-xl">{liveStock.symbol}</h3>
                  <p className={`text-sm font-bold uppercase tracking-widest ${type === 'BUY' ? 'text-positive' : 'text-negative'}`}>
                    {type}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-muted">Quantity</span>
                  <span className="font-mono font-bold text-text-main">{shares} Shares</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-muted">Order Type</span>
                  <span className="font-bold text-text-main">{orderType}</span>
                </div>
                {orderType !== 'Market' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-muted">{orderType} Price</span>
                    <span className="font-mono font-bold text-text-main">{formatCurrency(parsedLimitPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-muted">Estimated Price</span>
                  <span className="font-mono font-bold text-text-main">{formatCurrency(estimatedPrice)}</span>
                </div>
                <div className="pt-4 border-t border-ui-border flex justify-between items-center">
                  <span className="text-base font-black text-text-main">Estimated Total</span>
                  <span className="font-mono font-bold text-xl text-text-main">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  className={`w-full py-4 rounded-xl font-bold text-base transition-colors ${
                    type === 'BUY' ? 'bg-positive hover:bg-positive/90 text-white' : 'bg-negative hover:bg-negative/90 text-white'
                  }`}
                >
                  Confirm {type}
                </button>
                <button
                  onClick={() => setStep('FORM')}
                  className="w-full py-4 rounded-xl font-bold text-base bg-ui-bg border border-ui-border text-text-muted hover:text-text-main transition-colors"
                >
                  Edit Order
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'FORM' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
          >
            {/* Left Column: Info & Chart */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              
              {/* Header Info Card */}
              <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center font-bold text-lg text-text-main shrink-0">
                      {liveStock.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold font-sans text-text-main leading-tight mb-1">{liveStock.symbol}</h1>
                      <p className="text-sm font-bold text-text-muted truncate max-w-[200px] sm:max-w-sm">{liveStock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl md:text-3xl font-mono font-bold tracking-tight ${tick?.type === 'up' ? 'text-positive' : tick?.type === 'down' ? 'text-negative' : 'text-text-main'} transition-colors duration-300`}>
                      {liveStock.currency}{liveStock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {isPositive ? '+' : ''}{liveStock.change.toFixed(2)} ({isPositive ? '+' : ''}{liveStock.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>

                {/* Market Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4 border-t border-ui-border/60">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-positive animate-pulse' : 'bg-ui-border'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{isLive ? 'Market Live' : 'Closed'}</span>
                    </div>
                    <span className="text-[9px] text-text-muted font-mono">{liveStock.lastUpdated ? new Date(liveStock.lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Day High</p>
                    <p className="text-xs font-mono font-bold text-text-main">{formatCurrency(liveStock.dayHigh || liveStock.price * 1.01)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Day Low</p>
                    <p className="text-xs font-mono font-bold text-text-main">{formatCurrency(liveStock.dayLow || liveStock.price * 0.99)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">52W High</p>
                    <p className="text-xs font-mono font-bold text-text-main">{formatCurrency(liveStock.fiftyTwoWeekHigh || liveStock.price * 1.2)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">52W Low</p>
                    <p className="text-xs font-mono font-bold text-text-main">{formatCurrency(liveStock.fiftyTwoWeekLow || liveStock.price * 0.8)}</p>
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="h-[250px] md:h-[350px] w-full">
                  <StockChart stock={liveStock} showDetails={false} showTimeframes={true} />
                </div>
              </div>
            </div>

            {/* Right Column: Trading Panel */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              <div className="bg-ui-surface border border-ui-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xl sticky top-24">
                
                {/* Buy / Sell Toggle */}
                <div className="flex p-1 bg-ui-bg rounded-xl mb-6 border border-ui-border">
                  <button
                    onClick={() => setType('BUY')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-widest ${
                      type === 'BUY' 
                        ? 'bg-positive text-white shadow-md' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setType('SELL')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all uppercase tracking-widest ${
                      type === 'SELL' 
                        ? 'bg-negative text-white shadow-md' 
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quantity */}
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Quantity</label>
                    <div className="flex items-center justify-between bg-ui-bg border border-ui-border rounded-xl p-1.5 focus-within:border-primary/50 transition-colors">
                      <button 
                        onClick={decrementShares}
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-ui-surface text-text-main hover:bg-ui-border transition-colors shadow-sm"
                      >
                        <Minus size={18} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={sharesInput}
                        onChange={(e) => handleSharesChange(e.target.value)}
                        className="flex-1 bg-transparent text-center text-xl font-mono font-bold text-text-main focus:outline-none w-full"
                      />
                      <button 
                        onClick={incrementShares}
                        className="w-10 h-10 rounded-lg flex items-center justify-center bg-ui-surface text-text-main hover:bg-ui-border transition-colors shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div>
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Order Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Market', 'Limit', 'Stop-Loss'] as OrderType[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setOrderType(t)}
                          className={`py-2 text-xs font-bold rounded-lg transition-colors border ${
                            orderType === t 
                              ? 'bg-primary/10 border-primary/50 text-primary' 
                              : 'bg-ui-bg border-ui-border text-text-muted hover:border-ui-border/80 hover:text-text-main'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditional Price Fields */}
                  {orderType !== 'Market' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                        {orderType === 'Limit' ? 'Limit Price' : 'Stop Price'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-mono font-bold">{liveStock.currency}</span>
                        <input
                          type="number"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          placeholder={currentPrice.toString()}
                          className="w-full bg-ui-bg border border-ui-border rounded-xl py-3 pl-8 pr-4 text-sm font-mono font-bold focus:outline-none focus:border-primary/50 text-text-main"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Order Summary */}
                  <div className="bg-ui-bg border border-ui-border rounded-xl p-4 space-y-3">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Order Summary</h3>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-main">{type === 'BUY' ? 'Buy' : 'Sell'} {liveStock.symbol}</span>
                      <span className="text-sm font-mono font-bold text-text-main">{shares} {shares === 1 ? 'Share' : 'Shares'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">{orderType} Order</span>
                      <span className="text-sm font-mono text-text-muted">{formatCurrency(estimatedPrice)} per share</span>
                    </div>
                    
                    <div className="h-px bg-ui-border w-full" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-muted">Estimated Total</span>
                      <span className="text-lg font-mono font-bold text-text-main">{formatCurrency(estimatedTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-muted">{type === 'BUY' ? 'Available Cash' : 'Available Shares'}</span>
                      <span className="text-xs font-mono font-bold text-text-main">
                        {type === 'BUY' ? formatCurrency(availableCash) : `${currentShares} Shares`}
                      </span>
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-negative/10 border border-negative/20 rounded-xl p-3 flex gap-3 items-start">
                      <AlertCircle size={16} className="text-negative shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        {validationErrors.map((err, i) => (
                          <p key={i} className="text-xs font-bold text-negative leading-tight">{err}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={handleReview}
                    disabled={validationErrors.length > 0}
                    className={`w-full py-4 rounded-xl font-bold text-sm md:text-base uppercase tracking-wider transition-all flex items-center justify-center ${
                      validationErrors.length > 0 
                        ? 'bg-ui-border text-text-muted cursor-not-allowed'
                        : type === 'BUY' 
                          ? 'bg-positive hover:bg-positive/90 text-white shadow-lg shadow-positive/20' 
                          : 'bg-negative hover:bg-negative/90 text-white shadow-lg shadow-negative/20'
                    }`}
                  >
                    {type === 'BUY' ? 'Buy' : 'Sell'} {shares} {shares === 1 ? 'Share' : 'Shares'}
                  </button>

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
