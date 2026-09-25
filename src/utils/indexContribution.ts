/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexConstituent, IndexDefinition } from '../data/indices/types.ts';

export interface ConstituentContribution {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  weight: number; // percentage in index (e.g., 7.2%)
  pointsContribution: number | null; // Points contributed to the index (e.g., +8.45 or -3.12)
  percentContribution: number | null; // Contribution as % of gross index movement
  direction: 'positive' | 'negative' | 'neutral' | 'unavailable';
  sector: string;
  marketCap: string;
  volume: string;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  methodology: 'market-cap-weighted' | 'price-weighted';
}

export interface IndexContributionResult {
  indexId: string;
  indexName: string;
  displaySymbol: string;
  currency: string;
  region: 'US' | 'IN';
  currentValue: number;
  absChange: number;
  pctChange: number;
  prevClose: number;
  methodology: 'market-cap-weighted' | 'price-weighted';
  methodologyDescription: string;
  explanationNote: string;
  driverSummary: string;
  topPositiveContributors: ConstituentContribution[];
  topNegativeContributors: ConstituentContribution[];
  allContributors: ConstituentContribution[];
  maxMagnitude: number;
  grossPositivePoints: number;
  grossNegativePoints: number;
  hasUnavailableData: boolean;
}

/**
 * Calculates constituent index contributions using official methodology:
 * - Market-cap-weighted indices (S&P 500, Nasdaq-100, Nifty 50, Sensex, etc.):
 *     Point Contribution = Index PrevClose * (Constituent Weight / 100) * (Stock % Change / 100)
 * - Price-weighted indices (Dow Jones Industrial Average):
 *     Point Contribution = Stock Price Change / Dow Divisor
 *     where Dow Divisor = Sum(PrevClose Prices) / Index PrevClose (~0.1517)
 * - If constituent weight or contribution data is unavailable:
 *     pointsContribution is set to null, flagged as 'unavailable', never fabricated.
 */
