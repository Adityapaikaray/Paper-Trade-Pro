const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

if (!code.includes("import { usePortfolio } from '../contexts/PortfolioContext.tsx';")) {
  code = code.replace(/import \{ useMarketData \} from '\.\.\/contexts\/MarketContext\.tsx';/, "import { useMarketData } from '../contexts/MarketContext.tsx';\nimport { usePortfolio } from '../contexts/PortfolioContext.tsx';");
}

fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
