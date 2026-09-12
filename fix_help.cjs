const fs = require('fs');
let code = fs.readFileSync('src/components/HelpSupportView.tsx', 'utf8');

code = code.replace(/bg-\[#F6F4EB\] dark:bg-primary\/10/g, 'bg-ui-surface-hover');
code = code.replace(/border-\[#E9E4D4\] dark:border-primary\/20/g, 'border-ui-border');
code = code.replace(/bg-white dark:bg-primary\/20/g, 'bg-ui-surface border border-ui-border');

fs.writeFileSync('src/components/HelpSupportView.tsx', code);
