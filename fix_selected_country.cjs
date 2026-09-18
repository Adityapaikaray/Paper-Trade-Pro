const fs = require('fs');
let code = fs.readFileSync('src/components/MarketView.tsx', 'utf8');

code = code.replace(/setSelectedCountry/g, 'setSelectedExchange');
code = code.replace(/selectedCountry/g, 'selectedExchange');
code = code.replace(/exchanges\.map\(country => \(/g, 'exchanges.map(exchange => (');
code = code.replace(/key=\{country\}/g, 'key={exchange}');
code = code.replace(/setSelectedExchange\(country\)/g, 'setSelectedExchange(exchange)');
code = code.replace(/selectedExchange === country/g, 'selectedExchange === exchange');
code = code.replace(/\{country\}/g, '{exchange}');

fs.writeFileSync('src/components/MarketView.tsx', code);
