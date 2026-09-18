const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Remove overflow-hidden from buttons
code = code.replace(/active:scale-\[0\.98\] overflow-hidden/g, 'active:scale-[0.98]');

// Make the nav overflow visible so tooltip can escape
code = code.replace("overflow-y-auto custom-scrollbar", "overflow-visible");

fs.writeFileSync('src/components/Sidebar.tsx', code);
