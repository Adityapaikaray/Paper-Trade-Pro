const fs = require('fs');

let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// The user asked for "premium dark-themed" specifically for this UI. 
// We should hardcode the dark theme colors for this card to strictly match the prompt's request.
code = code.replace(
  /className="flex flex-col md:flex-row bg-ui-surface rounded-\[32px\] border border-ui-border p-2 gap-6 overflow-hidden shadow-sm hover:border-primary\/30 transition-colors"/g,
  'className="flex flex-col md:flex-row bg-black rounded-[32px] border border-[#242424] p-2 gap-6 overflow-hidden shadow-2xl transition-colors"'
);

// Sidebar
code = code.replace(
  /className="flex w-16 md:w-20 rounded-\[24px\] bg-gradient-to-b from-ui-surface-hover to-transparent border border-ui-border flex-col items-center py-4 md:py-6 relative shrink-0"/g,
  'className="flex w-16 md:w-20 rounded-[24px] bg-gradient-to-b from-[#111111] to-transparent border border-[#242424] flex-col items-center py-4 md:py-6 relative shrink-0"'
);

// Timeline line
code = code.replace(
  /w-px bg-ui-border/g,
  'w-px bg-[#242424]'
);

// 3-dot menu
code = code.replace(
  /bg-ui-bg border border-ui-border/g,
  'bg-black border border-[#242424]'
);

// Pills
code = code.replace(
  /bg-ui-bg\/50/g,
  'bg-transparent'
);
code = code.replace(
  /border border-ui-border text-\[10px\] font-bold text-text-muted/g,
  'border border-[#333333] text-[10px] font-bold text-[#8C8C8C]'
);

// Headers and text
code = code.replace(
  /text-text-main/g,
  'text-white'
);
code = code.replace(
  /text-text-muted/g,
  'text-[#8C8C8C]'
);

// The header
code = code.replace(
  /<h2 className="text-4xl font-bold text-white leading-none">Positions<\/h2>/,
  '<h2 className="text-[32px] md:text-[40px] font-bold text-white leading-none">Positions</h2>'
);

// Allocation pie chart background
code = code.replace(
  /bg-ui-surface-hover overflow-hidden flex items-center justify-center border border-ui-border/g,
  'bg-[#111111] overflow-hidden flex items-center justify-center border border-[#333333]'
);
code = code.replace(
  /var\(--color-primary\)/g,
  '#D4AF37'
);
code = code.replace(
  /var\(--ui-border\)/g,
  '#242424'
);
code = code.replace(
  /bg-ui-surface rounded-full/g,
  'bg-black rounded-full'
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
