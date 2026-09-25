/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndexDefinition } from './types.ts';

export const US_INDICES: Record<string, IndexDefinition> = {
  sandp500: {
    id: 'sandp500',
    name: 'S&P 500 Index',
    symbol: '^GSPC',
    displaySymbol: 'S&P 500',
    region: 'US',
    currency: '$',
    description: 'The standard benchmark for the overall U.S. stock market, weighted by market capitalization.',
    baselinePrice: 5892.40,
    baselineChange: 14.85,
    baselinePercent: 0.25,
    prevClose: 5877.55,
    constituents: [
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.15, sector: 'Technology', marketCap: '3.67T', price: 493.78, change: -3.97, changePercent: -0.80, volume: '39.4M', dayHigh: 498.65, dayLow: 491.10, prevClose: 497.75 },
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.08, sector: 'Technology', marketCap: '4.91T', price: 336.13, change: -0.87, changePercent: -0.26, volume: '86.2M', dayHigh: 338.49, dayLow: 332.53, prevClose: 337.00 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 6.82, sector: 'Technology', marketCap: '5.37T', price: 222.27, change: 2.93, changePercent: 1.34, volume: '188.8M', dayHigh: 222.73, dayLow: 218.04, prevClose: 219.34 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.84, sector: 'Consumer Cyclical', marketCap: '2.74T', price: 253.71, change: 2.52, changePercent: 1.00, volume: '52.0M', dayHigh: 255.43, dayLow: 251.88, prevClose: 251.19 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 3.52, sector: 'Communication Services', marketCap: '4.27T', price: 349.54, change: 2.21, changePercent: 0.64, volume: '47.5M', dayHigh: 359.44, dayLow: 348.45, prevClose: 347.33 },
      { symbol: 'META', name: 'Meta Platforms', weight: 2.78, sector: 'Communication Services', marketCap: '1.68T', price: 665.75, change: -16.56, changePercent: -2.43, volume: '27.4M', dayHigh: 673.80, dayLow: 660.10, prevClose: 682.31 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 1.94, sector: 'Consumer Cyclical', marketCap: '1.09T', price: 340.95, change: -11.95, changePercent: -3.39, volume: '137.9M', dayHigh: 349.90, dayLow: 338.20, prevClose: 352.90 },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 1.82, sector: 'Technology', marketCap: '1.42T', price: 307.72, change: 4.88, changePercent: 1.61, volume: '44.8M', dayHigh: 312.40, dayLow: 304.50, prevClose: 302.84 },
      { symbol: 'JPM', name: 'JPMorgan Chase', weight: 1.54, sector: 'Financials', marketCap: '680B', price: 242.50, change: 1.80, changePercent: 0.75, volume: '12.4M', dayHigh: 244.20, dayLow: 240.10, prevClose: 240.70 },
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 1.32, sector: 'Healthcare', marketCap: '520B', price: 585.40, change: -2.30, changePercent: -0.39, volume: '3.8M', dayHigh: 590.20, dayLow: 582.00, prevClose: 587.70 },
      { symbol: 'V', name: 'Visa Inc.', weight: 1.21, sector: 'Financials', marketCap: '590B', price: 318.20, change: 1.40, changePercent: 0.44, volume: '6.2M', dayHigh: 320.50, dayLow: 316.40, prevClose: 316.80 },
      { symbol: 'XOM', name: 'Exxon Mobil Corp', weight: 1.14, sector: 'Energy', marketCap: '480B', price: 118.40, change: 1.20, changePercent: 1.02, volume: '16.5M', dayHigh: 119.50, dayLow: 117.10, prevClose: 117.20 },
      { symbol: 'MA', name: 'Mastercard Inc.', weight: 1.05, sector: 'Financials', marketCap: '470B', price: 524.80, change: 2.10, changePercent: 0.40, volume: '2.8M', dayHigh: 528.00, dayLow: 521.50, prevClose: 522.70 },
      { symbol: 'COST', name: 'Costco Wholesale', weight: 1.02, sector: 'Consumer Defensive', marketCap: '410B', price: 928.40, change: 6.80, changePercent: 0.74, volume: '2.1M', dayHigh: 934.00, dayLow: 921.00, prevClose: 921.60 },
      { symbol: 'CRM', name: 'Salesforce Inc.', weight: 0.92, sector: 'Technology', marketCap: '320B', price: 342.10, change: 3.40, changePercent: 1.00, volume: '4.8M', dayHigh: 345.00, dayLow: 338.20, prevClose: 338.70 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', weight: 0.84, sector: 'Technology', marketCap: '230B', price: 142.50, change: 2.80, changePercent: 2.00, volume: '48.2M', dayHigh: 144.20, dayLow: 139.40, prevClose: 139.70 },
      { symbol: 'NFLX', name: 'Netflix Inc.', weight: 0.81, sector: 'Communication Services', marketCap: '380B', price: 892.40, change: 12.40, changePercent: 1.41, volume: '3.4M', dayHigh: 898.00, dayLow: 880.00, prevClose: 880.00 },
      { symbol: 'ORCL', name: 'Oracle Corp.', weight: 0.78, sector: 'Technology', marketCap: '490B', price: 178.20, change: -1.20, changePercent: -0.67, volume: '8.9M', dayHigh: 181.00, dayLow: 176.50, prevClose: 179.40 },
      { symbol: 'ADBE', name: 'Adobe Inc.', weight: 0.71, sector: 'Technology', marketCap: '230B', price: 512.40, change: -4.50, changePercent: -0.87, volume: '2.8M', dayHigh: 519.00, dayLow: 508.00, prevClose: 516.90 },
      { symbol: 'CSCO', name: 'Cisco Systems', weight: 0.65, sector: 'Technology', marketCap: '240B', price: 60.50, change: 0.40, changePercent: 0.67, volume: '18.4M', dayHigh: 61.20, dayLow: 59.80, prevClose: 60.10 },
      { symbol: 'AMAT', name: 'Applied Materials', weight: 0.54, sector: 'Technology', marketCap: '170B', price: 215.40, change: 13.15, changePercent: 6.51, volume: '14.2M', dayHigh: 218.00, dayLow: 204.00, prevClose: 202.25 },
      { symbol: 'QCOM', name: 'Qualcomm Inc.', weight: 0.51, sector: 'Technology', marketCap: '190B', price: 168.20, change: -10.38, changePercent: -5.82, volume: '22.8M', dayHigh: 175.00, dayLow: 166.40, prevClose: 178.58 }
    ]
  },

  nasdaq: {
    id: 'nasdaq',
    name: 'Nasdaq-100',
    symbol: '^NDX',
    displaySymbol: 'NASDAQ-100',
    region: 'US',
    currency: '$',
    description: 'Top non-financial large-cap innovators and technology leaders listed on the Nasdaq exchange.',
    baselinePrice: 20450.80,
    baselineChange: 68.45,
    baselinePercent: 0.34,
    prevClose: 20382.35,
    constituents: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.92, sector: 'Technology', marketCap: '4.91T', price: 336.13, change: -0.87, changePercent: -0.26, volume: '86.2M', dayHigh: 338.49, dayLow: 332.53, prevClose: 337.00 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 8.78, sector: 'Technology', marketCap: '3.67T', price: 493.78, change: -3.97, changePercent: -0.80, volume: '39.4M', dayHigh: 498.65, dayLow: 491.10, prevClose: 497.75 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 8.45, sector: 'Technology', marketCap: '5.37T', price: 222.27, change: 2.93, changePercent: 1.34, volume: '188.8M', dayHigh: 222.73, dayLow: 218.04, prevClose: 219.34 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.42, sector: 'Consumer Discretionary', marketCap: '2.74T', price: 253.71, change: 2.52, changePercent: 1.00, volume: '52.0M', dayHigh: 255.43, dayLow: 251.88, prevClose: 251.19 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 4.81, sector: 'Communication Services', marketCap: '4.27T', price: 349.54, change: 2.21, changePercent: 0.64, volume: '47.5M', dayHigh: 359.44, dayLow: 348.45, prevClose: 347.33 },
      { symbol: 'META', name: 'Meta Platforms', weight: 4.53, sector: 'Communication Services', marketCap: '1.68T', price: 665.75, change: -16.56, changePercent: -2.43, volume: '27.4M', dayHigh: 673.80, dayLow: 660.10, prevClose: 682.31 },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 4.22, sector: 'Technology', marketCap: '1.42T', price: 307.72, change: 4.88, changePercent: 1.61, volume: '44.8M', dayHigh: 312.40, dayLow: 304.50, prevClose: 302.84 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 3.24, sector: 'Consumer Discretionary', marketCap: '1.09T', price: 340.95, change: -11.95, changePercent: -3.39, volume: '137.9M', dayHigh: 349.90, dayLow: 338.20, prevClose: 352.90 },
      { symbol: 'COST', name: 'Costco Wholesale', weight: 2.41, sector: 'Consumer Staples', marketCap: '410B', price: 928.40, change: 6.80, changePercent: 0.74, volume: '2.1M', dayHigh: 934.00, dayLow: 921.00, prevClose: 921.60 },
      { symbol: 'NFLX', name: 'Netflix Inc.', weight: 2.18, sector: 'Communication Services', marketCap: '380B', price: 892.40, change: 12.40, changePercent: 1.41, volume: '3.4M', dayHigh: 898.00, dayLow: 880.00, prevClose: 880.00 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', weight: 1.92, sector: 'Technology', marketCap: '230B', price: 142.50, change: 2.80, changePercent: 2.00, volume: '48.2M', dayHigh: 144.20, dayLow: 139.40, prevClose: 139.70 },
      { symbol: 'ADBE', name: 'Adobe Inc.', weight: 1.84, sector: 'Technology', marketCap: '230B', price: 512.40, change: -4.50, changePercent: -0.87, volume: '2.8M', dayHigh: 519.00, dayLow: 508.00, prevClose: 516.90 },
      { symbol: 'CSCO', name: 'Cisco Systems', weight: 1.62, sector: 'Technology', marketCap: '240B', price: 60.50, change: 0.40, changePercent: 0.67, volume: '18.4M', dayHigh: 61.20, dayLow: 59.80, prevClose: 60.10 },
      { symbol: 'AMAT', name: 'Applied Materials', weight: 1.41, sector: 'Technology', marketCap: '170B', price: 215.40, change: 13.15, changePercent: 6.51, volume: '14.2M', dayHigh: 218.00, dayLow: 204.00, prevClose: 202.25 },
      { symbol: 'QCOM', name: 'Qualcomm Inc.', weight: 1.34, sector: 'Technology', marketCap: '190B', price: 168.20, change: -10.38, changePercent: -5.82, volume: '22.8M', dayHigh: 175.00, dayLow: 166.40, prevClose: 178.58 }
    ]
  },

  dow: {
    id: 'dow',
    name: 'Dow Jones Industrial Average',
    symbol: '^DJI',
    displaySymbol: 'DOW 30',
    region: 'US',
    currency: '$',
    description: 'Price-weighted benchmark of 30 prominent, blue-chip American corporate leaders.',
    baselinePrice: 43280.20,
    baselineChange: -72.40,
    baselinePercent: -0.17,
    prevClose: 43352.60,
    constituents: [
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 8.82, sector: 'Healthcare', marketCap: '520B', price: 585.40, change: -2.30, changePercent: -0.39, volume: '3.8M', dayHigh: 590.20, dayLow: 582.00, prevClose: 587.70 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.44, sector: 'Technology', marketCap: '3.67T', price: 493.78, change: -3.97, changePercent: -0.80, volume: '39.4M', dayHigh: 498.65, dayLow: 491.10, prevClose: 497.75 },
      { symbol: 'CRM', name: 'Salesforce Inc.', weight: 5.15, sector: 'Technology', marketCap: '320B', price: 342.10, change: 3.40, changePercent: 1.00, volume: '4.8M', dayHigh: 345.00, dayLow: 338.20, prevClose: 338.70 },
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 5.06, sector: 'Technology', marketCap: '4.91T', price: 336.13, change: -0.87, changePercent: -0.26, volume: '86.2M', dayHigh: 338.49, dayLow: 332.53, prevClose: 337.00 },
      { symbol: 'V', name: 'Visa Inc.', weight: 4.79, sector: 'Financials', marketCap: '590B', price: 318.20, change: 1.40, changePercent: 0.44, volume: '6.2M', dayHigh: 320.50, dayLow: 316.40, prevClose: 316.80 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.82, sector: 'Consumer Cyclical', marketCap: '2.74T', price: 253.71, change: 2.52, changePercent: 1.00, volume: '52.0M', dayHigh: 255.43, dayLow: 251.88, prevClose: 251.19 },
      { symbol: 'JPM', name: 'JPMorgan Chase', weight: 3.65, sector: 'Financials', marketCap: '680B', price: 242.50, change: 1.80, changePercent: 0.75, volume: '12.4M', dayHigh: 244.20, dayLow: 240.10, prevClose: 240.70 },
      { symbol: 'HON', name: 'Honeywell International', weight: 3.19, sector: 'Industrials', marketCap: '140B', price: 212.00, change: -0.80, changePercent: -0.38, volume: '2.9M', dayHigh: 214.50, dayLow: 210.80, prevClose: 212.80 },
      { symbol: 'DIS', name: 'Walt Disney Co', weight: 1.72, sector: 'Communication Services', marketCap: '210B', price: 114.50, change: 0.90, changePercent: 0.79, volume: '7.8M', dayHigh: 115.80, dayLow: 113.20, prevClose: 113.60 },
      { symbol: 'NKE', name: 'Nike Inc.', weight: 1.33, sector: 'Consumer Cyclical', marketCap: '120B', price: 88.50, change: -0.40, changePercent: -0.45, volume: '9.4M', dayHigh: 89.80, dayLow: 87.90, prevClose: 88.90 },
      { symbol: 'CSCO', name: 'Cisco Systems', weight: 0.91, sector: 'Technology', marketCap: '240B', price: 60.50, change: 0.40, changePercent: 0.67, volume: '18.4M', dayHigh: 61.20, dayLow: 59.80, prevClose: 60.10 },
      { symbol: 'CVX', name: 'Chevron Corp', weight: 2.32, sector: 'Energy', marketCap: '280B', price: 154.20, change: 1.10, changePercent: 0.72, volume: '7.2M', dayHigh: 155.60, dayLow: 152.80, prevClose: 153.10 }
    ]
  },

  nasdaqcomposite: {
    id: 'nasdaqcomposite',
    name: 'Nasdaq Composite',
    symbol: '^IXIC',
    displaySymbol: 'NASDAQ COMP',
    region: 'US',
    currency: '$',
    description: 'Broad market index of more than 2,500 equities listed on the Nasdaq stock market.',
    baselinePrice: 18942.30,
    baselineChange: 76.50,
    baselinePercent: 0.41,
    prevClose: 18865.80,
    constituents: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.42, sector: 'Technology', marketCap: '4.91T', price: 336.13, change: -0.87, changePercent: -0.26, volume: '86.2M', dayHigh: 338.49, dayLow: 332.53, prevClose: 337.00 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 8.25, sector: 'Technology', marketCap: '3.67T', price: 493.78, change: -3.97, changePercent: -0.80, volume: '39.4M', dayHigh: 498.65, dayLow: 491.10, prevClose: 497.75 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 8.10, sector: 'Technology', marketCap: '5.37T', price: 222.27, change: 2.93, changePercent: 1.34, volume: '188.8M', dayHigh: 222.73, dayLow: 218.04, prevClose: 219.34 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.15, sector: 'Consumer Discretionary', marketCap: '2.74T', price: 253.71, change: 2.52, changePercent: 1.00, volume: '52.0M', dayHigh: 255.43, dayLow: 251.88, prevClose: 251.19 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 4.55, sector: 'Communication Services', marketCap: '4.27T', price: 349.54, change: 2.21, changePercent: 0.64, volume: '47.5M', dayHigh: 359.44, dayLow: 348.45, prevClose: 347.33 },
      { symbol: 'META', name: 'Meta Platforms', weight: 4.25, sector: 'Communication Services', marketCap: '1.68T', price: 665.75, change: -16.56, changePercent: -2.43, volume: '27.4M', dayHigh: 673.80, dayLow: 660.10, prevClose: 682.31 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 3.05, sector: 'Consumer Discretionary', marketCap: '1.09T', price: 340.95, change: -11.95, changePercent: -3.39, volume: '137.9M', dayHigh: 349.90, dayLow: 338.20, prevClose: 352.90 },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 2.95, sector: 'Technology', marketCap: '1.42T', price: 307.72, change: 4.88, changePercent: 1.61, volume: '44.8M', dayHigh: 312.40, dayLow: 304.50, prevClose: 302.84 },
      { symbol: 'ASML', name: 'ASML Holding', weight: 2.10, sector: 'Technology', marketCap: '380B', price: 812.50, change: 8.50, changePercent: 1.06, volume: '2.1M', dayHigh: 818.00, dayLow: 805.00, prevClose: 804.00 },
      { symbol: 'COST', name: 'Costco Wholesale', weight: 1.95, sector: 'Consumer Staples', marketCap: '410B', price: 928.40, change: 6.80, changePercent: 0.74, volume: '2.1M', dayHigh: 934.00, dayLow: 921.00, prevClose: 921.60 },
      { symbol: 'NFLX', name: 'Netflix Inc.', weight: 1.85, sector: 'Communication Services', marketCap: '380B', price: 892.40, change: 12.40, changePercent: 1.41, volume: '3.4M', dayHigh: 898.00, dayLow: 880.00, prevClose: 880.00 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', weight: 1.55, sector: 'Technology', marketCap: '230B', price: 142.50, change: 2.80, changePercent: 2.00, volume: '48.2M', dayHigh: 144.20, dayLow: 139.40, prevClose: 139.70 },
      { symbol: 'INTC', name: 'Intel Corp.', weight: 0.95, sector: 'Technology', marketCap: '110B', price: 23.40, change: 0.35, changePercent: 1.52, volume: '42.0M', dayHigh: 23.85, dayLow: 22.90, prevClose: 23.05 }
    ]
  },

  russell2000: {
    id: 'russell2000',
    name: 'Russell 2000 Index',
    symbol: '^RUT',
    displaySymbol: 'RUSSELL 2000',
    region: 'US',
    currency: '$',
    description: 'Premier small-cap index measuring the performance of approximately 2,000 American smaller corporate innovators.',
    baselinePrice: 2245.80,
    baselineChange: 14.25,
    baselinePercent: 0.64,
    prevClose: 2231.55,
    constituents: [
      { symbol: 'SMCI', name: 'Super Micro Computer', weight: 1.82, sector: 'Technology', marketCap: '28B', price: 48.50, change: 1.80, changePercent: 3.85, volume: '34.2M', dayHigh: 49.80, dayLow: 46.20, prevClose: 46.70 },
      { symbol: 'CELH', name: 'Celsius Holdings', weight: 1.41, sector: 'Consumer Defensive', marketCap: '8.4B', price: 34.20, change: 0.95, changePercent: 2.86, volume: '6.4M', dayHigh: 34.90, dayLow: 32.80, prevClose: 33.25 },
      { symbol: 'VRT', name: 'Vertiv Holdings', weight: 1.32, sector: 'Industrials', marketCap: '42B', price: 114.50, change: 2.10, changePercent: 1.87, volume: '8.1M', dayHigh: 116.20, dayLow: 111.80, prevClose: 112.40 },
      { symbol: 'SPT', name: 'Sprout Social', weight: 1.10, sector: 'Technology', marketCap: '2.1B', price: 36.80, change: -0.45, changePercent: -1.21, volume: '1.2M', dayHigh: 37.60, dayLow: 36.10, prevClose: 37.25 },
      { symbol: 'ENPH', name: 'Enphase Energy', weight: 1.05, sector: 'Energy', marketCap: '9.2B', price: 68.40, change: 1.60, changePercent: 2.40, volume: '5.8M', dayHigh: 69.80, dayLow: 66.50, prevClose: 66.80 },
      { symbol: 'FN', name: 'Fabrinet', weight: 0.95, sector: 'Technology', marketCap: '8.9B', price: 242.00, change: 4.80, changePercent: 2.02, volume: '0.8M', dayHigh: 245.50, dayLow: 236.20, prevClose: 237.20 },
      { symbol: 'RMBS', name: 'Rambus Inc.', weight: 0.84, sector: 'Technology', marketCap: '6.4B', price: 58.20, change: 0.80, changePercent: 1.39, volume: '1.9M', dayHigh: 59.40, dayLow: 57.10, prevClose: 57.40 },
      { symbol: 'CROX', name: 'Crocs Inc.', weight: 0.81, sector: 'Consumer Cyclical', marketCap: '7.8B', price: 132.50, change: 2.10, changePercent: 1.61, volume: '1.4M', dayHigh: 134.20, dayLow: 129.80, prevClose: 130.40 },
      { symbol: 'SAIA', name: 'Saia Inc.', weight: 0.72, sector: 'Industrials', marketCap: '12.4B', price: 468.00, change: -5.20, changePercent: -1.10, volume: '0.6M', dayHigh: 476.00, dayLow: 462.00, prevClose: 473.20 },
      { symbol: 'QLYS', name: 'Qualys Inc.', weight: 0.65, sector: 'Technology', marketCap: '5.2B', price: 138.40, change: -1.10, changePercent: -0.79, volume: '0.5M', dayHigh: 140.50, dayLow: 136.80, prevClose: 139.50 }
    ]
  },

  sandp100: {
    id: 'sandp100',
    name: 'S&P 100 Index',
    symbol: '^OEX',
    displaySymbol: 'S&P 100',
    region: 'US',
    currency: '$',
    description: 'Sub-index of the S&P 500 measuring 100 major blue-chip mega-cap corporate leaders with exchange-listed options.',
    baselinePrice: 2715.40,
    baselineChange: 7.20,
    baselinePercent: 0.27,
    prevClose: 2708.20,
    constituents: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 10.15, sector: 'Technology', marketCap: '4.91T', price: 336.13, change: -0.87, changePercent: -0.26, volume: '86.2M', dayHigh: 338.49, dayLow: 332.53, prevClose: 337.00 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 9.85, sector: 'Technology', marketCap: '3.67T', price: 493.78, change: -3.97, changePercent: -0.80, volume: '39.4M', dayHigh: 498.65, dayLow: 491.10, prevClose: 497.75 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', weight: 9.40, sector: 'Technology', marketCap: '5.37T', price: 222.27, change: 2.93, changePercent: 1.34, volume: '188.8M', dayHigh: 222.73, dayLow: 218.04, prevClose: 219.34 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.60, sector: 'Consumer Cyclical', marketCap: '2.74T', price: 253.71, change: 2.52, changePercent: 1.00, volume: '52.0M', dayHigh: 255.43, dayLow: 251.88, prevClose: 251.19 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 5.12, sector: 'Communication Services', marketCap: '4.27T', price: 349.54, change: 2.21, changePercent: 0.64, volume: '47.5M', dayHigh: 359.44, dayLow: 348.45, prevClose: 347.33 },
      { symbol: 'META', name: 'Meta Platforms', weight: 4.10, sector: 'Communication Services', marketCap: '1.68T', price: 665.75, change: -16.56, changePercent: -2.43, volume: '27.4M', dayHigh: 673.80, dayLow: 660.10, prevClose: 682.31 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 2.85, sector: 'Consumer Cyclical', marketCap: '1.09T', price: 340.95, change: -11.95, changePercent: -3.39, volume: '137.9M', dayHigh: 349.90, dayLow: 338.20, prevClose: 352.90 },
      { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 2.70, sector: 'Technology', marketCap: '1.42T', price: 307.72, change: 4.88, changePercent: 1.61, volume: '44.8M', dayHigh: 312.40, dayLow: 304.50, prevClose: 302.84 },
      { symbol: 'JPM', name: 'JPMorgan Chase', weight: 2.25, sector: 'Financials', marketCap: '680B', price: 242.50, change: 1.80, changePercent: 0.75, volume: '12.4M', dayHigh: 244.20, dayLow: 240.10, prevClose: 240.70 },
      { symbol: 'UNH', name: 'UnitedHealth Group', weight: 1.95, sector: 'Healthcare', marketCap: '520B', price: 585.40, change: -2.30, changePercent: -0.39, volume: '3.8M', dayHigh: 590.20, dayLow: 582.00, prevClose: 587.70 },
      { symbol: 'V', name: 'Visa Inc.', weight: 1.75, sector: 'Financials', marketCap: '590B', price: 318.20, change: 1.40, changePercent: 0.44, volume: '6.2M', dayHigh: 320.50, dayLow: 316.40, prevClose: 316.80 },
      { symbol: 'XOM', name: 'Exxon Mobil Corp', weight: 1.65, sector: 'Energy', marketCap: '480B', price: 118.40, change: 1.20, changePercent: 1.02, volume: '16.5M', dayHigh: 119.50, dayLow: 117.10, prevClose: 117.20 },
      { symbol: 'COST', name: 'Costco Wholesale', weight: 1.45, sector: 'Consumer Defensive', marketCap: '410B', price: 928.40, change: 6.80, changePercent: 0.74, volume: '2.1M', dayHigh: 934.00, dayLow: 921.00, prevClose: 921.60 },
      { symbol: 'HD', name: 'Home Depot', weight: 1.35, sector: 'Consumer Cyclical', marketCap: '390B', price: 412.50, change: 2.10, changePercent: 0.51, volume: '3.2M', dayHigh: 415.80, dayLow: 409.20, prevClose: 410.40 }
    ]
  }
};
