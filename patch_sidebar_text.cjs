const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// For primary navigation
code = code.replace(
  "                  ? 'bg-ui-surface-hover text-text-main font-medium shadow-sm'",
  "                  ? 'bg-ui-surface-hover text-primary font-bold shadow-sm'"
);

// We also need to fix the span text color if it's explicitly set.
// Currently: <span className="text-sm z-10 transition-colors tracking-wide truncate">
// Actually the parent div has the text color, so it inherits it.

fs.writeFileSync('src/components/Sidebar.tsx', code);
