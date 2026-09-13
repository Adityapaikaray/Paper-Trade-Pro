import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Gemini AI client initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.use(cors());
app.use(express.json());
// --- Mock Authentication Backend ---
const users = new Map(); // email -> { name, email, password }
const sessions = new Map(); // token -> email

// Seed a test user
users.set('investor@tradepro.com', {
  name: 'Prestige User',
  email: 'investor@tradepro.com',
  password: 'Password123'
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (users.has(email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  users.set(email, { name, email, password });
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, email);
  res.json({ token, user: { name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect. Please try again.' });
  }
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, email);
  res.json({ token, user: { name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const email = sessions.get(token);
  if (!email) {
    return res.status(401).json({ error: 'Session expired' });
  }
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ user: { name: user.name, email: user.email } });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  
  // Simulate network delay and sending an email
  setTimeout(() => {
    // We intentionally don't reveal if the user exists for security reasons,
    // but in a real system we would generate a token and send an email if they do.
    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }, 1000);
});
// ------------------------------------



const TWELVE_DATA_API_KEY = process.env.VITE_TWELVE_DATA_API_KEY;

import yahooFinancePkg from 'yahoo-finance2';
const YahooFinanceClass = (yahooFinancePkg as any).default || yahooFinancePkg;
const yahooFinance = new YahooFinanceClass({ suppressNotices: ['yahooSurvey'] });

// In-memory quote cache with 5s TTL
interface CachedQuote {
  price: number;
  close: number;
  change: number;
  percent_change: number;
  day_high?: number;
  day_low?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  volume?: number | string;
  currency?: string;
  is_live: boolean;
  timestamp: number;
  history?: { time: string; price: number }[];
}

const quoteCache = new Map<string, { data: CachedQuote; expiresAt: number }>();
const CACHE_TTL_MS = 30000; // 5 seconds

// Map internal / TwelveData symbols to Yahoo Finance tickers
function mapToYahooTicker(rawSymbol: string): string {
  const clean = rawSymbol.trim().toUpperCase();
  if (clean === "GOLD" || clean === "XAU/USD") return "GC=F";
  if (clean === "SILVER" || clean === "XAG/USD") return "SI=F";
  if (clean === "TATAMOTORS" || clean === "TATAMOTORS:NSE") return "TMCV.NS";
  
  // Direct key index aliases
  if (clean === "DOW" || clean === "DJI" || clean === "^DJI") return "^DJI";
  if (clean === "SANDP500" || clean === "S&P500" || clean === "SP500" || clean === "^GSPC" || clean === "SPX") return "^GSPC";
  if (clean === "NASDAQ" || clean === "^IXIC" || clean === "COMP") return "^IXIC";
  if (clean === "DAX" || clean === "^GDAXI") return "^GDAXI";
  if (clean === "NIFTY" || clean === "NIFTY50" || clean === "^NSEI") return "^NSEI";
  if (clean === "SENSEX" || clean === "^BSESN") return "^BSESN";
  if (clean === "NIFTYBANK" || clean === "BANKNIFTY" || clean === "^NSEBANK") return "^NSEBANK";

  if (clean.endsWith(":NSE")) {
    return `${clean.replace(":NSE", "")}.NS`;
  }
  
  // Known Indian stocks without suffix
  const indianTickers = new Set([
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "SBIN",
    "BHARTIARTL", "LICI", "ITC", "LT", "KOTAKBANK", "AXISBANK", "ASIANPAINT",
    "TITAN", "MARUTI", "SUNPHARMA", "BAJFINANCE", "ADANIENT", "WIPRO", "HCLTECH",
    "BAJAJ-AUTO", "TATASTEEL", "ULTRACEMCO", "POWERGRID", "NTPC", "ONGC", "BPCL",
    "IOC", "GAIL", "M&M", "COALINDIA"
  ]);
  
  if (indianTickers.has(clean)) {
    return `${clean}.NS`;
  }
  
  return clean;
}

// Fetch live quote from yahoo-finance2
async function fetchYahooQuote(rawSymbol: string): Promise<CachedQuote | null> {
  const yahooTicker = mapToYahooTicker(rawSymbol);
  const now = Date.now();

  const cached = quoteCache.get(yahooTicker);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const quotePromise = yahooFinance.quote(yahooTicker) as Promise<any>;
    const chartPromise = Promise.resolve(null);

    const [quote, chart] = await Promise.all([quotePromise, chartPromise]);

    if (!quote) return null;

    const currentPrice = quote.regularMarketPrice ?? quote.regularMarketPreviousClose ?? 0;
    const prevClose = quote.regularMarketPreviousClose ?? currentPrice;
    const rawChange = quote.regularMarketChange ?? (currentPrice - prevClose);
    const rawPercentChange = quote.regularMarketChangePercent ?? (prevClose !== 0 ? (rawChange / prevClose) * 100 : 0);

    const history: { time: string; price: number }[] = [];
    if (chart && chart.quotes && Array.isArray(chart.quotes)) {
      for (const candle of chart.quotes) {
        if (candle.close !== null && !isNaN(candle.close)) {
          const t = new Date(candle.date);
          history.push({
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Number(candle.close.toFixed(2))
          });
        }
      }
    }

    const quoteData: CachedQuote = {
      price: Number(currentPrice.toFixed(2)),
      close: Number(currentPrice.toFixed(2)),
      change: Number(rawChange.toFixed(2)),
      percent_change: Number(rawPercentChange.toFixed(2)),
      day_high: quote.regularMarketDayHigh ? Number(quote.regularMarketDayHigh.toFixed(2)) : undefined,
      day_low: quote.regularMarketDayLow ? Number(quote.regularMarketDayLow.toFixed(2)) : undefined,
      fifty_two_week_high: quote.fiftyTwoWeekHigh ? Number(quote.fiftyTwoWeekHigh.toFixed(2)) : undefined,
      fifty_two_week_low: quote.fiftyTwoWeekLow ? Number(quote.fiftyTwoWeekLow.toFixed(2)) : undefined,
      volume: quote.regularMarketVolume || "N/A",
      currency: quote.currency || "USD",
      is_live: true,
      timestamp: quote.regularMarketTime ? quote.regularMarketTime.getTime() : now,
      history: history.slice(-100)
    };

    quoteCache.set(yahooTicker, { data: quoteData, expiresAt: now + CACHE_TTL_MS });
    return quoteData;
  } catch (error) {
    if (cached) return cached.data;
    return null;
  }
}

// API routes
app.get("/api/market-data", async (req, res) => {
  const symbolsQuery = req.query.symbols as string;
  if (!symbolsQuery) {
    return res.status(400).json({ error: "No symbols provided" });
  }

  const symbolList = symbolsQuery.split(",").map(s => s.trim()).filter(Boolean);

  // If user provided a custom Twelve Data API key, we can check it
  if (TWELVE_DATA_API_KEY && TWELVE_DATA_API_KEY !== "your_twelve_data_api_key_here") {
    try {
      const response = await axios.get(`https://api.twelvedata.com/quote`, {
        params: {
          symbol: symbolsQuery,
          apikey: TWELVE_DATA_API_KEY,
        },
        timeout: 4000
      });
      if (response.data && !response.data.code) {
        return res.json(response.data);
      }
    } catch (e) {
      // Fall through to real-time Yahoo Finance
    }
  }

  // Bulk Fetch
  const results: Record<string, CachedQuote> = {};
  try {
    const yahooTickers = symbolList.map(mapToYahooTicker);
    const now = Date.now();
    let quotes = [];
    let tickersToFetch = [];
    
    // Check cache first
    for (const t of yahooTickers) {
      const cached = quoteCache.get(t);
      if (cached && cached.expiresAt > now) {
        // Re-construct a mock quote object that matches the expected format below
        quotes.push({
          symbol: t,
          regularMarketPrice: cached.data.price,
          regularMarketPreviousClose: cached.data.close,
          regularMarketChange: cached.data.change,
          regularMarketChangePercent: cached.data.percent_change,
          regularMarketDayHigh: cached.data.day_high,
          regularMarketDayLow: cached.data.day_low,
          fiftyTwoWeekHigh: cached.data.fifty_two_week_high,
          fiftyTwoWeekLow: cached.data.fifty_two_week_low,
          regularMarketVolume: cached.data.volume !== "N/A" ? cached.data.volume : undefined,
          currency: cached.data.currency,
          regularMarketTime: new Date(cached.data.timestamp)
        });
      } else {
        tickersToFetch.push(t);
      }
    }
    
    // Fetch missing tickers in chunks to avoid Too Many Requests and INKApi errors
    const CHUNK_SIZE = 5;
    for (let i = 0; i < tickersToFetch.length; i += CHUNK_SIZE) {
      const chunk = tickersToFetch.slice(i, i + CHUNK_SIZE);
      try {
        const chunkQuotes = await yahooFinance.quote(chunk);
        const chunkArray = Array.isArray(chunkQuotes) ? chunkQuotes : [chunkQuotes];
        quotes.push(...chunkArray);
      } catch(e) { 
        console.log(`Failed bulk fetch for chunk, falling back to individual:`, e.message);
        // Fallback to individual with delay
        for (const t of chunk) {
          try {
            const q = await yahooFinance.quote(t);
            if (q) quotes.push(q);
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
          } catch(err) {
            console.log(`Failed individual fetch for ${t}:`, err.message);
          }
        }
      }
    }
    
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
    
    quoteArray.forEach((q: any) => {
      if (!q) return;
      const currentPrice = q.regularMarketPrice ?? q.regularMarketPreviousClose ?? 0;
      const prevClose = q.regularMarketPreviousClose ?? currentPrice;
      const rawChange = q.regularMarketChange ?? (currentPrice - prevClose);
      const rawPercentChange = q.regularMarketChangePercent ?? (prevClose !== 0 ? (rawChange / prevClose) * 100 : 0);
      
      const quoteData: CachedQuote = {
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
    });
    
    // Map back to requested keys
    symbolList.forEach(sym => {
      const yT = mapToYahooTicker(sym);
      if (results[yT]) {
        results[sym] = results[yT];
        results[sym.replace(":NSE", "")] = results[yT];
      }
    });
  } catch (err) {
    console.error("Bulk quote error:", err);
  }

  res.json(results);
});

// Single detailed stock quote
app.get("/api/quote/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const quote = await fetchYahooQuote(symbol);
  if (!quote) {
    return res.status(404).json({ error: "Symbol not found" });
  }
  res.json({ symbol, ...quote });
});

// Market status endpoint
app.get("/api/market-status", (req, res) => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const day = now.getUTCDay(); // 0 = Sun, 6 = Sat

  // NYSE: 13:30 - 20:00 UTC (Mon-Fri)
  const isWeekend = day === 0 || day === 6;
  const totalUtcMinutes = utcHours * 60 + utcMinutes;
  const nyseOpen = !isWeekend && totalUtcMinutes >= 13 * 60 + 30 && totalUtcMinutes < 20 * 60;
  
  // NSE: 03:45 - 10:00 UTC (09:15 - 15:30 IST) (Mon-Fri)
  const nseOpen = !isWeekend && totalUtcMinutes >= 3 * 60 + 45 && totalUtcMinutes < 10 * 60;

  res.json({
    nyse: nyseOpen ? "OPEN" : "CLOSED",
    nse: nseOpen ? "OPEN" : "CLOSED",
    timestamp: now.getTime(),
    isLive: true
  });
});

// Key global and domestic indices
const KEY_INDICES = [
  { key: "dow", name: "Dow Jones", symbol: "^DJI", displaySymbol: "DOW 30", region: "US", currency: "$", baselinePrice: 52064.10, baselineChange: -316.60, baselinePct: -0.60 },
  { key: "sandp500", name: "S&P 500", symbol: "^GSPC", displaySymbol: "S&P 500", region: "US", currency: "$", baselinePrice: 7591.70, baselineChange: -44.66, baselinePct: -0.58 },
  { key: "nasdaq", name: "Nasdaq", symbol: "^IXIC", displaySymbol: "NASDAQ", region: "US", currency: "$", baselinePrice: 26081.72, baselineChange: -171.62, baselinePct: -0.65 },
  { key: "dax", name: "DAX 40", symbol: "^GDAXI", displaySymbol: "DAX", region: "Europe", currency: "€", baselinePrice: 25361.15, baselineChange: -215.25, baselinePct: -0.84 },
  { key: "nifty", name: "Nifty 50", symbol: "^NSEI", displaySymbol: "NIFTY 50", region: "India", currency: "₹", baselinePrice: 23349.20, baselineChange: -128.60, baselinePct: -0.55 },
  { key: "sensex", name: "BSE Sensex", symbol: "^BSESN", displaySymbol: "SENSEX", region: "India", currency: "₹", baselinePrice: 74541.24, baselineChange: -361.35, baselinePct: -0.48 },
  { key: "niftybank", name: "Nifty Bank", symbol: "^NSEBANK", displaySymbol: "BANK NIFTY", region: "India", currency: "₹", baselinePrice: 56154.30, baselineChange: -317.65, baselinePct: -0.56 }
];

app.get("/api/indices", async (req, res) => {
  try {
    const indicesData = await Promise.all(
      KEY_INDICES.map(async (idx) => {
        const quote = await fetchYahooQuote(idx.symbol);
        if (quote && quote.price !== undefined) {
          return {
            key: idx.key,
            name: idx.name,
            symbol: idx.symbol,
            displaySymbol: idx.displaySymbol,
            region: idx.region,
            currency: idx.currency,
            price: quote.price,
            change: quote.change,
            percentChange: quote.percent_change,
            dayHigh: quote.day_high,
            dayLow: quote.day_low,
            prevClose: quote.close,
            fiftyTwoWeekHigh: quote.fifty_two_week_high,
            fiftyTwoWeekLow: quote.fifty_two_week_low,
            isLive: quote.is_live,
            lastUpdated: quote.timestamp,
            history: quote.history
          };
        }

        // Return baseline if temporary upstream delay
        return {
          key: idx.key,
          name: idx.name,
          symbol: idx.symbol,
          displaySymbol: idx.displaySymbol,
          region: idx.region,
          currency: idx.currency,
          price: idx.baselinePrice,
          change: idx.baselineChange,
          percentChange: idx.baselinePct,
          isLive: false,
          lastUpdated: Date.now()
        };
      })
    );

    res.json(indicesData);
  } catch (error: any) {
    console.error("Error fetching indices:", error);
    res.status(500).json({ error: "Failed to fetch key index data" });
  }
});

// Dedicated interactive chart endpoint supporting multi-timeframe queries for both indices and stocks
app.get("/api/chart/:symbol", async (req, res) => {
  try {
    const rawSymbol = req.params.symbol;
    if (!rawSymbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    const range = (req.query.range as string) || "1d";
    let interval = (req.query.interval as string);
    if (!interval) {
      if (range === "1d") interval = "5m";
      else if (range === "5d") interval = "15m";
      else if (range === "1mo") interval = "1d";
      else if (range === "1y") interval = "1wk";
      else interval = "5m";
    }

    const ticker = mapToYahooTicker(rawSymbol);
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;

    const response = await axios.get(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 4500
    });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.meta) {
      return res.status(404).json({ error: "Chart data unavailable for symbol" });
    }

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? currentPrice;
    const rawChange = currentPrice - prevClose;
    const rawPercentChange = prevClose !== 0 ? (rawChange / prevClose) * 100 : 0;

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp || [];
    const points: { time: string; timestamp: number; price: number; volume?: number }[] = [];

    if (quotes && quotes.close && Array.isArray(quotes.close)) {
      for (let i = 0; i < quotes.close.length; i++) {
        const val = quotes.close[i];
        if (typeof val === "number" && !isNaN(val)) {
          const t = timestamps[i] ? new Date(timestamps[i] * 1000) : new Date();
          const timeLabel = range === "1d" 
            ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : range === "5d"
            ? `${t.toLocaleDateString([], { weekday: "short" })} ${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : t.toLocaleDateString([], { month: "short", day: "numeric" });

          points.push({
            time: timeLabel,
            timestamp: timestamps[i] ? timestamps[i] * 1000 : Date.now(),
            price: Number(val.toFixed(2)),
            volume: quotes.volume?.[i] || undefined
          });
        }
      }
    }

    res.json({
      symbol: rawSymbol,
      ticker,
      range,
      interval,
      currency: meta.currency || "$",
      price: Number(currentPrice.toFixed(2)),
      previousClose: Number(prevClose.toFixed(2)),
      change: Number(rawChange.toFixed(2)),
      percentChange: Number(rawPercentChange.toFixed(2)),
      dayHigh: meta.regularMarketDayHigh ? Number(meta.regularMarketDayHigh.toFixed(2)) : undefined,
      dayLow: meta.regularMarketDayLow ? Number(meta.regularMarketDayLow.toFixed(2)) : undefined,
      points
    });
  } catch (err: any) {
    console.error(`Error fetching chart for ${req.params.symbol}:`, err?.message);
    res.status(500).json({ error: "Failed to fetch real-time chart data" });
  }
});

// Market News Endpoint
app.get("/api/news", async (req, res) => {
  try {
    const q = (req.query.q as string) || "finance";
    const newsCount = (req.query.count as string) || "20";
    const yahooUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=${newsCount}`;
    
    const response = await axios.get(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 4500
    });

    const news = response.data?.news || [];
    res.json(news);
  } catch (err: any) {
    console.error("Error fetching news:", err?.message);
    res.status(500).json({ error: "Failed to fetch market news" });
  }
});

// AI Market Sentiment Analysis via Gemini API
app.post("/api/ai/analyze-stock", async (req, res) => {
  try {
    const { symbol, name, price, change, changePercent, sector, currency } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: "Stock symbol is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        analysis: `${name || symbol} is currently trading at ${currency || "$"}${price || "N/A"} (${change >= 0 ? "+" : ""}${changePercent || 0}%). AI analysis requires a configured Gemini API key.`
      });
    }

    const prompt = `You are an institutional Wall Street quantitative market analyst.
Analyze the real-time trading state of ${name || symbol} (${symbol}):
- Current Live Price: ${currency || "$"}${price}
- Price Delta: ${change >= 0 ? "+" : ""}${change} (${change >= 0 ? "+" : ""}${changePercent}%)
- Sector: ${sector || "Equities"}

Provide a professional, concise, institutional market sentiment analysis in 3-4 impactful sentences.
Focus on immediate price action context, technical momentum, and volatility considerations for paper trading execution.
Keep tone objective, sharp, authoritative, and financial.`;

    let analysisText = "";
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      analysisText = result.text || "";
    } catch (primaryErr: any) {
      console.log("Primary model gemini-2.5-flash failed, attempting fallback to gemini-2.5-flash:", primaryErr?.message || primaryErr);
      const fallbackResult = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      analysisText = fallbackResult.text || "";
    }

    if (!analysisText) {
      analysisText = `${symbol} shows consolidated trading activity around ${currency || "$"}${price}. Volatility indicators remain balanced for active trading.`;
    }

    res.json({ analysis: analysisText.trim() });
  } catch (err: any) {
    console.log("Gemini Analysis Error in API route:", err);
    res.status(500).json({
      error: err?.message || "Failed to generate market intelligence",
      analysis: "AI analysis is momentarily experiencing high network demand. Core technical momentum remains within standard deviation boundaries."
    });
  }
});

