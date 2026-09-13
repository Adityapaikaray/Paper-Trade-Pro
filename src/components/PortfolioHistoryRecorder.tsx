import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../contexts/MarketContext.tsx';

const PortfolioHistoryRecorder: React.FC = () => {
  const { profile, addHistoryPoint, marketContext } = usePortfolio();
  const { stocks } = useMarketData();
  
  const profileRef = useRef(profile);
  profileRef.current = profile;
  
  const stocksRef = useRef(stocks);
  stocksRef.current = stocks;

  const marketContextRef = useRef(marketContext);
  marketContextRef.current = marketContext;

  useEffect(() => {
    const recordPoint = () => {
      const currentProfile = profileRef.current;
      const currentStocks = stocksRef.current;
      if (!currentProfile || !currentStocks || currentStocks.length === 0) return;
      if (currentProfile.isPortfolioReset || (currentProfile.holdings || []).length === 0) return;

      const currencySymbol = marketContextRef.current === 'IN' ? '₹' : '$';
      const holdings = (currentProfile.holdings || []).filter(h => {
        const s = currentStocks.find(st => st.symbol.toUpperCase() === h.symbol.toUpperCase());
        return !s || s.currency === currencySymbol;
      });

      let investedCost = 0;
      let currentVal = 0;

      holdings.forEach(h => {
        const s = currentStocks.find(st => st.symbol.toUpperCase() === h.symbol.toUpperCase());
        const p = s ? s.price : h.averagePrice;
        investedCost += h.averagePrice * h.shares;
        currentVal += p * h.shares;
      });

      // Completely exclude available cash. Only record invested capital and current holdings value.
      if (investedCost > 0) {
        addHistoryPoint(investedCost, currentVal);
      }
    };

    // Record initial point
    recordPoint();

    // Sample history periodically every 30s
    const timer = setInterval(recordPoint, 30000);
    return () => clearInterval(timer);
  }, [addHistoryPoint]);

  return null;
};

export default PortfolioHistoryRecorder;
