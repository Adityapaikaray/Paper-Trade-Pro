const fs = require('fs');
let code = fs.readFileSync('src/components/MarketView.tsx', 'utf8');

// Replace country with exchange
code = code.replace(/const \[selectedCountry, setSelectedCountry\] = React\.useState\('All'\);/g, "const [selectedExchange, setSelectedExchange] = React.useState('All');");
code = code.replace(/const countries = \['All', \.\.\.new Set\(stocks\.map\(s => s\.country\)\)\];/g, "const exchanges = ['All', 'NSE', 'BSE', ...new Set(stocks.filter(s => s.exchange && s.exchange !== 'NSE' && s.exchange !== 'BSE').map(s => s.exchange))];");

code = code.replace(/const contextCountry = marketContext === 'IN' \? 'India' : \(marketContext === 'US' \? 'USA' : 'All'\);/g, "const contextExchange = marketContext === 'IN' ? 'NSE' : (marketContext === 'US' ? 'US' : 'All');");

code = code.replace(/const matchesCountry = contextCountry !== 'All' \? s\.country === contextCountry : \(selectedCountry === 'All' \|\| s\.country === selectedCountry\);/g, "const matchesExchange = contextExchange !== 'All' ? s.exchange === contextExchange : (selectedExchange === 'All' || s.exchange === selectedExchange);");
code = code.replace(/return matchesSearch && matchesCountry && matchesSector;/g, "return matchesSearch && matchesExchange && matchesSector;");

// Update UI
code = code.replace(/value=\{selectedCountry\}/g, "value={selectedExchange}");
code = code.replace(/onChange=\{\(e\) => setSelectedCountry\(e\.target\.value\)\}/g, "onChange={(e) => setSelectedExchange(e.target.value)}");
code = code.replace(/countries\.map/g, "exchanges.map");
code = code.replace(/\{c \|\| 'Unknown'\}/g, "{c}");

fs.writeFileSync('src/components/MarketView.tsx', code);
