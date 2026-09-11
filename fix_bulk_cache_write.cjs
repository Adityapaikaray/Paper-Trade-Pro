const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const quoteData: CachedQuote = {
        price: Number(currentPrice.toFixed(2)),
        close: Number(currentPrice.toFixed(2)),
        change: Number(rawChange.toFixed(2)),
        percent_change: Number(rawPercentChange.toFixed(2)),
        day_high: q.regularMarketDayHigh ? Number(q.regularMarketDayHigh.toFixed(2)) : undefined,
        day_low: q.regularMarketDayLow ? Number(q.regularMarketDayLow.toFixed(2)) : undefined,
        fifty_two_week_high: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
        fifty_two_week_low: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
        volume: q.regularMarketVolume || "N/A",
        currency: q.currency || "USD",
        is_live: true,
        timestamp: q.regularMarketTime ? q.regularMarketTime.getTime() : now,
        history: []
      };
      
      results[q.symbol] = quoteData;
    });`;

const replacement = `      const quoteData: CachedQuote = {
        price: Number(currentPrice.toFixed(2)),
        close: Number(currentPrice.toFixed(2)),
        change: Number(rawChange.toFixed(2)),
        percent_change: Number(rawPercentChange.toFixed(2)),
        day_high: q.regularMarketDayHigh ? Number(q.regularMarketDayHigh.toFixed(2)) : undefined,
        day_low: q.regularMarketDayLow ? Number(q.regularMarketDayLow.toFixed(2)) : undefined,
        fifty_two_week_high: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh.toFixed(2)) : undefined,
        fifty_two_week_low: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow.toFixed(2)) : undefined,
        volume: q.regularMarketVolume || "N/A",
        currency: q.currency || "USD",
        is_live: true,
        timestamp: q.regularMarketTime ? q.regularMarketTime.getTime() : now,
        history: []
      };
      
      results[q.symbol] = quoteData;
      quoteCache.set(q.symbol, { data: quoteData, expiresAt: now + CACHE_TTL_MS });
    });`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
