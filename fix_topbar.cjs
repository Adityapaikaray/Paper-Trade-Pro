const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  /<div className="w-full h-full bg-ui-bg rounded-full flex items-center justify-center text-gold-dark font-black uppercase text-sm">\s*PU\s*<\/div>/,
  '<div className="w-full h-full bg-[#B7873D] rounded-full flex items-center justify-center text-white font-black uppercase text-sm">\\n                  JD\\n                </div>'
);

code = code.replace(
  'placeholder="Search for symbols, news, or commands..."',
  'placeholder="Search assets, ETFs, sectors...          /"'
);

// also fix the text for Prestige User to James Doe
code = code.replace(
  '<p className="text-xs font-bold text-text-main leading-tight group-hover:text-gold transition-colors">Prestige User</p>',
  '<p className="text-xs font-bold text-gray-900 dark:text-text-main leading-tight group-hover:text-gold transition-colors">James Doe</p>'
);

fs.writeFileSync('src/components/TopBar.tsx', code);
