export interface MarketQuote {
  symbol: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  timestamp: number;
  isRealtime: boolean;
  marketState?: string;
}

export interface HistoricalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataProvider {
  getQuote(exchange: string, symbol: string): Promise<MarketQuote | null>;
  getQuotes(symbols: { exchange: string, symbol: string }[]): Promise<Record<string, MarketQuote>>;
  getHistoricalData(exchange: string, symbol: string, interval: string, range: string): Promise<HistoricalCandle[]>;
  searchInstruments(query: string): Promise<any[]>;
}