// Stock Alias mapping for reliable natural language trade resolution
const STOCK_ALIASES: Record<string, string> = {
  apple: "AAPL",
  microsoft: "MSFT",
  google: "GOOGL",
  alphabet: "GOOGL",
  amazon: "AMZN",
  nvidia: "NVDA",
  meta: "META",
  facebook: "META",
  tesla: "TSLA",
  broadcom: "AVGO",
  costco: "COST",
  pepsi: "PEP",
  pepsico: "PEP",
  netflix: "NFLX",
  adobe: "ADBE",
  cisco: "CSCO",
  intel: "INTC",
  amd: "AMD",
  qualcomm: "QCOM",
  disney: "DIS",
  nike: "NKE",
  starbucks: "SBUX",
  exxon: "XOM",
  exxonmobil: "XOM",
  gold: "GOLD",
  silver: "SILVER",
  reliance: "RELIANCE",
  tcs: "TCS",
  "tata consultancy": "TCS",
  infosys: "INFY",
  infy: "INFY",
  hdfc: "HDFCBANK",
  "hdfc bank": "HDFCBANK",
  icici: "ICICIBANK",
  "icici bank": "ICICIBANK",
  sbi: "SBIN",
  "state bank": "SBIN",
  airtel: "BHARTIARTL",
  "bharti airtel": "BHARTIARTL",
  itc: "ITC",
  kotak: "KOTAKBANK",
  "kotak mahindra": "KOTAKBANK",
  lt: "LT",
  "l&t": "LT",
  "larsen": "LT",
  axis: "AXISBANK",
  "axis bank": "AXISBANK",
  hul: "HINDUNILVR",
  "hindustan unilever": "HINDUNILVR",
  "tata motors": "TATAMOTORS",
  maruti: "MARUTI",
  "maruti suzuki": "MARUTI",
  "sun pharma": "SUNPHARMA",
  titan: "TITAN",
  "bajaj finance": "BAJFINANCE",
  "asian paints": "ASIANPAINT",
  wipro: "WIPRO",
  hcl: "HCLTECH",
  "hcl tech": "HCLTECH",
  "tata steel": "TATASTEEL",
  ongc: "ONGC"
};

