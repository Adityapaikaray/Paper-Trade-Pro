const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

// Remove "+ Add Market" button
code = code.replace(
  /<div className="h-px bg-ui-border my-2" \/>\s*<button\s*onClick=\{[^}]*\}\s*className="w-full text-left px-4 py-2 text-xs font-bold text-primary hover:text-primary-light transition-colors flex items-center gap-2"\s*>\s*\+ Add Market\s*<\/button>/g,
  ''
);

// Remove hardcoded '3' from notifications
code = code.replace(
  /<span className="absolute top-1\.5 right-1\.5 w-3\.5 h-3\.5 bg-rose-500 rounded-full border-2 border-ui-bg flex items-center justify-center text-\[8px\] font-bold text-white leading-none">3<\/span>/g,
  ''
);

fs.writeFileSync('src/components/TopBar.tsx', code);
console.log("Patched TopBar");
