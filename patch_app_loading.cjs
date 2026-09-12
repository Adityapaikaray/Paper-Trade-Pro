const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "const { isAuthenticated } = useAuth();",
  "const { isAuthenticated, loading } = useAuth();"
);

code = code.replace(
  "{showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}",
  "{showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}\n          {loading && !showSplash && <div className=\"h-screen w-screen bg-ui-bg flex items-center justify-center\"><div className=\"w-8 h-8 border-4 border-ui-border border-t-primary rounded-full animate-spin\"></div></div>}"
);

code = code.replace(
  "{!showSplash && !isAuthenticated && (",
  "{!loading && !showSplash && !isAuthenticated && ("
);

code = code.replace(
  "{!showSplash && isAuthenticated && marketContext === null && <MarketSelection onComplete={() => {}} />}",
  "{!loading && !showSplash && isAuthenticated && marketContext === null && <MarketSelection onComplete={() => {}} />}"
);

code = code.replace(
  "{(!showSplash && isAuthenticated && marketContext !== null) && (",
  "{(!loading && !showSplash && isAuthenticated && marketContext !== null) && ("
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Auth loading");
