const fs = require('fs');
let code = fs.readFileSync('src/components/KeyIndexView.tsx', 'utf8');

code = code.replace(
  "const [regionFilter, setRegionFilter] = useState<string>(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));",
  "const [regionFilter, setRegionFilter] = useState<string>(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));\n\n  React.useEffect(() => {\n    setRegionFilter(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));\n  }, [marketContext]);"
);

// We should also sync selectedKey to the first index of the new region
code = code.replace(
  "React.useEffect(() => {",
  `React.useEffect(() => {
    const newRegion = marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL');
    const firstIndex = indices.find(idx => newRegion === 'ALL' || idx.region === newRegion);
    if (firstIndex) setSelectedKey(firstIndex.key);`
);

fs.writeFileSync('src/components/KeyIndexView.tsx', code);
console.log("Patched KeyIndexView.tsx sync");
