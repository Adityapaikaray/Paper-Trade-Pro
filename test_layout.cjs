const fs = require('fs');

let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// Center and constrain the width of the positions container
code = code.replace(
  /<div className="flex flex-col gap-6">/,
  '<div className="flex flex-col gap-8 max-w-5xl mx-auto">'
);

// Keep the header aligned with the constrained container
code = code.replace(
  /<header>/,
  '<header className="max-w-5xl mx-auto w-full">'
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
