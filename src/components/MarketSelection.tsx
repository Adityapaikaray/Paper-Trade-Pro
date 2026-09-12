import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { MarketRegion } from '../types.ts';

interface MarketSelectionProps {
  onComplete: () => void;
}

const MarketSelection: React.FC<MarketSelectionProps> = ({ onComplete }) => {
  const { setMarketContext } = usePortfolio();
  const [hoveredCard, setHoveredCard] = useState<MarketRegion | null>(null);
  const [selectedCard, setSelectedCard] = useState<MarketRegion | null>(null);

  const handleSelect = (market: MarketRegion) => {
    setSelectedCard(market);
    setTimeout(() => {
      setMarketContext(market);
      onComplete();
    }, 600);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg overflow-y-auto"
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-sm md:text-base font-black tracking-widest text-primary-light mb-4 uppercase">
            TRADEPRO
          </h2>
          <h1 className="text-3xl md:text-5xl font-serif text-text-main mb-6">
            Where do you want to trade?
          </h1>
          <p className="text-text-muted text-sm md:text-base max-w-xl mx-auto">
            Start with virtual money. Practice, analyze, and trade without risking real capital.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* INDIA CARD */}
          <motion.div
            onMouseEnter={() => setHoveredCard('IN')}
            onMouseLeave={() => setHoveredCard(null)}
            animate={{
              y: hoveredCard === 'IN' ? -4 : 0,
              opacity: selectedCard === 'US' ? 0.3 : 1,
              scale: selectedCard === 'IN' ? 1.02 : 1
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              relative p-8 rounded-3xl border-2 transition-colors duration-300 flex flex-col
              ${selectedCard === 'IN' ? 'border-[#D4AF37] bg-ui-surface shadow-2xl' : 'border-ui-border bg-ui-surface hover:border-[#D4AF37]/50'}
            `}
          >
            {selectedCard === 'IN' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg text-ui-bg"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🇮🇳</span>
              <div>
                <h3 className="text-2xl font-serif text-text-main">Indian Markets</h3>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase">NSE &bull; BSE</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-3xl md:text-4xl font-mono font-black text-text-main">
                ₹10,00,000
              </p>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                VIRTUAL BALANCE
              </p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Paper trading balance</p>
            </div>

            <div className="flex-1">
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                {['NIFTY 50', 'SENSEX', 'NSE Stocks', 'BSE Stocks', 'ETFs', 'Indian Equities'].map(item => (
                  <li key={item} className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37]/50"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={() => handleSelect('IN')}
                className="w-full py-4 rounded-xl bg-text-main text-ui-bg font-bold tracking-wide hover:bg-[#D4AF37] transition-colors"
              >
                Start Indian Trading &rarr;
              </button>
              <button onClick={() => handleSelect('IN')} className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">
                Explore Indian Markets
              </button>
            </div>
          </motion.div>

          {/* US CARD */}
          <motion.div
            onMouseEnter={() => setHoveredCard('US')}
            onMouseLeave={() => setHoveredCard(null)}
            animate={{
              y: hoveredCard === 'US' ? -4 : 0,
              opacity: selectedCard === 'IN' ? 0.3 : 1,
              scale: selectedCard === 'US' ? 1.02 : 1
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              relative p-8 rounded-3xl border-2 transition-colors duration-300 flex flex-col
              ${selectedCard === 'US' ? 'border-[#D4AF37] bg-ui-surface shadow-2xl' : 'border-ui-border bg-ui-surface hover:border-[#D4AF37]/50'}
            `}
          >
            {selectedCard === 'US' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 -right-4 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg text-ui-bg"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🇺🇸</span>
              <div>
                <h3 className="text-2xl font-serif text-text-main">US Markets</h3>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase">NYSE &bull; NASDAQ</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-3xl md:text-4xl font-mono font-black text-text-main">
                $1,000,000
              </p>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                VIRTUAL BALANCE
              </p>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Paper trading balance</p>
            </div>

            <div className="flex-1">
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                {['S&P 500', 'NASDAQ', 'NYSE Stocks', 'NASDAQ Stocks', 'US ETFs', 'US Equities'].map(item => (
                  <li key={item} className="text-sm font-medium text-text-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#D4AF37]/50"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={() => handleSelect('US')}
                className="w-full py-4 rounded-xl bg-text-main text-ui-bg font-bold tracking-wide hover:bg-[#D4AF37] transition-colors"
              >
                Start US Trading &rarr;
              </button>
              <button onClick={() => handleSelect('US')} className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">
                Explore US Markets
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketSelection;
