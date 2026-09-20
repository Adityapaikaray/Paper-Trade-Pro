/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OHLCVCandle } from '../services/marketData.ts';

export interface IndicatorPoint {
  time: number; // in seconds
  value: number;
}

export interface MACDResult {
  macd: IndicatorPoint[];
  signal: IndicatorPoint[];
  histogram: { time: number; value: number; color: string }[];
}

/**
 * Calculate Simple Moving Average (SMA)
 * @param candles Array of OHLCV candles
 * @param period Lookback period (e.g. 20)
 */
export function calculateSMA(candles: OHLCVCandle[], period: number = 20): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];

  const results: IndicatorPoint[] = [];
  let sum = 0;

  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;

    if (i >= period) {
      sum -= candles[i - period].close;
    }

    if (i >= period - 1) {
      results.push({
        time: candles[i].time,
        value: Number((sum / period).toFixed(2))
      });
    }
  }

  return results;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param candles Array of OHLCV candles
 * @param period Lookback period (e.g. 20)
 */
export function calculateEMA(candles: OHLCVCandle[], period: number = 20): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];

  const results: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  // Initial SMA as starting point for EMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += candles[i].close;
  }
  let prevEMA = initialSum / period;

  results.push({
    time: candles[period - 1].time,
    value: Number(prevEMA.toFixed(2))
  });

  for (let i = period; i < candles.length; i++) {
    const currentPrice = candles[i].close;
    const currentEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
    prevEMA = currentEMA;

    results.push({
      time: candles[i].time,
      value: Number(currentEMA.toFixed(2))
    });
  }

  return results;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param candles Array of OHLCV candles
 * @param period Lookback period (standard: 14)
 */
export function calculateRSI(candles: OHLCVCandle[], period: number = 14): IndicatorPoint[] {
  if (!candles || candles.length <= period) return [];

  const results: IndicatorPoint[] = [];
  const changes: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }

  avgGain /= period;
  avgLoss /= period;

  const initialRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const initialRSI = avgLoss === 0 ? 100 : 100 - (100 / (1 + initialRS));

  results.push({
    time: candles[period].time,
    value: Number(initialRSI.toFixed(2))
  });

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));

    results.push({
      time: candles[i + 1].time,
      value: Number(rsi.toFixed(2))
    });
  }

  return results;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param candles Array of OHLCV candles
 * @param fast Fast period (default 12)
 * @param slow Slow period (default 26)
 * @param signal Signal period (default 9)
 */
export function calculateMACD(
  candles: OHLCVCandle[],
  fast: number = 12,
  slow: number = 26,
  signal: number = 9
): MACDResult {
  const empty: MACDResult = { macd: [], signal: [], histogram: [] };
  if (!candles || candles.length < slow + signal) return empty;

  const fastEMA = calculateEMA(candles, fast);
  const slowEMA = calculateEMA(candles, slow);

  const slowMap = new Map<number, number>();
  slowEMA.forEach(pt => slowMap.set(pt.time, pt.value));

  // MACD line = Fast EMA - Slow EMA
  const macdLinePoints: IndicatorPoint[] = [];
  fastEMA.forEach(pt => {
    if (slowMap.has(pt.time)) {
      const slowVal = slowMap.get(pt.time)!;
      macdLinePoints.push({
        time: pt.time,
        value: Number((pt.value - slowVal).toFixed(2))
      });
    }
  });

  if (macdLinePoints.length < signal) return empty;

  // Signal line = EMA of MACD line
  const multiplier = 2 / (signal + 1);
  let initSum = 0;
  for (let i = 0; i < signal; i++) {
    initSum += macdLinePoints[i].value;
  }
  let prevSignal = initSum / signal;

  const signalLinePoints: IndicatorPoint[] = [{
    time: macdLinePoints[signal - 1].time,
    value: Number(prevSignal.toFixed(2))
  }];

  for (let i = signal; i < macdLinePoints.length; i++) {
    const curVal = macdLinePoints[i].value;
    prevSignal = (curVal - prevSignal) * multiplier + prevSignal;
    signalLinePoints.push({
      time: macdLinePoints[i].time,
      value: Number(prevSignal.toFixed(2))
    });
  }

  // Histogram = MACD - Signal
  const sigMap = new Map<number, number>();
  signalLinePoints.forEach(pt => sigMap.set(pt.time, pt.value));

  const histogram: { time: number; value: number; color: string }[] = [];
  macdLinePoints.forEach(pt => {
    if (sigMap.has(pt.time)) {
      const sVal = sigMap.get(pt.time)!;
      const diff = Number((pt.value - sVal).toFixed(2));
      histogram.push({
        time: pt.time,
        value: diff,
        color: diff >= 0 ? '#10b981' : '#ef4444'
      });
    }
  });

  return {
    macd: macdLinePoints.filter(pt => sigMap.has(pt.time)),
    signal: signalLinePoints,
    histogram
  };
}
