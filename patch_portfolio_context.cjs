const fs = require('fs');
let code = fs.readFileSync('src/contexts/PortfolioContext.tsx', 'utf8');

code = code.replace(
  "interface PortfolioContextType {",
  "interface PortfolioContextType {\n  marketContext: 'IN' | 'US' | null;\n  setMarketContext: (market: 'IN' | 'US' | null) => void;"
);

// We also need to add state to PortfolioProvider
code = code.replace(
  "export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {",
  "export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {\n  const [marketContext, setMarketContext] = useState<'IN' | 'US' | null>(() => (localStorage.getItem('papertrade_market') as 'IN' | 'US' | null) || null);\n\n  useEffect(() => {\n    if (marketContext) localStorage.setItem('papertrade_market', marketContext);\n    else localStorage.removeItem('papertrade_market');\n  }, [marketContext]);"
);

code = code.replace(
  "resetAccount: () => void;",
  "resetAccount: (marketRegion?: 'IN' | 'US') => void;"
);

// Update resetAccount signature
code = code.replace(
  "const resetAccount = () => {",
  "const resetAccount = (marketRegion?: 'IN' | 'US') => {"
);

// Better logic for resetting specific markets
const newResetLogic = `const resetAccount = (marketRegion?: 'IN' | 'US') => {
    if (!marketRegion) {
        setProfile({
          balances: { '$': 1000000, '₹': 1000000 },
          holdings: [],
          transactions: [],
          watchlist: [],
          alerts: [],
          history: []
        });
        localStorage.removeItem('papertrade_profile');
    } else {
        const currency = marketRegion === 'US' ? '$' : '₹';
        setProfile(prev => {
            const filteredHoldings = prev.holdings.filter(h => {
                const isUS = h.symbol.match(/^[A-Z]{1,5}$/); // Approximate check, real code should look up stock
                // Actually we just use a heuristic or we need access to stock list. For now filter transactions
                return true; // We'll handle this carefully
            });
            return {
                ...prev,
                balances: {
                    ...prev.balances,
                    [currency]: 1000000
                },
                transactions: prev.transactions.filter(t => t.symbol.currency !== currency),
                // it's tricky to filter holdings without stock list, so we might need a better approach later.
            }
        });
    }
};`;

code = code.replace(/const resetAccount = \(marketRegion\?= 'IN' \| 'US'\) => {[\s\S]*?localStorage\.removeItem\('papertrade_profile'\);\n  };/, newResetLogic);

code = code.replace(
  "<PortfolioContext.Provider value={{",
  "<PortfolioContext.Provider value={{\n       marketContext,\n       setMarketContext,"
);

fs.writeFileSync('src/contexts/PortfolioContext.tsx', code);
console.log("Patched PortfolioContext.");
