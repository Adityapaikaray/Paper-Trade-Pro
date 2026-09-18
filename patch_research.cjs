const fs = require('fs');
let code = fs.readFileSync('src/components/ResearchView.tsx', 'utf8');

// First, add axios import if not exists
if (!code.includes('import axios')) {
  code = code.replace(/import React, { useState } from 'react';/, `import React, { useState, useEffect } from 'react';\nimport axios from 'axios';`);
} else {
  code = code.replace(/import React, { useState } from 'react';/, `import React, { useState, useEffect } from 'react';`);
}

// Replace the filteredStocks logic
const oldLogic = `  const currentStock = stocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || stocks[0];
  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks.slice(0, 6);`;

const newLogic = `  const currentStock = stocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || stocks[0];
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      axios.get(\`/api/instruments/search?q=\${searchQuery}\`)
        .then(res => {
          setSearchResults(res.data.slice(0, 8));
        })
        .catch(console.error);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const displayResults = searchQuery.trim() ? searchResults.map(r => ({
    symbol: r.exchange_symbol || r.display_name,
    name: r.company_name,
    exchange: r.exchange
  })) : stocks.slice(0, 6);
`;

code = code.replace(oldLogic, newLogic);

// Replace mapping filteredStocks -> displayResults
code = code.replace(/filteredStocks\.map/g, "displayResults.map");

fs.writeFileSync('src/components/ResearchView.tsx', code);
