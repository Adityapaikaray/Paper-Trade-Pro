const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

// Change INITIAL_BALANCES to 0
code = code.replace(
  "const INITIAL_BALANCES = { '$': 1000000, '₹': 1000000 };",
  "const INITIAL_BALANCES = { '$': 0, '₹': 0 };"
);

// Add addFunds to interface
code = code.replace(
  "resetAccount: (marketRegion?: MarketRegion) => void;",
  "resetAccount: (marketRegion?: MarketRegion) => void;\n  addFunds: (amount: number, currency: string) => void;"
);

// Add addFunds implementation
code = code.replace(
  "const setPreferredCurrency = (currency: Currency) => {\n    setProfile(prev => ({ ...prev, preferredCurrency: currency }));\n  };",
  "const setPreferredCurrency = (currency: Currency) => {\n    setProfile(prev => ({ ...prev, preferredCurrency: currency }));\n  };\n\n  const addFunds = (amount: number, currency: string) => {\n    setProfile(prev => ({ ...prev, balances: { ...prev.balances, [currency]: (prev.balances[currency] || 0) + amount } }));\n  };"
);

// Add addFunds to export
code = code.replace(
  "setPreferredCurrency,\n       resetAccount",
  "setPreferredCurrency,\n       resetAccount,\n       addFunds"
);

// We should also modify the upgrade logic which overrides $100,000 to $1,000,000.
// We'll just remove that upgrade logic to ensure it doesn't force 1,000,000.
code = code.replace(
  "      if (!balances['$'] || balances['$'] === 100000) balances['$'] = 1000000;\n      if (!balances['₹']) balances['₹'] = 1000000;",
  "      if (!balances['$']) balances['$'] = 0;\n      if (!balances['₹']) balances['₹'] = 0;"
);

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
console.log("Patched PortfolioContext.");
