var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server/yahooProvider.ts
var yahooProvider_exports = {};
__export(yahooProvider_exports, {
  YahooProvider: () => YahooProvider
});
module.exports = __toCommonJS(yahooProvider_exports);
var import_yahoo_finance2 = __toESM(require("yahoo-finance2"), 1);
var YF = import_yahoo_finance2.default.default || import_yahoo_finance2.default;
var yahooFinance = typeof YF === "function" && YF.prototype ? new YF() : YF;
var YahooProvider = class {
  formatSymbol(exchange, symbol) {
    if (exchange.toUpperCase() === "NSE") return `${symbol}.NS`;
    if (exchange.toUpperCase() === "BSE") return `${symbol}.BO`;
    return symbol;
  }
  async getQuote(exchange, symbol) {
    const query = this.formatSymbol(exchange, symbol);
    try {
      const result = await yahooFinance.quote(query);
      if (!result) return null;
      return {
        symbol,
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
        timestamp: result.regularMarketTime ? new Date(result.regularMarketTime).getTime() : Date.now(),
        isRealtime: false
        // Yahoo is delayed by 15 mins for Indian markets usually
      };
    } catch (e) {
      console.error(`YahooProvider getQuote error for ${query}:`, e);
      return null;
    }
  }
  async getQuotes(symbols) {
    if (symbols.length === 0) return {};
    const queries = symbols.map((s) => this.formatSymbol(s.exchange, s.symbol));
    try {
      const results = await yahooFinance.quote(queries);
      const records = {};
      const resArray = Array.isArray(results) ? results : [results];
      for (const result of resArray) {
        if (!result.symbol) continue;
        const exchange = result.exchange === "NSI" || result.symbol.endsWith(".NS") ? "NSE" : result.symbol.endsWith(".BO") ? "BSE" : result.exchange || "UNKNOWN";
        const rawSymbol = result.symbol.replace(".NS", "").replace(".BO", "");
        records[`${exchange}:${rawSymbol}`] = {
          symbol: rawSymbol,
          exchange,
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
          timestamp: result.regularMarketTime ? new Date(result.regularMarketTime).getTime() : Date.now(),
          isRealtime: false
        };
      }
      return records;
    } catch (e) {
      console.error("YahooProvider getQuotes error:", e);
      return {};
    }
  }
  async getHistoricalData(exchange, symbol, interval, range) {
    const query = this.formatSymbol(exchange, symbol);
    const rangeMap = {
      "1D": "1d",
      "1W": "5d",
      "1M": "1mo",
      "3M": "3mo",
      "6M": "6mo",
      "1Y": "1y",
      "3Y": "3y",
      "5Y": "5y",
      "MAX": "max"
    };
    const intervalMap = {
      "1 minute": "1m",
      "5 minute": "5m",
      "15 minute": "15m",
      "30 minute": "30m",
      "1 hour": "60m",
      "1 day": "1d",
      "1 week": "1wk",
      "1 month": "1mo"
    };
    try {
      const period1 = /* @__PURE__ */ new Date();
      if (range === "1D") period1.setDate(period1.getDate() - 1);
      else if (range === "1W") period1.setDate(period1.getDate() - 7);
      else if (range === "1M") period1.setMonth(period1.getMonth() - 1);
      else if (range === "3M") period1.setMonth(period1.getMonth() - 3);
      else if (range === "6M") period1.setMonth(period1.getMonth() - 6);
      else if (range === "1Y") period1.setFullYear(period1.getFullYear() - 1);
      else if (range === "3Y") period1.setFullYear(period1.getFullYear() - 3);
      else if (range === "5Y") period1.setFullYear(period1.getFullYear() - 5);
      else if (range === "MAX") period1.setFullYear(period1.getFullYear() - 20);
      const queryOptions = {
        period1,
        interval: intervalMap[interval] || "1d"
      };
      const result = await yahooFinance.historical(query, queryOptions);
      return result.map((r) => ({
        timestamp: r.date.getTime(),
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
  async searchInstruments(query) {
    try {
      const result = await yahooFinance.search(query, { quotesCount: 10, newsCount: 0 });
      return result.quotes.filter((q) => q.exchange === "NSI" || q.exchange === "BSE" || q.symbol && (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BO"))).map((q) => {
        const exchange = q.exchange === "NSI" || q.symbol.endsWith(".NS") ? "NSE" : q.symbol.endsWith(".BO") ? "BSE" : "UNKNOWN";
        const rawSymbol = q.symbol.replace(".NS", "").replace(".BO", "");
        return {
          company_name: q.shortname || q.longname || rawSymbol,
          display_name: rawSymbol,
          exchange,
          exchange_symbol: rawSymbol,
          security_type: q.quoteType || "EQUITY",
          sector: q.industry || "Unknown"
        };
      });
    } catch (e) {
      console.error("YahooProvider searchInstruments error:", e);
      return [];
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  YahooProvider
});
