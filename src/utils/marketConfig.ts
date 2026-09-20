import { MarketConfig, MarketRegion } from '../types.ts';

export const MARKET_CONFIGS: Record<MarketRegion, MarketConfig> = {
  US: {
    region: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
    },
    locale: 'en-US',
    timezone: 'America/New_York',
    exchanges: ['NYSE', 'NASDAQ'],
    defaultIndices: ['^GSPC', '^DJI', '^IXIC', '^NDX', '^RUT', '^VIX'],
    newsRegion: 'US',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/New_York',
      preMarket: { open: '04:00', close: '09:30' },
      afterHours: { open: '16:00', close: '20:00' },
    },
  },
  IN: {
    region: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
    },
    locale: 'en-IN',
    timezone: 'Asia/Kolkata',
    exchanges: ['NSE', 'BSE'],
    defaultIndices: ['^NSEI', '^BSESN', '^NSEBANK'],
    newsRegion: 'IN',
    tradingHours: {
      open: '09:15',
      close: '15:30',
      timezone: 'Asia/Kolkata',
      preMarket: { open: '09:00', close: '09:15' },
      afterHours: { open: '15:40', close: '16:00' },
    },
  },
};

export const getMarketConfig = (region: MarketRegion = 'US'): MarketConfig => {
  return MARKET_CONFIGS[region] || MARKET_CONFIGS.US;
};
