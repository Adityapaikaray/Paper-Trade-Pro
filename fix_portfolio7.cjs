const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

// Find the first occurrence of `export const usePortfolio`
const usePortfolioIndex = code.indexOf('export const usePortfolio');
if (usePortfolioIndex !== -1) {
  // Find the closing brace of that function
  const endIdx = code.indexOf('};', usePortfolioIndex);
  if (endIdx !== -1) {
    code = code.substring(0, endIdx + 2) + "\n";
  }
}

// Now replace the broken initial balances
code = code.replace(/const INITIAL_BALANCES = \{ 'interface PortfolioContextType \{/, "const INITIAL_BALANCES = { '$': 0, '₹': 0 };\n\ninterface PortfolioContextType {");

// Also replace the old upgrade logic
code = code.replace(/if \(\!balances\['\$'\] \|\| balances\['\$'\] === 100000\) balances\['\$'\] = 1000000;\n\s*if \(\!balances\['₹'\]\) balances\['₹'\] = 1000000;/, "if (!balances['$']) balances['$'] = 0;\n      if (!balances['₹']) balances['₹'] = 0;");

// Finally, make sure addFunds is there
if (!code.includes('addFunds')) {
  code = code.replace(
    "resetAccount: (marketRegion?: MarketRegion) => void;",
    "resetAccount: (marketRegion?: MarketRegion) => void;\n  addFunds: (amount: number, currency: string) => void;"
  );
  
  code = code.replace(
    "const setPreferredCurrency = (currency: Currency) => {\n    setProfile(prev => ({ ...prev, preferredCurrency: currency }));\n  };",
    "const setPreferredCurrency = (currency: Currency) => {\n    setProfile(prev => ({ ...prev, preferredCurrency: currency }));\n  };\n\n  const addFunds = (amount: number, currency: string) => {\n    setProfile(prev => ({ ...prev, balances: { ...prev.balances, [currency]: (prev.balances[currency] || 0) + amount } }));\n  };"
  );
  
  code = code.replace(
    "setPreferredCurrency,\n       resetAccount",
    "setPreferredCurrency,\n       resetAccount,\n       addFunds"
  );
}

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
