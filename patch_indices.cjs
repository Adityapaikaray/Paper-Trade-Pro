const fs = require('fs');

let code = fs.readFileSync('src/contexts/MarketContext.tsx', 'utf8');

const targetStart = code.indexOf('// Update indices');
const targetEnd = code.indexOf('if (hasLiveData) {');

if (targetStart !== -1 && targetEnd !== -1) {
  const newIndexUpdate = `
      // Update indices
      if (indicesRes.status === 'fulfilled' && typeof indicesRes.value.data === 'object' && !Array.isArray(indicesRes.value.data)) {
        const liveIndicesDict = indicesRes.value.data;
        hasLiveData = true;
        setIndices(currentIndices =>
          currentIndices.map(existing => {
            const apiSymbol = existing.symbol;
            // Depending on how YahooProvider formats it, the key is usually 'UNKNOWN:^DJI' or 'UNKNOWN:DJI'
            const possibleKeys = [\`UNKNOWN:\${apiSymbol}\`, \`NSE:\${apiSymbol}\`, \`BSE:\${apiSymbol}\`, \`UNKNOWN:\${apiSymbol.replace('^', '')}\`];
            const incomingKey = Object.keys(liveIndicesDict).find(k => possibleKeys.includes(k) || k.includes(apiSymbol));
            const incoming = incomingKey ? liveIndicesDict[incomingKey] : null;
            
            if (incoming && incoming.price !== undefined) {
              const oldPrice = prevIndexPricesRef.current[existing.key] ?? existing.price;
              if (incoming.price > oldPrice + 0.001) {
                triggerIndexTick(existing.key, 'up');
              } else if (incoming.price < oldPrice - 0.001) {
                triggerIndexTick(existing.key, 'down');
              }
              prevIndexPricesRef.current[existing.key] = incoming.price;

              return {
                ...existing,
                price: incoming.price,
                change: incoming.change,
                percentChange: incoming.changePercent,
                lastUpdated: incoming.timestamp || Date.now(),
                isLive: true
              };
            }
            return existing;
          })
        );
      }
      
      `;
  
  code = code.substring(0, targetStart) + newIndexUpdate + code.substring(targetEnd);
  fs.writeFileSync('src/contexts/MarketContext.tsx', code);
} else {
  console.log("Could not find targets in MarketContext");
}
