const fs = require('fs');
let code = fs.readFileSync('src/components/ResearchView.tsx', 'utf8');

// Add import
if (!code.includes('getStockAnalysis')) {
  code = code.replace(/import StockChart from '.\/StockChart.tsx';/, `import StockChart from './StockChart.tsx';\nimport { getStockAnalysis } from '../services/geminiService.ts';`);
}

// Add state
if (!code.includes('const [aiAnalysis, setAiAnalysis]')) {
  code = code.replace(/const \[searchQuery, setSearchQuery\] = useState\(''\);/, `const [searchQuery, setSearchQuery] = useState('');\n  const [aiAnalysis, setAiAnalysis] = useState('Loading intelligence...');`);
}

// Add effect
const effectCode = `
  useEffect(() => {
    if (currentStock) {
      setAiAnalysis('Generating institutional market intelligence for ' + currentStock.symbol + '...');
      getStockAnalysis(currentStock).then(setAiAnalysis).catch(() => setAiAnalysis('Analysis unavailable.'));
    }
  }, [currentStock?.symbol]);
`;
if (!code.includes('getStockAnalysis(currentStock)')) {
  code = code.replace(/const currentStock = stocks\.find/, effectCode + '\n  const currentStock = stocks.find');
}

// Inject into UI
// ResearchView has a "Stock Overview Banner" and then probably a grid. We'll add the AI box right after the banner.
// I'll just find {/* Financials & Chart */} and insert it there.
const aiBox = `
      {/* AI Intelligence Box */}
      <div className="bg-ui-surface rounded-2xl p-6 border border-ui-border shadow-sm mb-8">
        <h3 className="text-sm font-bold text-text-main mb-3 flex items-center">
          <Star size={16} className="text-primary mr-2" /> 
          TradePro AI Analyst 
        </h3>
        <p className="text-sm text-text-muted leading-relaxed">
          {aiAnalysis}
        </p>
      </div>
`;
if (!code.includes('TradePro AI Analyst')) {
  code = code.replace(/\{(\/\* Financials|!currentStock)/, aiBox + '\n      {$1');
}

fs.writeFileSync('src/components/ResearchView.tsx', code);
