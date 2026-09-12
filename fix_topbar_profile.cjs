const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  /const { user, profile, logout } = useAuth\(\);/,
  "const { user, logout } = useAuth();"
);

code = code.replace(
  /const { marketContext, setMarketContext } = usePortfolio\(\);/,
  "const { profile, marketContext, setMarketContext } = usePortfolio();"
);

code = code.replace(/profile\.balances\?\./g, "profile?.balances?.");

fs.writeFileSync('src/components/TopBar.tsx', code);
