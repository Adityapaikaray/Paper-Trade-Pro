const fs = require('fs');
let code = fs.readFileSync('src/components/MobileNavigationDrawer.tsx', 'utf8');

code = code.replace(
  "? 'bg-ui-surface-hover text-text-main font-medium'",
  "? 'bg-ui-surface-hover text-primary font-bold'"
);

fs.writeFileSync('src/components/MobileNavigationDrawer.tsx', code);
