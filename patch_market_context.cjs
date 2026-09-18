const fs = require('fs');

let code = fs.readFileSync('src/contexts/MarketContext.tsx', 'utf8');

// Replace the /api/market-data calls with /api/quotes
code = code.replace(/axios\.get\(\`\/api\/market-data\?symbols=\$\{batch1\}\`\)/g, 'axios.get(`/api/quotes?symbols=${batch1}`)');
code = code.replace(/axios\.get\(\`\/api\/market-data\?symbols=\$\{batch2\}\`\)/g, 'axios.get(`/api/quotes?symbols=${batch2}`)');

// Map the new fields (price, change, changePercent, high, low, previousClose, volume, fiftyTwoWeekHigh, fiftyTwoWeekLow)
const oldMapping = `              change: parseFloat(liveData.change ?? '0'),
              changePercent: parseFloat(liveData.percent_change ?? '0'),
              dayHigh: liveData.day_high,
              dayLow: liveData.day_low,
              prevClose: liveData.previous_close,
              fiftyTwoWeekHigh: liveData.fifty_two_week_high,
              fiftyTwoWeekLow: liveData.fifty_two_week_low,
              volume: formatVolume(liveData.volume) !== 'N/A' ? formatVolume(liveData.volume) : stock.volume,
              isRealtime: true,
              lastUpdated: liveData.timestamp || now,
              history: Array.isArray(liveData.history) ? liveData.history : stock.history,`;

const newMapping = `              change: parseFloat(liveData.change ?? '0'),
              changePercent: parseFloat(liveData.changePercent ?? '0'),
              dayHigh: liveData.high,
              dayLow: liveData.low,
              prevClose: liveData.previousClose,
              fiftyTwoWeekHigh: liveData.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: liveData.fiftyTwoWeekLow,
              volume: formatVolume(liveData.volume) !== 'N/A' ? formatVolume(liveData.volume) : stock.volume,
              isRealtime: liveData.isRealtime || false,
              lastUpdated: liveData.timestamp || now,
              history: Array.isArray(liveData.history) ? liveData.history : stock.history,`;

code = code.replace(oldMapping, newMapping);

fs.writeFileSync('src/contexts/MarketContext.tsx', code);