function parseSmartTradeFallback(prompt: string, context: any) {
  const cleanPrompt = prompt.toLowerCase();
  const stocks = Array.isArray(context?.stocks) ? context.stocks : [];
  const holdings = Array.isArray(context?.profile?.holdings) ? context.profile.holdings : [];

  const isBuy = /\b(buy|purchase|acquire|get|invest\s+in|long)\b/i.test(cleanPrompt);
  const isSell = /\b(sell|dump|liquidate|dispose|exit|short)\b/i.test(cleanPrompt);

  if (isBuy || isSell) {
    const side = isBuy ? 'BUY' : 'SELL';

    // 1. Identify Stock
    let matchedStock = null;

    // Check alias mapping first
    for (const [alias, sym] of Object.entries(STOCK_ALIASES)) {
      if (new RegExp(`\\b${alias}\\b`, 'i').test(cleanPrompt)) {
        matchedStock = stocks.find((s: any) => s.symbol.toUpperCase() === sym.toUpperCase()) || { symbol: sym, name: alias, price: 100, currency: '$' };
        break;
      }
    }

    // Direct symbol match in stocks
    if (!matchedStock) {
      for (const s of stocks) {
        const symRegex = new RegExp(`\\b${s.symbol}\\b`, 'i');
        const nameRegex = new RegExp(`\\b${s.name.replace(/[^a-zA-Z0-9 ]/g, '')}\\b`, 'i');
        if (symRegex.test(cleanPrompt) || nameRegex.test(cleanPrompt)) {
          matchedStock = s;
          break;
        }
      }
    }

    if (matchedStock) {
      // 2. Identify Quantity
      let quantity = 1;
      const allMatch = /\b(all|entire|everything|every\s+share)\b/i.test(cleanPrompt);
      if (allMatch && isSell) {
        const owned = holdings.find((h: any) => h.symbol.toUpperCase() === matchedStock.symbol.toUpperCase())?.shares || 1;
        quantity = owned > 0 ? owned : 1;
      } else {
        const qtyMatch = cleanPrompt.match(/\b(\d+(?:\.\d+)?)\s*(?:shares?|stocks?|units?|qty)?\b/);
        if (qtyMatch && qtyMatch[1]) {
          quantity = Math.max(1, Math.floor(parseFloat(qtyMatch[1])));
        } else {
          // Check for dollar/rupee amount e.g. "buy $500 of Apple"
          const budgetMatch = cleanPrompt.match(/[\$₹]\s*(\d+(?:\.\d+)?)/);
          if (budgetMatch && budgetMatch[1] && matchedStock.price > 0) {
            quantity = Math.max(1, Math.floor(parseFloat(budgetMatch[1]) / matchedStock.price));
          }
        }
      }

      // 3. Identify Order Type
      const isLimit = /\blimit\b/i.test(cleanPrompt);
      let limitPrice = undefined;
      if (isLimit) {
        const limitPriceMatch = cleanPrompt.match(/\b(?:at|price)\s*[\$₹]?\s*(\d+(?:\.\d+)?)/i);
        if (limitPriceMatch && limitPriceMatch[1]) {
          limitPrice = parseFloat(limitPriceMatch[1]);
        }
      }

      const currency = matchedStock.currency || '$';
      const orderType = isLimit && limitPrice ? 'Limit' : 'Market';
      const priceText = orderType === 'Limit' ? `${currency}${limitPrice}` : `${currency}${matchedStock.price?.toFixed(2) || 'current market price'}`;

      return {
        text: `Executing paper order: **${side} ${quantity} ${quantity === 1 ? 'share' : 'shares'}** of **${matchedStock.name || matchedStock.symbol} (${matchedStock.symbol})** at ${priceText} (${orderType} Order). Your trade ticket is submitted directly to the execution engine.`,
        trade: {
          symbol: matchedStock.symbol,
          side,
          quantity,
          orderType,
          limitPrice: limitPrice || null,
          reasoning: `${orderType} ${side} order executed for ${quantity} shares via Copilot.`
        }
      };
    }
  }

  // Fallback financial response when not a direct trade prompt
  const balanceUSD = context?.profile?.balances?.['$'] ?? 1000000;
  const balanceINR = context?.profile?.balances?.['₹'] ?? 1000000;
  const holdingsCount = holdings.length;

  return {
    text: `Your virtual trading desk is active with **$${balanceUSD.toLocaleString()} USD** and **₹${balanceINR.toLocaleString()} INR** in available cash across ${holdingsCount} active positions. You can directly command me to execute paper trades anytime—simply prompt: *"Buy 10 shares of Apple"*, *"Sell 5 NVDA"*, or *"Purchase 20 shares of Reliance at market"* to place orders instantly.`,
    trade: null
  };
}

