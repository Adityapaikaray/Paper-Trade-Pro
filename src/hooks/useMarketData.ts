/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Stock } from '../types.ts';
import { MOCK_STOCKS } from '../constants.ts';
import axios from 'axios';

// Symbols for US market don't need changes.
// Symbols for India market need :NSE suffix for Twelve Data.
const getApiSymbol = (stock: Stock) => {
  if (stock.country === 'India') return `${stock.symbol}:NSE`;
  return stock.symbol;
};

export function useMarketData() {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let lastUpdate = Date.now();
    
    const fetchData = async () => {
      try {
        const batch1 = MOCK_STOCKS.slice(0, 30).map(getApiSymbol).join(',');
        const batch2 = MOCK_STOCKS.slice(30).map(getApiSymbol).join(',');
        
        const [res1, res2] = await Promise.all([
          axios.get(`/api/market-data?symbols=${batch1}`),
          axios.get(`/api/market-data?symbols=${batch2}`)
        ]);

        if (res1.data.error === "API_KEY_MISSING") {
          setIsLive(false);
          return;
        }

        const allData = { ...(res1.data || {}), ...(res2.data || {}) };
        
        setStocks(currentStocks => 
          currentStocks.map(stock => {
            const apiSymbol = getApiSymbol(stock);
            const liveData = allData[apiSymbol];
            
            if (liveData && liveData.price) {
              setIsLive(true);
              return {
                ...stock,
                price: parseFloat(liveData.close || liveData.price),
                change: parseFloat(liveData.change || '0'),
                changePercent: parseFloat(liveData.percent_change || '0'),
              };
            }
            return stock;
          })
        );
      } catch (error) {
        console.error("Failed to fetch live market data:", error);
        setIsLive(false);
      }
    };

    // Initial fetch
    fetchData();

    // Live update every 15 seconds (Free tier limits)
    const apiInterval = setInterval(fetchData, 15000);

    // Simulation fallback for movement between API updates
    const simInterval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => {
          // Only simulate if not updated by API in the last 2 seconds
          const volatility = 0.0005; // Lower volatility for "noise"
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
    }, 2000);

    return () => {
      clearInterval(apiInterval);
      clearInterval(simInterval);
    };
  }, []);

  return { stocks, isLive };
}
