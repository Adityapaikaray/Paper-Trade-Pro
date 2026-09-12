const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

if (!code.includes('import { useAuth }')) {
  code = code.replace(
    "import { usePortfolio } from '../contexts/PortfolioContext.tsx';",
    "import { usePortfolio } from '../contexts/PortfolioContext.tsx';\nimport { useAuth } from '../contexts/AuthContext.tsx';"
  );
}

if (!code.includes('const { logout } = useAuth();')) {
  code = code.replace(
    "const { addToast } = useUI();",
    "const { addToast } = useUI();\n  const { logout } = useAuth();"
  );
}

code = code.replace(
  "onClick={() => { setProfileOpen(false); addToast('Logged out successfully', 'success'); }}",
  "onClick={() => { setProfileOpen(false); logout(); addToast('Logged out successfully', 'success'); }}"
);

fs.writeFileSync('src/components/TopBar.tsx', code);
console.log("Patched TopBar.tsx");