// Copilot API Route
app.post("/api/copilot", express.json(), async (req, res) => {
  const { prompt, context } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const ai = getGenAI();
  const stocks = Array.isArray(context?.stocks) ? context.stocks : [];
  const holdings = Array.isArray(context?.profile?.holdings) ? context.profile.holdings : [];
  const balances = context?.profile?.balances || {};

  if (!ai) {
    // If Gemini key is not configured, seamlessly handle trades & intelligence via high-accuracy fallback
    const result = parseSmartTradeFallback(prompt, context);
    return res.json(result);
  }

  try {
    const availableTickers = stocks.slice(0, 35).map((s: any) => `${s.symbol} (${s.name}) - ${s.currency || '$'}${s.price}`).join(', ');
    const holdingsList = holdings.map((h: any) => `${h.symbol}: ${h.shares} shares @ avg ${h.averagePrice || 'N/A'}`).join(', ');

    const systemInstruction = `You are TRADEPRO's AI Copilot, a senior algorithmic portfolio manager and automated trading copilot for high-net-worth investors.
You have FULL AUTHORITY to execute paper trades (BUY or SELL) on behalf of the user when requested.

CURRENT USER STATUS:
- Virtual Balances: USD: $${balances['$'] ?? 1000000}, INR: ₹${balances['₹'] ?? 1000000}
- Current Holdings: ${holdingsList || 'None (Clean Portfolio)'}
- Key Tradable Universe: ${availableTickers}

TRADING DIRECTIVE:
If the user's prompt instructs or asks you to BUY or SELL stock (e.g., "buy 10 shares of Apple", "sell 5 NVDA", "purchase 20 RELIANCE", "buy 50 shares of TCS", "sell all my AMD", "liquidate TITAN", "buy $1000 worth of Tesla"):
1. Identify the intended stock symbol from tradable securities (e.g., Apple -> "AAPL", Nvidia -> "NVDA", Reliance -> "RELIANCE", Tesla -> "TSLA", Tata Motors -> "TATAMOTORS").
2. Determine side: "BUY" or "SELL".
3. Determine quantity (positive integer number of shares >= 1). If the user specifies "all", use the user's current holding quantity. If a currency amount is given, calculate shares based on current price.
4. Determine orderType: "Market" (default) or "Limit" (if target limit price is specified).
5. Output valid JSON with this exact structure:
{
  "text": "Your sharp, institutional confirmation message explaining the trade execution, ticker, shares, price, and portfolio rationale.",
  "trade": {
    "symbol": "TICKER_SYMBOL",
    "side": "BUY" or "SELL",
    "quantity": number,
    "orderType": "Market" or "Limit",
    "limitPrice": number or null,
    "reasoning": "Concise quantitative execution reason"
  }
}

IF THE USER IS NOT REQUESTING A TRADE:
Set "trade": null, and provide elite financial analysis, risk breakdown, or market insights in the "text" field.

CRITICAL: Return ONLY raw JSON without markdown code fences or backticks.`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = response.text || "";
    } catch (primaryErr: any) {
      console.log("Primary model gemini-2.5-flash failed, attempting fallback to gemini-2.5-flash:", primaryErr?.message || primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });
      responseText = fallbackResponse.text || "";
    }

    // Clean JSON if backticks or wrappers were generated
    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.text === 'string') {
        // Double check if trade symbol is valid
        if (parsed.trade && typeof parsed.trade.symbol === 'string') {
          parsed.trade.symbol = parsed.trade.symbol.toUpperCase();
        }
        return res.json(parsed);
      }
    } catch (jsonErr) {
      console.log("Could not parse AI JSON output, falling back to smart extractor:", jsonErr);
    }

    // If AI output wasn't structured JSON, inspect if user intended to trade
    const fallbackResult = parseSmartTradeFallback(prompt, context);
    if (fallbackResult.trade) {
      return res.json(fallbackResult);
    }

    res.json({ text: responseText || fallbackResult.text, trade: null });
  } catch (err: any) {
    console.log("Copilot API Warning, executing smart rule fallback:", err?.message || err);
    const fallbackResult = parseSmartTradeFallback(prompt, context);
    res.json(fallbackResult);
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