export function calculateIndexContributions(
  indexDef: IndexDefinition,
  currentValue: number,
  absChange: number,
  pctChange: number,
  prevClose: number,
  constituents: IndexConstituent[]
): IndexContributionResult {
  const isPriceWeighted = indexDef.id === 'dow';
  const methodology = isPriceWeighted ? 'price-weighted' : 'market-cap-weighted';

  const methodologyDescription = isPriceWeighted
    ? 'Price-weighted index methodology (Dow Divisor-based point allocation). Higher share price constituents exert proportional point influence.'
    : 'Free-float market-capitalization-weighted methodology. Point contribution is calibrated from individual constituent index weights and price movements.';

  const explanationNote =
    "Contribution estimates show how individual constituents are influencing the index's current move.";

  // Dow divisor calibration for price-weighted index
  let dowDivisor = 0.1517279996; // Standard Wall Street benchmark Dow Divisor
  if (isPriceWeighted && prevClose > 0) {
    const sumPrevPrices = constituents.reduce((acc, c) => acc + (c.prevClose || (c.price - c.change)), 0);
    if (sumPrevPrices > 0) {
      dowDivisor = sumPrevPrices / prevClose;
    }
  }

  let hasUnavailableData = false;
  let grossPositivePoints = 0;
  let grossNegativePoints = 0;

  const processedContributors: ConstituentContribution[] = constituents.map(stock => {
    // Check if reliable constituent data is available
    const hasWeight = typeof stock.weight === 'number' && !isNaN(stock.weight) && stock.weight > 0;
    const hasPrice = typeof stock.price === 'number' && !isNaN(stock.price);
    const hasChange = typeof stock.changePercent === 'number' && !isNaN(stock.changePercent);

    if (!hasPrice || !hasChange || (!isPriceWeighted && !hasWeight)) {
      hasUnavailableData = true;
      return {
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        weight: stock.weight ?? 0,
        pointsContribution: null,
        percentContribution: null,
        direction: 'unavailable',
        sector: stock.sector,
        marketCap: stock.marketCap,
        volume: stock.volume,
        dayHigh: stock.dayHigh,
        dayLow: stock.dayLow,
        prevClose: stock.prevClose,
        methodology
      };
    }

    let pointsContribution: number;
    let actualWeight = stock.weight;

    if (isPriceWeighted) {
      // Dow price-weighted calculation: delta P / Divisor
      pointsContribution = stock.change / dowDivisor;
      // Recalibrate display weight as % of total price basket
      const totalPrice = constituents.reduce((sum, s) => sum + s.price, 0);
      actualWeight = totalPrice > 0 ? (stock.price / totalPrice) * 100 : stock.weight;
    } else {
      // Market-cap-weighted calculation
      const weightFrac = actualWeight / 100;
      const changeFrac = stock.changePercent / 100;
      pointsContribution = prevClose * weightFrac * changeFrac;
    }

    let direction: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (pointsContribution > 0.0001) {
      direction = 'positive';
      grossPositivePoints += pointsContribution;
    } else if (pointsContribution < -0.0001) {
      direction = 'negative';
      grossNegativePoints += Math.abs(pointsContribution);
    }

    return {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      weight: Number(actualWeight.toFixed(2)),
      pointsContribution: Number(pointsContribution.toFixed(2)),
      percentContribution: null, // Will calculate relative to gross points below
      direction,
      sector: stock.sector,
      marketCap: stock.marketCap,
      volume: stock.volume,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      prevClose: stock.prevClose,
      methodology
    };
  });

  // Calculate percentage contribution relative to gross total movement to avoid division by 0
  const grossMovement = grossPositivePoints + grossNegativePoints;
  const enrichedContributors = processedContributors.map(c => {
    if (c.pointsContribution === null || grossMovement === 0) {
      return c;
    }
    const pctContrib = (c.pointsContribution / grossMovement) * 100;
    return {
      ...c,
      percentContribution: Number(pctContrib.toFixed(1))
    };
  });

  // Top positive contributors sorted by contribution in descending order
  const topPositiveContributors = enrichedContributors
    .filter(c => c.pointsContribution !== null && c.pointsContribution > 0)
    .sort((a, b) => (b.pointsContribution ?? 0) - (a.pointsContribution ?? 0));

  // Top negative contributors sorted by contribution in ascending order (most negative first)
  const topNegativeContributors = enrichedContributors
    .filter(c => c.pointsContribution !== null && c.pointsContribution < 0)
    .sort((a, b) => (a.pointsContribution ?? 0) - (b.pointsContribution ?? 0));

  // Find max magnitude for visual bar scaling
  let maxMagnitude = 0.01;
  topPositiveContributors.forEach(c => {
    if (c.pointsContribution && c.pointsContribution > maxMagnitude) {
      maxMagnitude = c.pointsContribution;
    }
  });
  topNegativeContributors.forEach(c => {
    if (c.pointsContribution && Math.abs(c.pointsContribution) > maxMagnitude) {
      maxMagnitude = Math.abs(c.pointsContribution);
    }
  });

  // Dynamic Driver Summary:
  // "Today's index move is being driven primarily by..." followed by top 3 positive and top 3 negative contributors.
  const top3Pos = topPositiveContributors.slice(0, 3).map(c => c.name || c.symbol);
  const top3Neg = topNegativeContributors.slice(0, 3).map(c => c.name || c.symbol);

  let driverSummary = '';
  if (top3Pos.length > 0 && top3Neg.length > 0) {
    const posText = formatNameList(top3Pos);
    const negText = formatNameList(top3Neg);
    driverSummary = `Today's ${indexDef.displaySymbol} move is being driven primarily by gains in ${posText}, offset by declines in ${negText}.`;
  } else if (top3Pos.length > 0) {
    const posText = formatNameList(top3Pos);
    driverSummary = `Today's ${indexDef.displaySymbol} advance is being driven primarily by gains in ${posText}.`;
  } else if (top3Neg.length > 0) {
    const negText = formatNameList(top3Neg);
    driverSummary = `Today's ${indexDef.displaySymbol} decline is being pulled down primarily by losses in ${negText}.`;
  } else {
    driverSummary = `${indexDef.displaySymbol} constituents are trading flat with minimal net point deflection.`;
  }

  return {
    indexId: indexDef.id,
    indexName: indexDef.name,
    displaySymbol: indexDef.displaySymbol,
    currency: indexDef.currency,
    region: indexDef.region,
    currentValue,
    absChange,
    pctChange,
    prevClose,
    methodology,
    methodologyDescription,
    explanationNote,
    driverSummary,
    topPositiveContributors,
    topNegativeContributors,
    allContributors: enrichedContributors,
    maxMagnitude,
    grossPositivePoints: Number(grossPositivePoints.toFixed(2)),
    grossNegativePoints: Number(grossNegativePoints.toFixed(2)),
    hasUnavailableData
  };
}

function formatNameList(names: string[]): string {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
