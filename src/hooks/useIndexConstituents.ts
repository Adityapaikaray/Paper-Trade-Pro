/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { IndexDefinition, IndexConstituent } from '../data/indices/types.ts';
import { getIndexDefinition, ALL_SUPPORTED_INDICES } from '../data/indices/indexRegistry.ts';
import { useMarketData } from './useMarketData.ts';

export interface IndexConstituentsState {
  index: IndexDefinition & {
    currentValue: number;
    pointChange: number;
    percentChange: number;
    marketStatus: string;
    lastUpdated: number;
    asOfDate?: string;
    lastRebalanced?: string;
    dataSource?: string;
  };
  constituents: IndexConstituent[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastFetchTime: number;
  refresh: () => Promise<void>;
}

export function useIndexConstituents(indexKey: string): IndexConstituentsState {
  const normKey = indexKey.toLowerCase().replace(/[^a-z0-9]/g, '');
  const baseDef = useMemo(() => getIndexDefinition(normKey), [normKey]);
  const { stocks, indices } = useMarketData();

  const [serverData, setServerData] = useState<{
    index: any;
    constituents: IndexConstituent[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());
  const inFlightRef = useRef<boolean>(false);

  const fetchConstituents = useCallback(async (isRefresh = false) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (isRefresh) setIsRefreshing(true);
    else if (!serverData) setIsLoading(true);

    try {
      const url = `/api/indices/${normKey}/constituents${isRefresh ? '?refresh=true' : ''}`;
      const res = await axios.get(url, { timeout: 8000 });
      if (res.data && res.data.constituents && Array.isArray(res.data.constituents)) {
        setServerData(res.data);
        setLastFetchTime(Date.now());
      }
    } catch (e) {
      // Fallback cleanly to local base definition
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      inFlightRef.current = false;
    }
  }, [normKey, serverData]);

  // Initial fetch and on index change
  useEffect(() => {
    fetchConstituents(false);
  }, [fetchConstituents]);

  // Merge client live prices from MarketContext into constituents
  const constituents = useMemo(() => {
    const rawList = serverData?.constituents || baseDef.constituents;
    const isPriceWeighted = normKey === 'dow';
    const indexPrevClose = serverData?.index?.prevClose || baseDef.prevClose || baseDef.baselinePrice;

    // Dow divisor calibration
    let dowDivisor = 0.1517279996;
    if (isPriceWeighted && rawList.length > 0) {
      const sumPrices = rawList.reduce((acc, c) => acc + (c.prevClose || c.price), 0);
      if (sumPrices > 0 && indexPrevClose > 0) {
        dowDivisor = sumPrices / indexPrevClose;
      }
    }

    return rawList.map((c, idx) => {
      const liveStock = stocks.find(s =>
        s.symbol.toUpperCase() === c.symbol.toUpperCase() ||
        s.symbol.toUpperCase() === `${c.symbol.toUpperCase()}:NSE` ||
        (c.symbol.toUpperCase() === 'TATAMOTORS' && (s.symbol.toUpperCase() === 'TMCV' || s.symbol.toUpperCase() === 'TATAMOTORS'))
      );

      const price = liveStock?.price ?? c.price;
      const change = liveStock?.change ?? c.change;
      const changePercent = liveStock?.changePercent ?? c.changePercent;
      const volume = liveStock?.volume ?? c.volume;
      const prevClose = liveStock?.prevClose ?? c.prevClose ?? (price - change);
      const dayHigh = liveStock?.dayHigh ?? c.dayHigh ?? Math.max(price, prevClose);
      const dayLow = liveStock?.dayLow ?? c.dayLow ?? Math.min(price, prevClose);

      let pointsContribution = c.pointsContribution;
      if (typeof pointsContribution !== 'number' || liveStock) {
        if (isPriceWeighted) {
          pointsContribution = Number((change / dowDivisor).toFixed(2));
        } else {
          const weightFactor = (c.weight || 1) / 100.0;
          pointsContribution = Number((indexPrevClose * weightFactor * (changePercent / 100.0)).toFixed(2));
        }
      }

      return {
        ...c,
        rank: c.rank || (idx + 1),
        price,
        change,
        changePercent,
        volume,
        dayHigh,
        dayLow,
        prevClose,
        pointsContribution,
        marketStatus: liveStock?.marketState || c.marketStatus || 'REGULAR'
      };
    });
  }, [serverData, baseDef, stocks, normKey]);

  // Index metrics
  const index = useMemo(() => {
    // Check if live index is in useMarketData indices
    const liveIndex = indices.find(i =>
      i.key === normKey ||
      i.symbol === baseDef.symbol ||
      (normKey === 'nasdaq' && i.key === 'nasdaq')
    );

    const prevClose = liveIndex?.price ? (liveIndex.price - liveIndex.change) : (serverData?.index?.prevClose || baseDef.prevClose);
    const currentValue = liveIndex ? liveIndex.price : (serverData?.index?.currentValue || baseDef.baselinePrice);
    const pointChange = liveIndex ? liveIndex.change : (serverData?.index?.pointChange || baseDef.baselineChange);
    const percentChange = liveIndex ? liveIndex.percentChange : (serverData?.index?.percentChange || baseDef.baselinePercent);

    return {
      ...baseDef,
      currentValue,
      pointChange,
      percentChange,
      prevClose,
      marketStatus: liveIndex?.isLive ? 'LIVE' : (serverData?.index?.marketStatus || 'REGULAR'),
      lastUpdated: liveIndex?.lastUpdated || lastFetchTime,
      asOfDate: serverData?.index?.asOfDate || baseDef.asOfDate || 'Current Trading Session',
      lastRebalanced: serverData?.index?.lastRebalanced || baseDef.lastRebalanced || '2025-01-15',
      dataSource: serverData?.index?.dataSource || baseDef.dataSource || 'Institutional Market Data & Exchange Indexes'
    };
  }, [baseDef, serverData, indices, normKey, lastFetchTime]);

  const refresh = useCallback(async () => {
    await fetchConstituents(true);
  }, [fetchConstituents]);

  return {
    index,
    constituents,
    isLoading,
    isRefreshing,
    lastFetchTime,
    refresh
  };
}
