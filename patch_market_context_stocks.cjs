const fs = require('fs');
let code = fs.readFileSync('src/contexts/MarketContext.tsx', 'utf8');

// Replace the initial state
code = code.replace(/const \[stocks, setStocks\] = useState<Stock\[\]>\(MOCK_STOCKS\);/, `const [stocks, setStocks] = useState<Stock[]>([]);`);

// In fetchData, we should first fetch instruments if stocks is empty
const fetchDataStart = `
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let currentStocksList = stocks;
      if (currentStocksList.length === 0) {
        const instRes = await axios.get('/api/instruments');
        currentStocksList = instRes.data.map((i: any) => ({
          symbol: i.exchange_symbol || i.display_name,
          name: i.company_name,
          price: 100,
          change: 0,
          changePercent: 0,
          volume: "0",
          marketCap: "N/A",
          pe: "N/A",
          sector: i.sector || 'Unknown',
          country: i.exchange === 'NSE' || i.exchange === 'BSE' ? 'India' : 'USA',
          exchange: i.exchange,
          history: []
        }));
        setStocks(currentStocksList);
      }
      
      const symbolsToFetch = currentStocksList.map((s: any) => \`\${s.exchange}:\${s.symbol}\`).join(',');
      if (!symbolsToFetch) {
        setIsLoading(false);
        return;
      }
      
      const [res1, indicesRes] = await Promise.allSettled([
        axios.get(\`/api/quotes?symbols=\${symbolsToFetch}\`),
        axios.get('/api/indices')
      ]);
      
      const allData = res1.status === 'fulfilled' ? res1.value.data : {};
`;

// It is too hard to string replace this safely, I will just rewrite the `fetchData` function with regex matching the start and end.
const targetStart = code.indexOf('const fetchData = useCallback(async () => {');
const targetEnd = code.indexOf('// Update indices');

const newFetchData = `
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let currentStocksList = stocks;
      
      // We need a ref to track if we've fetched instruments yet to avoid stale closure issues
      if (currentStocksList.length === 0 && !window.__instrumentsFetched) {
        window.__instrumentsFetched = true;
        const instRes = await axios.get('/api/instruments');
        currentStocksList = instRes.data.map((i: any) => ({
          symbol: i.exchange_symbol || i.display_name,
          name: i.company_name,
          price: 0,
          change: 0,
          changePercent: 0,
          volume: "0",
          marketCap: "N/A",
          pe: "N/A",
          sector: i.sector || 'Unknown',
          country: i.exchange === 'NSE' || i.exchange === 'BSE' ? 'India' : 'USA',
          exchange: i.exchange,
          history: []
        }));
        setStocks(currentStocksList);
      }
      
      if (currentStocksList.length === 0) {
        setIsLoading(false);
        return;
      }

      const symbolsToFetch = currentStocksList.map((s: any) => \`\${s.exchange || 'NSE'}:\${s.symbol}\`).join(',');
      
      const [res1, indicesRes] = await Promise.allSettled([
        axios.get(\`/api/quotes?symbols=\${symbolsToFetch}\`),
        axios.get('/api/indices')
      ]);

      const allData = res1.status === 'fulfilled' ? res1.value.data : {};
      const now = Date.now();
      let hasLiveData = false;

      setStocks(current =>
        current.map(stock => {
          const apiSymbol = \`\${stock.exchange || 'NSE'}:\${stock.symbol}\`;
          const liveData = allData[apiSymbol];

          if (liveData && liveData.price !== undefined) {
            hasLiveData = true;
            const newPrice = liveData.price;
            const oldPrice = prevPricesRef.current[stock.symbol] ?? stock.price;

            if (newPrice > oldPrice + 0.001) {
              triggerTick(stock.symbol, 'up');
            } else if (newPrice < oldPrice - 0.001) {
              triggerTick(stock.symbol, 'down');
            }

            prevPricesRef.current[stock.symbol] = newPrice;

            return {
              ...stock,
              price: newPrice,
              change: liveData.change,
              changePercent: liveData.changePercent,
              dayHigh: liveData.high,
              dayLow: liveData.low,
              prevClose: liveData.previousClose,
              fiftyTwoWeekHigh: liveData.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: liveData.fiftyTwoWeekLow,
              volume: typeof liveData.volume === 'number' ? liveData.volume.toString() : liveData.volume,
              isRealtime: liveData.isRealtime || false,
              lastUpdated: liveData.timestamp || now,
            };
          }
          return stock;
        })
      );
      
`;

code = code.substring(0, targetStart) + newFetchData + code.substring(targetEnd);

// Extend Window interface for the hack
code = code.replace(/import axios from 'axios';/, `import axios from 'axios';\ndeclare global {\n  interface Window {\n    __instrumentsFetched: boolean;\n  }\n}`);

fs.writeFileSync('src/contexts/MarketContext.tsx', code);
