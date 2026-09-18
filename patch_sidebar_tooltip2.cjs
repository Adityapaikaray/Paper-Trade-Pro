const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Put back overflow-y-auto
code = code.replace("overflow-visible", "overflow-y-auto custom-scrollbar");

// Remove custom tooltip divs
code = code.replace(/\{!isExpanded && \(\s*<div className="absolute left-full[^>]+>\s*\{item\.label\}\s*<\/div>\s*\)\}/g, "");

fs.writeFileSync('src/components/Sidebar.tsx', code);
