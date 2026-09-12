const fs = require('fs');
let code = fs.readFileSync('src/components/KeyIndexView.tsx', 'utf8');

if (!code.includes('usePortfolio')) {
  code = code.replace(
    "import { useMarketData } from '../hooks/useMarketData.ts';",
    "import { useMarketData } from '../hooks/useMarketData.ts';\nimport { usePortfolio } from '../contexts/PortfolioContext.tsx';"
  );
  
  code = code.replace(
    "const { indices, indexTicks, stocks, isLive, lastUpdated, refresh, isLoading, marketStatus } = useMarketData();",
    "const { indices, indexTicks, stocks, isLive, lastUpdated, refresh, isLoading, marketStatus } = useMarketData();\n  const { marketContext } = usePortfolio();"
  );
  
  code = code.replace(
    "const [regionFilter, setRegionFilter] = useState<string>('ALL');",
    "const [regionFilter, setRegionFilter] = useState<string>(marketContext === 'IN' ? 'India' : (marketContext === 'US' ? 'US' : 'ALL'));"
  );
  
  fs.writeFileSync('src/components/KeyIndexView.tsx', code);
  console.log("Patched KeyIndexView.tsx");
}
