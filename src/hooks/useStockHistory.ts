/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getStockHistory, OHLCVCandle, StockHistoryResult } from '../services/marketData.ts';

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | 'All';

interface UseStockHistoryProps {
  ticker: string;
  timeframe?: Timeframe;
  currentPrice?: number;
}

interface UseStockHistoryReturn {
  candles: OHLCVCandle[];
  meta: StockHistoryResult | null;
  isLoading: boolean;
  error: string | null;
  selectedTimeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  refetch: () => Promise<void>;
  latestCandle: OHLCVCandle | null;
}

export function useStockHistory({
  ticker,
  timeframe = '1D',
  currentPrice
}: UseStockHistoryProps): UseStockHistoryReturn {
  const [selectedTimeframe, setTimeframe] = useState<Timeframe>(timeframe);
  const [candles, setCandles] = useState<OHLCVCandle[]>([]);
  const [meta, setMeta] = useState<StockHistoryResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const prevTickerRef = useRef<string>(ticker);
  const lastPriceRef = useRef<number | undefined>(currentPrice);

  const fetchData = useCallback(async (targetTf: Timeframe = selectedTimeframe) => {
    if (!ticker) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getStockHistory(ticker, targetTf);
      setCandles(result.candles);
      setMeta(result);
    } catch (err: any) {
      console.error(`Error loading history for ${ticker}:`, err);
      setError(err?.message || 'Historical chart data unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [ticker, selectedTimeframe]);

  // When ticker changes, reset and fetch 1D
  useEffect(() => {
    if (prevTickerRef.current !== ticker) {
      prevTickerRef.current = ticker;
      fetchData(selectedTimeframe);
    }
  }, [ticker, selectedTimeframe, fetchData]);

  // Initial load or timeframe switch
  useEffect(() => {
    fetchData(selectedTimeframe);
  }, [selectedTimeframe, fetchData]);

  // Real-time update: update latest candle if currentPrice changes
  useEffect(() => {
    if (currentPrice === undefined || currentPrice === lastPriceRef.current || candles.length === 0) {
      return;
    }
    lastPriceRef.current = currentPrice;

    setCandles(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updatedLast: OHLCVCandle = {
        ...last,
        close: currentPrice,
        high: Math.max(last.high, currentPrice),
        low: Math.min(last.low, currentPrice)
      };
      return [...prev.slice(0, -1), updatedLast];
    });

    setMeta(prev => {
      if (!prev) return prev;
      const prevClose = prev.previousClose || currentPrice;
      const newChange = currentPrice - prevClose;
      const newPct = prevClose !== 0 ? (newChange / prevClose) * 100 : 0;
      return {
        ...prev,
        price: currentPrice,
        change: Number(newChange.toFixed(2)),
        percentChange: Number(newPct.toFixed(2))
      };
    });
  }, [currentPrice, candles.length]);

  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  return {
    candles,
    meta,
    isLoading,
    error,
    selectedTimeframe,
    setTimeframe,
    refetch: () => fetchData(selectedTimeframe),
    latestCandle
  };
}
