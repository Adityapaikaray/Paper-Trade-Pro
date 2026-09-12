const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

if (!code.includes('const [moversType, setMoversType] = useState')) {
  code = code.replace(
    "const [sortMode, setSortMode] = useState('Value (High → Low)');",
    "const [sortMode, setSortMode] = useState('Value (High → Low)');\n  const [moversType, setMoversType] = useState<'gainers'|'losers'>('gainers');"
  );
  
  code = code.replace(
    "const topMovers = stocks\n    .filter(s => contextCountry === 'All' || s.country === contextCountry)\n    .sort((a, b) => b.changePercent - a.changePercent)",
    "const topMovers = stocks\n    .filter(s => contextCountry === 'All' || s.country === contextCountry)\n    .sort((a, b) => moversType === 'gainers' ? b.changePercent - a.changePercent : a.changePercent - b.changePercent)"
  );
  
  code = code.replace(
    /<button className="flex-1 py-1\.5 text-xs font-bold rounded-lg bg-ui-bg border border-primary text-primary-dark">Gainers<\/button>/,
    `<button onClick={() => setMoversType('gainers')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors \${moversType === 'gainers' ? 'bg-ui-bg border border-primary text-primary-dark' : 'bg-transparent text-text-muted hover:bg-ui-bg'}\`}>Gainers</button>`
  );
  
  code = code.replace(
    /<button className="flex-1 py-1\.5 text-xs font-bold rounded-lg bg-transparent text-text-muted hover:bg-ui-bg transition-colors">Losers<\/button>/,
    `<button onClick={() => setMoversType('losers')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors \${moversType === 'losers' ? 'bg-ui-bg border border-primary text-primary-dark' : 'bg-transparent text-text-muted hover:bg-ui-bg'}\`}>Losers</button>`
  );
  
  code = code.replace(
    /<span className="text-xs font-mono font-bold text-positive">\{mover\.v\}<\/span>/,
    `<span className={\`text-xs font-mono font-bold \${moversType === 'gainers' ? 'text-positive' : 'text-negative'}\`}>{mover.v}</span>`
  );
  
  fs.writeFileSync('src/components/DashboardView.tsx', code);
  console.log("Patched DashboardView Movers");
}
