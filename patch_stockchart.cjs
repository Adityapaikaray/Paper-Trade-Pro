const fs = require('fs');
let code = fs.readFileSync('src/components/StockChart.tsx', 'utf8');

// Replace the data fetching logic to use our API
code = code.replace(/axios\.get\(\`\/api\/chart\/\$\{stock.symbol\}\`[\s\S]*?setChartData\(data\);\n\s*\}\n\s*\}\);/, `axios.get(\`/api/historical/\${stock.exchange || 'NSE'}/\${stock.symbol}?range=\${range}&interval=\${interval}\`).then(res => {
      const data = res.data;
      if (data && Array.isArray(data) && data.length > 0) {
        setChartData(data.map(d => ({
          time: new Date(d.timestamp).toLocaleDateString(),
          price: d.close,
          timestamp: d.timestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume
        })));
      }
    });`);

fs.writeFileSync('src/components/StockChart.tsx', code);
