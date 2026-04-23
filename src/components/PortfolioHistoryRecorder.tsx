/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext.tsx';
import { useMarketData } from '../hooks/useMarketData.ts';

const PortfolioHistoryRecorder: React.FC = () => {
  const { profile, addHistoryPoint } = usePortfolio();
  const { stocks } = useMarketData();
  const lastRecordTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    // Record every 3 seconds at most
    if (lastRecordTime.current !== 0 && now - lastRecordTime.current < 3000) return;

    // Calculate total value in USD for consistency in the graph
    const portfolioValueInUSD = profile.holdings.reduce((total, holding) => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      if (!stock) return total;
      
      const priceInUSD = stock.currency === '$' ? stock.price : stock.price / 83.2;
      return total + (priceInUSD * holding.shares);
    }, 0);

    const balanceInUSD = profile.balances['$'] + (profile.balances['₹'] / 83.2);
    const totalValueInUSD = portfolioValueInUSD + balanceInUSD;

    addHistoryPoint(totalValueInUSD);
    lastRecordTime.current = now;
  }, [stocks, profile, addHistoryPoint]);

  return null;
};

export default PortfolioHistoryRecorder;
