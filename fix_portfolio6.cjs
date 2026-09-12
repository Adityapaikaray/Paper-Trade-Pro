const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

code = code.replace(/if \(!balances\['[\s\S]*?return \{/, "if (!balances['$$']) balances['$$'] = 0;\n      if (!balances['₹']) balances['₹'] = 0;\n      \n      return {");

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
