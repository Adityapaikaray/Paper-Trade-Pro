const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

if (!code.includes('const { user, logout } = useAuth();')) {
  code = code.replace(
    'const { logout } = useAuth();',
    'const { user, logout } = useAuth();'
  );
  
  code = code.replace(
    /PU<\/div>/,
    '{user?.name?.substring(0, 2).toUpperCase() || "PU"}</div>'
  );
  
  code = code.replace(
    /<p className="text-xs font-bold text-text-main leading-tight group-hover:text-primary transition-colors">Prestige User<\/p>/,
    '<p className="text-xs font-bold text-text-main leading-tight group-hover:text-primary transition-colors">{user?.name || "Prestige User"}</p>'
  );
  
  code = code.replace(
    /<p className="text-sm font-bold text-text-main">Prestige User<\/p>/,
    '<p className="text-sm font-bold text-text-main">{user?.name || "Prestige User"}</p>'
  );
  
  code = code.replace(
    /<p className="text-xs text-text-muted">user@tradepro\.com<\/p>/,
    '<p className="text-xs text-text-muted">{user?.email || "user@tradepro.com"}</p>'
  );
  
  fs.writeFileSync('src/components/TopBar.tsx', code);
  console.log('Patched TopBar with user details');
}
