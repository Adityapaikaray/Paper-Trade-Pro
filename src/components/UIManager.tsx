import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle, Crown, Search, TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { useUI } from '../contexts/UIContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import StockChart from './StockChart.tsx';
import ResetPortfolioModal from './ResetPortfolioModal.tsx';

// --- TOAST COMPONENT ---
const ToastContainer = () => {
  const { toasts, removeToast } = useUI();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border ${
                isSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                isError ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
                isWarning ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                'bg-ui-surface border-ui-border text-text-main'
              } backdrop-blur-md`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle size={18} />}
                {isError && <AlertCircle size={18} />}
                {isWarning && <AlertTriangle size={18} />}
                {toast.type === 'info' && <Info size={18} className="text-primary" />}
              </div>
              
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="text-xs font-bold text-text-main leading-tight mb-0.5">
                    {toast.title}
                  </p>
                )}
                <p className="text-xs font-medium opacity-90 leading-relaxed">{toast.message}</p>
              </div>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity mt-0.5 shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// --- UPGRADE MODAL ---
const UpgradeModal = () => {
  const { activeModal, closeModal, addToast } = useUI();
  
  if (activeModal !== 'upgrade') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-ui-bg/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-ui-surface border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden flex flex-col"
      >
        <button onClick={closeModal} className="absolute top-4 right-4 text-text-muted hover:text-text-main z-10 transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-8 text-center border-b border-ui-border bg-primary/5">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
            <Crown size={32} />
          </div>
          <h2 className="text-2xl font-serif font-black text-text-main italic mb-2">Upgrade to Pro</h2>
          <p className="text-sm text-text-muted">Unlock institutional-grade analytics, level 2 data, and real-time market insights.</p>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-ui-border bg-ui-bg/50 flex flex-col">
            <h3 className="text-lg font-bold text-text-main mb-1">Free Tier</h3>
            <p className="text-2xl font-mono text-text-muted mb-4">$0 <span className="text-xs">/mo</span></p>
            <ul className="text-sm text-text-muted space-y-2 mb-6 flex-1">
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Basic portfolio tracking</li>
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> End-of-day market data</li>
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-emerald-500" /> Standard charts</li>
            </ul>
            <button disabled className="w-full py-2.5 rounded-lg bg-ui-border text-text-muted text-sm font-bold opacity-50 cursor-not-allowed">
              Current Plan
            </button>
          </div>
          
          <div className="p-6 rounded-xl border border-primary/40 bg-primary/5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-ui-bg text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg">Recommended</div>
            <h3 className="text-lg font-bold text-primary mb-1">Pro Tier</h3>
            <p className="text-2xl font-mono text-text-main mb-4">$49 <span className="text-xs text-text-muted">/mo</span></p>
            <ul className="text-sm text-text-main space-y-2 mb-6 flex-1">
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-primary" /> Real-time level 2 data</li>
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-primary" /> Advanced AI Analytics</li>
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-primary" /> Options & Futures trading</li>
              <li className="flex gap-2 items-center"><CheckCircle size={14} className="text-primary" /> Priority API access</li>
            </ul>
            <button 
              onClick={() => {
                closeModal();
                addToast('Upgraded to Pro successfully!', 'success');
              }}
              className="w-full py-2.5 rounded-lg bg-primary text-ui-bg hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 text-sm font-bold"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- ADD POSITION MODAL ---
const AddPositionModal = () => {
  const { activeModal, closeModal, addToast } = useUI();
  const { executeTrade, marketContext } = usePortfolio();
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (activeModal !== 'add-position') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const shares = parseFloat(quantity);
    const p = parseFloat(price);
    if (!ticker.trim() || isNaN(shares) || shares <= 0 || isNaN(p) || p <= 0) {
      setLoading(false);
      addToast('Please enter valid position details', 'error');
      return;
    }

    const cur = marketContext === 'IN' ? '₹' : '$';
    const mockStock: any = {
      symbol: ticker.trim().toUpperCase(),
      name: `${ticker.trim().toUpperCase()} Corp`,
      price: p,
      change: 0,
      changePercent: 0,
      volume: '100K',
      marketCap: '1B',
      currency: cur,
      country: marketContext === 'IN' ? 'India' : 'USA',
    };

    const success = executeTrade(mockStock, shares, 'BUY', 'Market');
    setLoading(false);
    if (success) {
      closeModal();
      setTicker('');
      setQuantity('');
      setPrice('');
      addToast(`Added position: ${shares} shares of ${ticker.toUpperCase()} at ${cur}${p.toFixed(2)}`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-ui-bg/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-md bg-ui-surface border border-ui-border rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-serif font-black italic text-text-main mb-6">Add Position</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Asset Ticker</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. AAPL or RELIANCE" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-ui-bg border border-ui-border rounded-lg p-2.5 text-sm focus:border-primary outline-none uppercase transition-colors" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Quantity</label>
              <input 
                required 
                type="number" 
                min="0.01" 
                step="any" 
                placeholder="10" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-ui-bg border border-ui-border rounded-lg p-2.5 text-sm focus:border-primary outline-none transition-colors" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Avg Price</label>
              <input 
                required 
                type="number" 
                min="0.01" 
                step="any" 
                placeholder="150.00" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-ui-bg border border-ui-border rounded-lg p-2.5 text-sm focus:border-primary outline-none transition-colors" 
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-lg border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors text-sm font-bold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-primary text-ui-bg hover:bg-primary-light font-bold text-sm transition-all flex items-center justify-center">
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-ui-bg border-t-transparent animate-spin" /> : 'Confirm Position'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- ASSET DETAILS DRAWER ---
const AssetDetailsDrawer = () => {
  const { activeModal, modalData, closeModal, openModal } = useUI();
  
  if (activeModal !== 'asset-details' || !modalData?.stock) return null;

  const { stock, holding } = modalData;
  const isPositive = stock.change >= 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-ui-bg/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 1 }}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.x > 100 || velocity.x > 300) {
            closeModal();
          }
        }}
        className="relative w-full md:w-[480px] h-full bg-ui-surface border-l border-ui-border shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-ui-border flex items-center justify-between sticky top-0 bg-ui-surface z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ui-bg border border-ui-border flex items-center justify-center text-text-main text-lg font-serif italic shadow-sm">
              {stock.symbol.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-black italic text-text-main">{stock.symbol}</h2>
              <p className="text-xs text-text-muted">{stock.name}</p>
            </div>
          </div>
          <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full bg-ui-bg border border-ui-border text-text-muted hover:text-text-main transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Current Price</p>
              <h3 className="text-4xl font-mono font-black italic text-text-main">
                {stock.currency || '$'}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Today's Change</p>
              <p className={`text-lg font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <StockChart stock={stock} showDetails={true} showTimeframes={true} />
          </div>

          {holding && (
            <div className="bg-ui-bg rounded-2xl border border-ui-border p-5 space-y-4">
              <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Briefcase size={14} className="text-primary" /> Your Position
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Quantity</p>
                  <p className="text-sm font-mono font-bold text-text-main">{holding.shares} Shares</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Average Cost</p>
                  <p className="text-sm font-mono font-bold text-text-main">{stock.currency || '$'}{holding.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Market Value</p>
                  <p className="text-sm font-mono font-bold text-text-main">{stock.currency || '$'}{(stock.price * holding.shares).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-text-muted mb-1">Unrealized P/L</p>
                  <p className={`text-sm font-mono font-bold ${((stock.price - holding.averagePrice) * holding.shares) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {((stock.price - holding.averagePrice) * holding.shares) >= 0 ? '+' : ''}{stock.currency || '$'}{((stock.price - holding.averagePrice) * holding.shares).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-text-main">Key Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between border-b border-ui-border pb-2">
                <span className="text-xs text-text-muted">Market Cap</span>
                <span className="text-xs font-mono text-text-main">{stock.marketCap}</span>
              </div>
              <div className="flex justify-between border-b border-ui-border pb-2">
                <span className="text-xs text-text-muted">Volume</span>
                <span className="text-xs font-mono text-text-main">{stock.volume}</span>
              </div>
              <div className="flex justify-between border-b border-ui-border pb-2">
                <span className="text-xs text-text-muted">Day High</span>
                <span className="text-xs font-mono text-text-main">{stock.dayHigh ? stock.dayHigh.toFixed(2) : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-ui-border pb-2">
                <span className="text-xs text-text-muted">Day Low</span>
                <span className="text-xs font-mono text-text-main">{stock.dayLow ? stock.dayLow.toFixed(2) : '-'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-ui-border bg-ui-surface grid grid-cols-2 gap-4">
           <button onClick={() => {
             closeModal();
             setTimeout(() => openModal('modify-allocation', { stock, holding }), 300);
           }} className="py-3 rounded-xl border border-ui-border text-text-main font-bold hover:bg-ui-surface-hover transition-colors text-sm hover:scale-[0.98] active:scale-95 duration-200">Modify Allocation</button>
           <button onClick={() => {
             closeModal();
             // Open Trade modal logic could go here via context/event
             // For now, we simulate success
             setTimeout(() => openModal('add-position'), 300);
           }} className="py-3 rounded-xl bg-primary text-ui-bg font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 text-sm hover:scale-[0.98] active:scale-95 duration-200">Trade {stock.symbol}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MODIFY ALLOCATION MODAL ---
const ModifyAllocationModal = () => {
  const { activeModal, modalData, closeModal, addToast } = useUI();
  const { modifyHoldingAllocation } = usePortfolio();
  const [allocation, setAllocation] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (modalData?.currentAllocation !== undefined) {
      setAllocation(modalData.currentAllocation);
    }
  }, [modalData]);

  if (activeModal !== 'modify-allocation') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const sym = modalData?.stock?.symbol || modalData?.symbol;
    if (sym) {
      modifyHoldingAllocation(sym, allocation);
    }
    setTimeout(() => {
      setLoading(false);
      closeModal();
      addToast(`Target allocation for ${sym || 'Asset'} updated to ${allocation}%`, 'success');
    }, 400);
  };

  const currentAllocation = modalData?.currentAllocation || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-ui-bg/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-ui-surface border border-ui-border rounded-3xl shadow-2xl p-8"
      >
        <button onClick={closeModal} className="absolute top-6 right-6 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-serif font-black italic text-text-main mb-2">Modify Allocation</h2>
        <p className="text-sm text-text-muted mb-8">Target allocation for <span className="font-bold text-text-main">{modalData?.stock?.symbol || 'Asset'}</span></p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex justify-center mb-4">
             <div className="w-32 h-32 rounded-full border-[12px] border-ui-border relative flex items-center justify-center">
               <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 absolute top-0 left-0 drop-shadow-2xl">
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${allocation}, 100`} className="text-primary transition-all duration-300" />
               </svg>
               <div className="text-center">
                 <span className="text-2xl font-mono font-black italic text-text-main">{allocation}%</span>
               </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-wider">
              <span>0%</span>
              <span className="text-primary">{allocation}% Target</span>
              <span>100%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={allocation}
              onChange={(e) => setAllocation(Number(e.target.value))}
              className="w-full h-2 bg-ui-border rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-ui-border bg-ui-bg/50">
               <p className="text-[10px] font-black uppercase text-text-muted tracking-wider mb-1">Current</p>
               <p className="text-lg font-mono font-bold text-text-main">{currentAllocation}%</p>
            </div>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
               <p className="text-[10px] font-black uppercase text-primary/80 tracking-wider mb-1">Target</p>
               <p className="text-lg font-mono font-bold text-primary">{allocation}%</p>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => { setAllocation(currentAllocation); }} className="px-6 py-3 rounded-xl border border-ui-border text-text-main hover:bg-ui-surface-hover transition-colors text-sm font-bold">
              Reset
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-primary text-ui-bg hover:bg-primary-light hover:shadow-lg hover:shadow-primary/20 transition-all text-sm font-bold flex items-center justify-center hover:scale-[0.98] active:scale-95 duration-200">
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-ui-bg border-t-transparent animate-spin" />
              ) : (
                'Save Allocation'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- MANAGER COMPONENT ---
export const UIManager = () => {
  const { activeModal } = useUI();
  
  // Trap escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // We'll let specific modals handle it via their own hooks or the context directly.
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <ToastContainer />
      <AnimatePresence mode="wait">
        {activeModal === 'upgrade' && <UpgradeModal key="upgrade" />}
        {activeModal === 'add-position' && <AddPositionModal key="add-pos" />}
        {activeModal === 'asset-details' && <AssetDetailsDrawer key="asset-details" />}
        {activeModal === 'modify-allocation' && <ModifyAllocationModal key="modify-allocation" />}
        {activeModal === 'reset-portfolio' && <ResetPortfolioModal key="reset-portfolio" />}
      </AnimatePresence>
    </>
  );
};
