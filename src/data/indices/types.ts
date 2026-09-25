/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IndexConstituent {
  symbol: string;
  name: string;
  weight: number; // percentage in index (e.g., 9.8%)
  sector: string;
  marketCap: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
  displayReturn?: number;
  exchange?: string;
  rank?: number;
  pointsContribution?: number | null;
  percentContribution?: number | null;
  marketStatus?: string;
  historicalReturns?: {
    '1W'?: number;
    '1M'?: number;
    '3M'?: number;
    '6M'?: number;
    '1Y'?: number;
  };
}

export interface IndexDefinition {
  id: string;
  name: string;
  symbol: string;
  displaySymbol: string;
  region: 'US' | 'IN';
  currency: '$' | '₹';
  description: string;
  benchmarkSector?: string;
  baselinePrice: number;
  baselineChange: number;
  baselinePercent: number;
  prevClose: number;
  constituents: IndexConstituent[];
  totalConstituents?: number;
  lastRebalanced?: string;
  asOfDate?: string;
  dataSource?: string;
}
