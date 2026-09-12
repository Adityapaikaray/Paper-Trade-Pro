const fs = require('fs');

const filesToFix = [
  'src/components/DashboardView.tsx',
  'src/components/PortfolioView.tsx',
  'src/components/TradeModal.tsx',
  'src/components/PortfolioHistoryRecorder.tsx',
  'src/contexts/PortfolioContext.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/profile\.holdings/g, '(profile?.holdings || [])');
  content = content.replace(/prev\.holdings/g, '(prev?.holdings || [])');

  fs.writeFileSync(file, content);
});
