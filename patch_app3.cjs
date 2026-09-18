const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("className=\"flex-1 flex flex-col min-w-0 pb-28 md:pb-10 relative\"", "className=\"flex-1 flex flex-col min-w-0 pb-10 relative\"");

fs.writeFileSync('src/App.tsx', code);
