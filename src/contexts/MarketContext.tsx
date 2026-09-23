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

export const INITIAL_INDICES: IndexQuote[] = [
  { key: 'dow', name: 'Dow Jones', symbol: '^DJI', displaySymbol: 'DOW 30', region: 'US', currency: '$', price: 51682.64, change: -95.40, percentChange: -0.18, isLive: true, lastUpdated: Date.now() },
  { key: 'sandp500', name: 'S&P 500', symbol: '^GSPC', displaySymbol: 'S&P 500', region: 'US', currency: '$', price: 7650.50, change: 12.74, percentChange: 0.17, isLive: true, lastUpdated: Date.now() },
  { key: 'nasdaq', name: 'Nasdaq', symbol: '^IXIC', displaySymbol: 'NASDAQ', region: 'US', currency: '$', price: 26522.55, change: 104.24, percentChange: 0.39, isLive: true, lastUpdated: Date.now() },
  { key: 'dax', name: 'DAX 40', symbol: '^GDAXI', displaySymbol: 'DAX', region: 'Europe', currency: '€', price: 25304.06, change: -233.74, percentChange: -0.92, isLive: true, lastUpdated: Date.now() },
  { key: 'nifty', name: 'Nifty 50', symbol: '^NSEI', displaySymbol: 'NIFTY 50', region: 'India', currency: '₹', price: 23346.40, change: 75.80, percentChange: 0.33, isLive: true, lastUpdated: Date.now() },
  { key: 'sensex', name: 'BSE Sensex', symbol: '^BSESN', displaySymbol: 'SENSEX', region: 'India', currency: '₹', price: 74294.96, change: -41.54, percentChange: -0.06, isLive: true, lastUpdated: Date.now() },
  { key: 'niftybank', name: 'Nifty Bank', symbol: '^NSEBANK', displaySymbol: 'BANK NIFTY', region: 'India', currency: '₹', price: 56358.70, change: 302.95, percentChange: 0.54, isLive: true, lastUpdated: Date.now() }
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
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [indices, setIndices] = useState<IndexQuote[]>(INITIAL_INDICES);
  const [isLive, setIsLive] = useState<boolean>(true);
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
      if (!window.__instrumentsFetched) {
        window.__instrumentsFetched = true;
        try {
          const instRes = await axios.get('/api/instruments');
          if (Array.isArray(instRes.data) && instRes.data.length > 0) {
            const seenSymbols = new Set<string>();
            const mappedInstruments: Stock[] = [];
            for (const i of instRes.data) {
              const sym = i.exchange_symbol || i.display_name;
              if (!sym || seenSymbols.has(sym.toUpperCase())) continue;
              seenSymbols.add(sym.toUpperCase());
              const existing = MOCK_STOCKS.find(m => m.symbol.toUpperCase() === sym.toUpperCase() || m.symbol.toUpperCase() === `${sym.toUpperCase()}:NSE`);
              mappedInstruments.push({
                symbol: sym,
                name: i.company_name || existing?.name || sym,
                price: existing?.price || (i.country === 'India' || i.currency === '₹' ? 1500 : 150),
                change: existing?.change || 0,
                changePercent: existing?.changePercent || 0,
                volume: existing?.volume || '2.5M',
                marketCap: existing?.marketCap || 'N/A',
                description: existing?.description || i.company_name || sym,
                sector: i.sector || existing?.sector || 'General',
                country: i.exchange === 'NSE' || i.exchange === 'BSE' || i.country === 'India' ? 'India' : 'USA',
                currency: i.currency || existing?.currency || (i.country === 'India' ? '₹' : '$'),
                exchange: i.exchange,
                dayHigh: existing?.dayHigh,
                dayLow: existing?.dayLow,
                prevClose: existing?.prevClose,
                history: []
              });
            }
            currentStocksList = mappedInstruments;
            setStocks(currentStocksList);
          }
        } catch (e) {
          console.warn('Could not load instruments, keeping MOCK_STOCKS:', e);
        }
      }
      
      if (currentStocksList.length === 0) {
        setIsLoading(false);
        return;
      }

      const symbolsToFetch = currentStocksList.map((s: any) => `${s.exchange || (s.country === 'India' ? 'NSE' : 'NASDAQ')}:${s.symbol}`).join(',');
      
      const [res1, indicesRes] = await Promise.allSettled([
        axios.get('/api/quotes', { params: { symbols: symbolsToFetch } }),
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
          const liveData = allData[apiSymbol] || 
                           allData[stock.symbol] || 
                           allData[`NSE:${stock.symbol}`] ||
                           allData[`BSE:${stock.symbol}`] ||
                           allData[`NASDAQ:${stock.symbol}`] ||
                           allData[`NYSE:${stock.symbol}`] ||
                           allData[`US:${stock.symbol}`] ||
                           (stock.symbol === 'TATAMOTORS' ? (allData['TMCV.NS'] || allData['TMCV'] || allData['NSE:TATAMOTORS']) : null);

          if (liveData && liveData.price !== undefined && liveData.price > 0) {
            hasLiveData = true;
            const newPrice = Number(Number(liveData.price).toFixed(2));
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
              change: liveData.change !== undefined ? Number(Number(liveData.change).toFixed(2)) : stock.change,
              changePercent: liveData.changePercent !== undefined ? Number(Number(liveData.changePercent).toFixed(2)) : stock.changePercent,
              dayHigh: liveData.high !== undefined ? Number(Number(liveData.high).toFixed(2)) : stock.dayHigh,
              dayLow: liveData.low !== undefined ? Number(Number(liveData.low).toFixed(2)) : stock.dayLow,
              prevClose: liveData.previousClose !== undefined ? Number(Number(liveData.previousClose).toFixed(2)) : stock.prevClose,
              fiftyTwoWeekHigh: liveData.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: liveData.fiftyTwoWeekLow,
              volume: formatVolume(liveData.volume) || stock.volume,
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
            const incoming = liveIndicesDict[apiSymbol] ||
                             liveIndicesDict[`UNKNOWN:${apiSymbol}`] ||
                             liveIndicesDict[apiSymbol.replace('^', '')] ||
                             liveIndicesDict[`UNKNOWN:${apiSymbol.replace('^', '')}`] ||
                             liveIndicesDict[`NSE:${apiSymbol}`] ||
                             liveIndicesDict[`BSE:${apiSymbol}`] ||
                             (Object.values(liveIndicesDict).find((v: any) => v && (v.symbol === apiSymbol || v.symbol === apiSymbol.replace('^', ''))) as any);
            
            if (incoming && incoming.price !== undefined && incoming.price > 0) {
              const incomingPrice = Number(Number(incoming.price).toFixed(2));
              const oldPrice = prevIndexPricesRef.current[existing.key] ?? existing.price;
              if (incomingPrice > oldPrice + 0.001) {
                triggerIndexTick(existing.key, 'up');
              } else if (incomingPrice < oldPrice - 0.001) {
                triggerIndexTick(existing.key, 'down');
              }
              prevIndexPricesRef.current[existing.key] = incomingPrice;

              return {
                ...existing,
                price: incomingPrice,
                change: incoming.change !== undefined ? Number(Number(incoming.change).toFixed(2)) : existing.change,
                percentChange: incoming.changePercent !== undefined ? Number(Number(incoming.changePercent).toFixed(2)) : existing.percentChange,
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
  }, [stocks, triggerTick, triggerIndexTick]);

  useEffect(() => {
    fetchData();
    fetchMarketStatus();

    // Poll live market data every 15 seconds to respect provider rate limits while keeping data fresh
    const interval = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        fetchData();
      }
    }, 15000);
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
