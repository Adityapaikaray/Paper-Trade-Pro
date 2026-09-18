/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Stock, IndexQuote } from '../types.ts';
import { MOCK_STOCKS } from '../constants.ts';
import axios from 'axios';
declare global {
  interface Window {
    __instrumentsFetched: boolean;
  }
}

interface MarketContextType {
  stocks: Stock[];
  indices: IndexQuote[];
  isLive: boolean;
  lastUpdated: number;
  priceTicks: Record<string, 'up' | 'down' | null>;
  indexTicks: Record<string, 'up' | 'down' | null>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  marketStatus: { nyse: string; nse: string };
}

const INITIAL_INDICES: IndexQuote[] = [
  { key: 'dow', name: 'Dow Jones', symbol: '^DJI', displaySymbol: 'DOW 30', region: 'US', currency: '$', price: 52064.10, change: -316.60, percentChange: -0.60, isLive: true, lastUpdated: Date.now() },
  { key: 'sandp500', name: 'S&P 500', symbol: '^GSPC', displaySymbol: 'S&P 500', region: 'US', currency: '$', price: 7591.70, change: -44.66, percentChange: -0.58, isLive: true, lastUpdated: Date.now() },
  { key: 'nasdaq', name: 'Nasdaq', symbol: '^IXIC', displaySymbol: 'NASDAQ', region: 'US', currency: '$', price: 26081.72, change: -171.62, percentChange: -0.65, isLive: true, lastUpdated: Date.now() },
  { key: 'dax', name: 'DAX 40', symbol: '^GDAXI', displaySymbol: 'DAX', region: 'Europe', currency: '€', price: 25361.15, change: -215.25, percentChange: -0.84, isLive: true, lastUpdated: Date.now() },
  { key: 'nifty', name: 'Nifty 50', symbol: '^NSEI', displaySymbol: 'NIFTY 50', region: 'India', currency: '₹', price: 23349.20, change: -128.60, percentChange: -0.55, isLive: true, lastUpdated: Date.now() },
  { key: 'sensex', name: 'BSE Sensex', symbol: '^BSESN', displaySymbol: 'SENSEX', region: 'India', currency: '₹', price: 74541.24, change: -361.35, percentChange: -0.48, isLive: true, lastUpdated: Date.now() },
  { key: 'niftybank', name: 'Nifty Bank', symbol: '^NSEBANK', displaySymbol: 'BANK NIFTY', region: 'India', currency: '₹', price: 56154.30, change: -317.65, percentChange: -0.56, isLive: true, lastUpdated: Date.now() }
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Helper to map stock to API lookup key
const getApiSymbol = (stock: Stock): string => {
  if (stock.country === 'India') return `${stock.symbol}:NSE`;
  if (stock.symbol === 'GOLD') return 'XAU/USD';
  if (stock.symbol === 'SILVER') return 'XAG/USD';
  return stock.symbol;
};

// Format raw number volume into readable M/B format
const formatVolume = (vol: number | string | undefined): string => {
  if (!vol || vol === 'N/A') return 'N/A';
  const num = typeof vol === 'number' ? vol : parseFloat(String(vol));
  if (isNaN(num) || num <= 0) return String(vol);
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
};

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<IndexQuote[]>(INITIAL_INDICES);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [priceTicks, setPriceTicks] = useState<Record<string, 'up' | 'down' | null>>({});
  const [indexTicks, setIndexTicks] = useState<Record<string, 'up' | 'down' | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [marketStatus, setMarketStatus] = useState<{ nyse: string; nse: string }>({ nyse: 'OPEN', nse: 'OPEN' });

  const prevPricesRef = useRef<Record<string, number>>({});
  const prevIndexPricesRef = useRef<Record<string, number>>({});
  const tickTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const indexTickTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Trigger brief highlight tick for changing stocks
  const triggerTick = useCallback((symbol: string, direction: 'up' | 'down') => {
    setPriceTicks(prev => ({ ...prev, [symbol]: direction }));
    if (tickTimeoutsRef.current[symbol]) {
      clearTimeout(tickTimeoutsRef.current[symbol]);
    }
    tickTimeoutsRef.current[symbol] = setTimeout(() => {
      setPriceTicks(prev => ({ ...prev, [symbol]: null }));
    }, 1200);
  }, []);

  // Trigger brief highlight tick for changing indices
  const triggerIndexTick = useCallback((key: string, direction: 'up' | 'down') => {
    setIndexTicks(prev => ({ ...prev, [key]: direction }));
    if (indexTickTimeoutsRef.current[key]) {
      clearTimeout(indexTickTimeoutsRef.current[key]);
    }
    indexTickTimeoutsRef.current[key] = setTimeout(() => {
      setIndexTicks(prev => ({ ...prev, [key]: null }));
    }, 1200);
  }, []);

  const fetchMarketStatus = useCallback(async () => {
    try {
      const res = await axios.get('/api/market-status');
      if (res.data) {
        setMarketStatus({
          nyse: res.data.nyse || 'OPEN',
          nse: res.data.nse || 'OPEN',
        });
      }
    } catch {
      // Keep defaults
    }
  }, []);

  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let currentStocksList = stocks;
      
      // We need a ref to track if we've fetched instruments yet to avoid stale closure issues
      if (currentStocksList.length === 0 && !window.__instrumentsFetched) {
        window.__instrumentsFetched = true;
        const instRes = await axios.get('/api/instruments');
        currentStocksList = instRes.data.map((i: any) => ({
          symbol: i.exchange_symbol || i.display_name,
          name: i.company_name,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: "0",
          marketCap: "N/A",
          pe: "N/A",
          sector: i.sector || 'Unknown',
          country: i.exchange === 'NSE' || i.exchange === 'BSE' ? 'India' : 'USA',
          exchange: i.exchange,
          history: []
        }));
        setStocks(currentStocksList);
      }
      
      if (currentStocksList.length === 0) {
        setIsLoading(false);
        return;
      }

      const symbolsToFetch = currentStocksList.map((s: any) => `${s.exchange || 'NSE'}:${s.symbol}`).join(',');
      
      const [res1, indicesRes] = await Promise.allSettled([
        axios.get(`/api/quotes?symbols=${symbolsToFetch}`),
        axios.get('/api/indices')
      ]);

      const allData: Record<string, any> = res1.status === 'fulfilled' ? res1.value.data : {};
      
      // Determine overall market status
      const nseStock = Object.values(allData).find((d: any) => d && (d.exchange === 'NSE' || d.exchange === 'NSI' || (d.symbol && d.symbol.includes('.NS'))));
      const usStock = Object.values(allData).find((d: any) => d && (d.symbol === 'AAPL' || d.symbol === 'MSFT'));
      setMarketStatus({
        nse: (nseStock as any)?.marketState || 'UNKNOWN',
        nyse: (usStock as any)?.marketState || 'UNKNOWN'
      });

      const now = Date.now();
      let hasLiveData = false;

      setStocks(current =>
        current.map(stock => {
          const apiSymbol = `${stock.exchange || 'NSE'}:${stock.symbol}`;
          const liveData = allData[apiSymbol];

          if (liveData && liveData.price !== undefined) {
            hasLiveData = true;
            const newPrice = liveData.price;
            const oldPrice = prevPricesRef.current[stock.symbol] ?? stock.price;

            if (newPrice > oldPrice + 0.001) {
              triggerTick(stock.symbol, 'up');
            } else if (newPrice < oldPrice - 0.001) {
              triggerTick(stock.symbol, 'down');
            }

            prevPricesRef.current[stock.symbol] = newPrice;

            return {
              ...stock,
              price: newPrice,
              change: liveData.change,
              changePercent: liveData.changePercent,
              dayHigh: liveData.high,
              dayLow: liveData.low,
              prevClose: liveData.previousClose,
              fiftyTwoWeekHigh: liveData.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: liveData.fiftyTwoWeekLow,
              volume: typeof liveData.volume === 'number' ? liveData.volume.toString() : liveData.volume,
              isRealtime: liveData.isRealtime || false,
              lastUpdated: liveData.timestamp || now,
              marketState: liveData.marketState,
            };
          }
          return stock;
        })
      );
      
// Update indices
      if (indicesRes.status === 'fulfilled' && typeof indicesRes.value.data === 'object' && !Array.isArray(indicesRes.value.data)) {
        const liveIndicesDict = indicesRes.value.data;
        hasLiveData = true;
        setIndices(currentIndices =>
          currentIndices.map(existing => {
            const apiSymbol = existing.symbol;
            // Depending on how YahooProvider formats it, the key is usually 'UNKNOWN:^DJI' or 'UNKNOWN:DJI'
            const possibleKeys = [`UNKNOWN:${apiSymbol}`, `NSE:${apiSymbol}`, `BSE:${apiSymbol}`, `UNKNOWN:${apiSymbol.replace('^', '')}`];
            const incomingKey = Object.keys(liveIndicesDict).find(k => possibleKeys.includes(k) || k.includes(apiSymbol));
            const incoming = incomingKey ? liveIndicesDict[incomingKey] : null;
            
            if (incoming && incoming.price !== undefined) {
              const oldPrice = prevIndexPricesRef.current[existing.key] ?? existing.price;
              if (incoming.price > oldPrice + 0.001) {
                triggerIndexTick(existing.key, 'up');
              } else if (incoming.price < oldPrice - 0.001) {
                triggerIndexTick(existing.key, 'down');
              }
              prevIndexPricesRef.current[existing.key] = incoming.price;

              return {
                ...existing,
                price: incoming.price,
                change: incoming.change,
                percentChange: incoming.changePercent,
                lastUpdated: incoming.timestamp || Date.now(),
                isLive: true
              };
            }
            return existing;
          })
        );
      }
      
      if (hasLiveData) {
        setIsLive(true);
        setLastUpdated(now);
      }
    } catch (error) {
      console.error("Failed to fetch real-time market data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [triggerTick, triggerIndexTick]);

  useEffect(() => {
    fetchData();
    fetchMarketStatus();

    // Poll live market data every 3.5 seconds to balance live responsiveness and CPU efficiency
    const interval = setInterval(fetchData, 3500);
    const statusInterval = setInterval(fetchMarketStatus, 60000);

    // Dynamic real-time micro-tick simulator for paper-trading order book fluidity
    const microTickInterval = setInterval(() => {
      // Pick 1 random stock to tick smoothly
      setStocks(currentStocks => {
        if (!currentStocks.length) return currentStocks;
        const targetIdx = Math.floor(Math.random() * currentStocks.length);

        return currentStocks.map((stock, idx) => {
          if (idx !== targetIdx) return stock;
          
          // Realistic small delta (-0.12% to +0.12%)
          const pctDelta = (Math.random() * 0.24 - 0.115) / 100;
          const rawDelta = stock.price * pctDelta;
          const newPrice = Math.max(0.01, Number((stock.price + rawDelta).toFixed(2)));
          const direction = newPrice >= stock.price ? 'up' : 'down';
          
          triggerTick(stock.symbol, direction);
          prevPricesRef.current[stock.symbol] = newPrice;

          const newChange = Number((stock.change + rawDelta).toFixed(2));
          const prevClose = stock.prevClose || (newPrice - newChange) || newPrice;
          const newChangePct = prevClose > 0 ? Number(((newChange / prevClose) * 100).toFixed(2)) : stock.changePercent;

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            isRealtime: true,
            lastUpdated: Date.now()
          };
        });
      });

      // Also tick 1 index randomly for live market dynamism
      setIndices(currentIndices => {
        if (!currentIndices.length) return currentIndices;
        const randIdx = Math.floor(Math.random() * currentIndices.length);
        return currentIndices.map((indexQuote, idx) => {
          if (idx !== randIdx) return indexQuote;
          
          const pctDelta = (Math.random() * 0.16 - 0.078) / 100;
          const rawDelta = indexQuote.price * pctDelta;
          const newPrice = Math.max(1, Number((indexQuote.price + rawDelta).toFixed(2)));
          const direction = newPrice >= indexQuote.price ? 'up' : 'down';
          
          triggerIndexTick(indexQuote.key, direction);
          prevIndexPricesRef.current[indexQuote.key] = newPrice;

          const newChange = Number((indexQuote.change + rawDelta).toFixed(2));
          const prevClose = indexQuote.prevClose || (newPrice - newChange) || newPrice;
          const newChangePct = prevClose > 0 ? Number(((newChange / prevClose) * 100).toFixed(2)) : indexQuote.percentChange;

          return {
            ...indexQuote,
            price: newPrice,
            change: newChange,
            percentChange: newChangePct,
            isLive: true,
            lastUpdated: Date.now()
          };
        });
      });
    }, 3500);

    return () => {
      clearInterval(interval);
      clearInterval(statusInterval);
      clearInterval(microTickInterval);
      Object.values(tickTimeoutsRef.current).forEach(clearTimeout);
      Object.values(indexTickTimeoutsRef.current).forEach(clearTimeout);
    };
  }, [fetchData, fetchMarketStatus]);

  return (
    <MarketContext.Provider
      value={{
        stocks,
        indices,
        isLive,
        lastUpdated,
        priceTicks,
        indexTicks,
        refresh: fetchData,
        isLoading,
        marketStatus,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketProvider');
  }
  return context;
};

export const useMarket = useMarketData;
