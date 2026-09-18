const fs = require('fs');
let code = fs.readFileSync('src/components/StockChart.tsx', 'utf8');

const targetStr = `  // Initialize data from stock.history or generate sensible points
  useEffect(() => {
    if (selectedRange === '1D') {
      if (Array.isArray(stock.history) && stock.history.length > 0) {
        const points = stock.history.map((pt, i) => ({
          time: pt.time,
          price: pt.price,
          timestamp: Date.now() - (stock.history!.length - i) * 60000
        }));
        setHistory(points);
      } else {
        // Fallback: 30 point walk anchored to prevClose / price
        const points = 30;
        const initial: ChartPoint[] = [];
        const base = stock.prevClose || stock.price;
        const delta = stock.price - base;
        
        for (let i = points; i >= 0; i--) {
          const t = new Date(Date.now() - i * 60000);
          const ratio = (points - i) / points;
          const noise = (Math.random() - 0.48) * (stock.price * 0.003);
          const p = Number((base + delta * ratio + noise).toFixed(2));
          initial.push({
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: i === 0 ? stock.price : p,
            timestamp: t.getTime()
          });
        }
        setHistory(initial);
      }
    }
  }, [stock.symbol, stock.history, selectedRange]);`;

const newStr = `  // Initialize data from API
  useEffect(() => {
    let rangeQuery = selectedRange;
    let intervalQuery = '1d';
    if (selectedRange === '1D') intervalQuery = '15m';
    if (selectedRange === '1W') intervalQuery = '1h';
    if (selectedRange === '1M') intervalQuery = '1d';
    if (selectedRange === 'ALL') { rangeQuery = 'MAX'; intervalQuery = '1mo'; }

    const exchange = (stock as any).exchange || 'NSE';
    axios.get(\`/api/historical/\${exchange}/\${stock.symbol}?range=\${rangeQuery}&interval=\${intervalQuery}\`)
      .then(res => {
        const data = res.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setHistory(data.map(d => ({
            time: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            price: d.close,
            timestamp: d.timestamp,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume
          })));
        } else {
          // Fallback if API fails
          setHistory([
             { time: "09:15", price: stock.prevClose || stock.price, timestamp: Date.now() - 3600000 },
             { time: "Now", price: stock.price, timestamp: Date.now() }
          ]);
        }
      })
      .catch(e => console.error(e));
  }, [stock.symbol, selectedRange]);`;

code = code.replace(targetStr, newStr);

fs.writeFileSync('src/components/StockChart.tsx', code);
