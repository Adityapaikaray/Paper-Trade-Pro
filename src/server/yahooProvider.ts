import yf from 'yahoo-finance2';
const yahooFinance = new (yf as any)();



import { MarketDataProvider, MarketQuote, HistoricalCandle } from './provider.ts';

export class YahooProvider implements MarketDataProvider {
  
  private formatSymbol(exchange: string, symbol: string) {
    if (exchange.toUpperCase() === 'NSE') return `${symbol}.NS`;
    if (exchange.toUpperCase() === 'BSE') return `${symbol}.BO`;
    return symbol;
  }

  async getQuote(exchange: string, symbol: string): Promise<MarketQuote | null> {
    const query = this.formatSymbol(exchange, symbol);
    try {
      const result = await yahooFinance.quote(query);
      if (!result) return null;
      return {
        symbol: symbol,
        exchange: exchange.toUpperCase(),
        price: result.regularMarketPrice || 0,
        change: result.regularMarketChange || 0,
        changePercent: result.regularMarketChangePercent || 0,
        open: result.regularMarketOpen || 0,
        high: result.regularMarketDayHigh || 0,
        low: result.regularMarketDayLow || 0,
        previousClose: result.regularMarketPreviousClose || 0,
        volume: result.regularMarketVolume || 0,
        fiftyTwoWeekHigh: result.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: result.fiftyTwoWeekLow || 0,
        timestamp: (result.regularMarketTime ? new Date(result.regularMarketTime).getTime() : Date.now()),
        isRealtime: false, marketState: result.marketState
      };
    } catch (e) {
      console.error(`YahooProvider getQuote error for ${query}:`, e);
      return null;
    }
  }

  async getQuotes(symbols: { exchange: string, symbol: string }[]): Promise<Record<string, MarketQuote>> {
    if (symbols.length === 0) return {};
    const queries = symbols.map(s => this.formatSymbol(s.exchange, s.symbol));
    try {
      // Chunk queries into groups of 20 to prevent timeout/rate limits
      const CHUNK_SIZE = 20;
      const records: Record<string, MarketQuote> = {};

      for (let i = 0; i < queries.length; i += CHUNK_SIZE) {
        const chunk = queries.slice(i, i + CHUNK_SIZE);
        try {
          const results = await yahooFinance.quote(chunk);
          const resArray = Array.isArray(results) ? results : [results];

          for (const result of resArray) {
            if (!result || !result.symbol) continue;
            const isIndian = result.exchange === 'NSI' || result.symbol.endsWith('.NS') || result.symbol.endsWith('.BO');
            const exchange = isIndian 
              ? (result.exchange === 'NSI' || result.symbol.endsWith('.NS') ? 'NSE' : 'BSE') 
              : (result.exchange || 'US');
            const rawSymbol = result.symbol.replace('.NS', '').replace('.BO', '');

            const quoteObj: MarketQuote = {
              symbol: rawSymbol,
              exchange,
              price: result.regularMarketPrice ?? result.regularMarketPreviousClose ?? 0,
              change: result.regularMarketChange ?? 0,
              changePercent: result.regularMarketChangePercent ?? 0,
              open: result.regularMarketOpen ?? 0,
              high: result.regularMarketDayHigh ?? 0,
              low: result.regularMarketDayLow ?? 0,
              previousClose: result.regularMarketPreviousClose ?? 0,
              volume: result.regularMarketVolume ?? 0,
              fiftyTwoWeekHigh: result.fiftyTwoWeekHigh ?? 0,
              fiftyTwoWeekLow: result.fiftyTwoWeekLow ?? 0,
              timestamp: (result.regularMarketTime ? new Date(result.regularMarketTime).getTime() : Date.now()),
              isRealtime: false,
              marketState: result.marketState
            };

            // Key under multiple aliases so client lookups never fail
            records[`${exchange}:${rawSymbol}`] = quoteObj;
            records[`${result.symbol}`] = quoteObj;
            records[`${rawSymbol}`] = quoteObj;
            if (!isIndian) {
              records[`US:${rawSymbol}`] = quoteObj;
              records[`NASDAQ:${rawSymbol}`] = quoteObj;
              records[`NYSE:${rawSymbol}`] = quoteObj;
            }
          }
        } catch (chunkErr) {
          console.error('YahooProvider chunk fetch error:', chunkErr);
        }
      }

      return records;
    } catch (e) {
      return {};
    }
  }

  async getHistoricalData(exchange: string, symbol: string, interval: string, range: string): Promise<HistoricalCandle[]> {
    const query = this.formatSymbol(exchange, symbol);
    
    // Map our range to Yahoo period
    const rangeMap: Record<string, string> = {
      '1D': '1d', '1W': '5d', '1M': '1mo', '3M': '3mo',
      '6M': '6mo', '1Y': '1y', '3Y': '3y', '5Y': '5y', 'MAX': 'max'
    };
    
    // Map our interval to Yahoo interval
    const intervalMap: Record<string, '1m'|'2m'|'5m'|'15m'|'30m'|'60m'|'90m'|'1h'|'1d'|'5d'|'1wk'|'1mo'|'3mo'> = {
      '1 minute': '1m', '5 minute': '5m', '15 minute': '15m', 
      '30 minute': '30m', '1 hour': '60m', '1 day': '1d', 
      '1 week': '1wk', '1 month': '1mo'
    };

    try {
      const period1 = new Date();
      if (range === '1D') period1.setDate(period1.getDate() - 1);
      else if (range === '1W') period1.setDate(period1.getDate() - 7);
      else if (range === '1M') period1.setMonth(period1.getMonth() - 1);
      else if (range === '3M') period1.setMonth(period1.getMonth() - 3);
      else if (range === '6M') period1.setMonth(period1.getMonth() - 6);
      else if (range === '1Y') period1.setFullYear(period1.getFullYear() - 1);
      else if (range === '3Y') period1.setFullYear(period1.getFullYear() - 3);
      else if (range === '5Y') period1.setFullYear(period1.getFullYear() - 5);
      else if (range === 'MAX') period1.setFullYear(period1.getFullYear() - 20); // Fallback
      
      const queryOptions = {
        period1,
        interval: (intervalMap[interval] || interval || '1d') as any
      };
      
      const result = await yahooFinance.chart(query, queryOptions);
      if (!result || !result.quotes) return [];
      
      return result.quotes.map(r => ({
        timestamp: new Date(r.date).getTime(),
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: r.volume
      }));
    } catch (e) {
      console.error(`YahooProvider getHistoricalData error for ${query}:`, e);
      return [];
    }
  }

  async searchInstruments(query: string): Promise<any[]> {
    try {
      const result = await yahooFinance.search(query, { quotesCount: 15, newsCount: 0 });
      return (result.quotes || [])
        .map(q => {
          const isIndian = q.exchange === 'NSI' || q.exchange === 'BSE' || (q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')));
          const exchange = isIndian 
            ? (q.exchange === 'NSI' || q.symbol.endsWith('.NS') ? 'NSE' : 'BSE') 
            : (q.exchange || 'US');
          const rawSymbol = q.symbol.replace('.NS', '').replace('.BO', '');
          return {
            company_name: q.shortname || q.longname || rawSymbol,
            display_name: rawSymbol,
            exchange,
            exchange_symbol: rawSymbol,
            security_type: q.quoteType || 'EQUITY',
            sector: q.industry || q.sector || 'Equities',
            country: isIndian ? 'India' : 'USA',
            currency: isIndian ? '₹' : '$'
          };
      });
    } catch (e) {
      console.error('YahooProvider searchInstruments error:', e);
      return [];
    }
  }
}
