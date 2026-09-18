const fs = require('fs');

let code = fs.readFileSync('src/contexts/MarketContext.tsx', 'utf8');

const oldIndexUpdate = `
      // Update indices
      if (indicesRes.status === 'fulfilled' && Array.isArray(indicesRes.value.data)) {
        const liveIndices = indicesRes.value.data as IndexQuote[];
        if (liveIndices.length > 0) {
          hasLiveData = true;
          setIndices(currentIndices =>
            currentIndices.map(existing => {
              const incoming = liveIndices.find(idx => idx.key === existing.key || idx.symbol === existing.symbol);
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
                  ...incoming,
                  lastUpdated: incoming.lastUpdated || now,
                  isLive: true
                };
              }
              return existing;
            })
          );
        }
      }
`;

const newIndexUpdate = `
      // Update indices
      if (indicesRes.status === 'fulfilled' && typeof indicesRes.value.data === 'object') {
        const liveIndicesDict = indicesRes.value.data;
        hasLiveData = true;
        setIndices(currentIndices =>
          currentIndices.map(existing => {
            const apiSymbol = existing.symbol.startsWith('^') ? existing.symbol : \`^\${existing.symbol}\`;
            const lookupKey = \`UNKNOWN:\${apiSymbol}\`;
            const incoming = liveIndicesDict[lookupKey];
            
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
                lastUpdated: incoming.timestamp || now,
                isLive: true
              };
            }
            return existing;
          })
        );
      }
`;

// It might be hard to match the exact string, let's just do a manual string replace or regex.
// Actually I'll just write a script that finds "// Update indices" and replaces everything until "if (hasLiveData) {"
