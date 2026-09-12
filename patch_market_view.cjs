const fs = require('fs');
let code = fs.readFileSync('src/components/MarketView.tsx', 'utf8');

code = code.replace(
  "const { toggleWatchlist, isWatchlisted } = usePortfolio();",
  "const { toggleWatchlist, isWatchlisted, marketContext } = usePortfolio();"
);

code = code.replace(
  "const [selectedCountry, setSelectedCountry] = React.useState('All');",
  "const [selectedCountry, setSelectedCountry] = React.useState('All');"
);

const filterLogic = `
  const contextCountry = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'USA' : 'All');

  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = contextCountry !== 'All' ? s.country === contextCountry : (selectedCountry === 'All' || s.country === selectedCountry);
    const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
    return matchesSearch && matchesCountry && matchesSector;
  });
`;

code = code.replace(
  /const filteredStocks = stocks\.filter\(s => \{[\s\S]*?return matchesSearch && matchesCountry && matchesSector;\n  \}\);/,
  filterLogic
);

// We should also remove the country filter dropdown if the market context is set, or just hide it.
code = code.replace(
  /<select\n                value=\{selectedCountry\}[\s\S]*?<\/select>/,
  `{contextCountry === 'All' && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full md:w-48 bg-ui-bg border border-ui-border text-text-main text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary appearance-none custom-select"
              >
                {countries.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Regions' : c}</option>
                ))}
              </select>
            )}`
);

fs.writeFileSync('src/components/MarketView.tsx', code);
console.log("Patched MarketView.tsx");
