/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Stock } from '../types.ts';
import { MOCK_STOCKS } from '../constants.ts';

export function useMarketData() {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => {
          const volatility = 0.002; // 0.2% max change per tick
          const randomChange = (Math.random() - 0.5) * 2 * volatility;
          const newPrice = stock.price * (1 + randomChange);
          const rawChange = newPrice - stock.price;
          
          return {
            ...stock,
            price: Number(newPrice.toFixed(2)),
            change: Number((stock.change + rawChange).toFixed(2)),
            changePercent: Number(((newPrice / (stock.price - stock.change) - 1) * 100).toFixed(2))
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stocks;
}
