const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsView.tsx', 'utf8');

code = code.replace(
  /<button\s*onClick=\{[^}]*\}\s*className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-ui-surface-hover text-gray-700 dark:text-text-main text-xs font-bold hover:opacity-80 transition-opacity border border-transparent dark:border-ui-border"\s*>\s*<DollarSign size=\{14\} \/> USD \(\$\)\s*<\/button>/g,
  ''
);

fs.writeFileSync('src/components/SettingsView.tsx', code);
console.log("Patched SettingsView");
