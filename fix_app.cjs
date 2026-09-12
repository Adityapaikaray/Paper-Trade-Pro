const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert imports
if (!code.includes('import { AuthProvider, useAuth }')) {
  code = code.replace(
    "import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext.tsx';",
    "import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';\nimport { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext.tsx';"
  );
}
if (!code.includes('import LoginView')) {
  code = code.replace(
    "import MarketSelection from './components/MarketSelection.tsx';",
    "import MarketSelection from './components/MarketSelection.tsx';\nimport LoginView from './components/LoginView.tsx';"
  );
}

// Wrap with AuthProvider
code = code.replace(
  "    <UIProvider>\n      <ThemeProvider>\n        <MarketProvider>\n          <PortfolioProvider>\n            <AppContent />\n          </PortfolioProvider>\n        </MarketProvider>\n      </ThemeProvider>\n    </UIProvider>",
  "    <UIProvider>\n      <ThemeProvider>\n        <AuthProvider>\n          <MarketProvider>\n            <PortfolioProvider>\n              <AppContent />\n            </PortfolioProvider>\n          </MarketProvider>\n        </AuthProvider>\n      </ThemeProvider>\n    </UIProvider>"
);

// Modify AppContent
if (!code.includes('const { isAuthenticated } = useAuth();')) {
  code = code.replace(
    "function AppContent() {\n  const { marketContext } = usePortfolio();",
    "function AppContent() {\n  const { isAuthenticated } = useAuth();\n  const { marketContext } = usePortfolio();"
  );
}

// Render logic
code = code.replace(
  "{!showSplash && marketContext === null && <MarketSelection onComplete={() => {}} />}",
  "{!showSplash && !isAuthenticated && <LoginView />}\n          {!showSplash && isAuthenticated && marketContext === null && <MarketSelection onComplete={() => {}} />}"
);

code = code.replace(
  "{(!showSplash && marketContext !== null) && (",
  "{(!showSplash && isAuthenticated && marketContext !== null) && ("
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
