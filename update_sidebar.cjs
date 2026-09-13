const fs = require('fs');

let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// Show the sidebar on all screens, just reduce padding/gaps slightly on very small screens
code = code.replace(
  /className="hidden md:flex w-20 rounded-\[24px\] bg-gradient-to-b from-ui-surface-hover to-transparent border border-ui-border flex-col items-center py-6 relative shrink-0"/,
  'className="flex w-16 md:w-20 rounded-[24px] bg-gradient-to-b from-ui-surface-hover to-transparent border border-ui-border flex-col items-center py-4 md:py-6 relative shrink-0"'
);

// Adjust the top padding of main section slightly for mobile
code = code.replace(
  /className="flex-1 flex flex-col py-6 pr-6 md:pr-10 pl-4 md:pl-2"/,
  'className="flex-1 flex flex-col py-4 md:py-6 pr-4 md:pr-10 pl-0 md:pl-2"'
);

// Adjust text sizes slightly for mobile
code = code.replace(
  /text-\[40px\] font-bold text-text-main leading-none mb-1/,
  'text-[32px] md:text-[40px] font-bold text-text-main leading-none mb-1'
);

code = code.replace(
  /text-\[32px\] font-mono font-bold text-text-main mb-1\.5 leading-none/,
  'text-[24px] md:text-[32px] font-mono font-bold text-text-main mb-1.5 leading-none'
);

code = code.replace(
  /text-\[22px\] font-mono font-bold text-text-main/g,
  'text-[18px] md:text-[22px] font-mono font-bold text-text-main'
);

code = code.replace(
  /text-\[22px\] leading-none/g,
  'text-[18px] md:text-[22px] leading-none'
);

code = code.replace(
  /text-\[22px\] font-mono font-bold text-text-main leading-none/g,
  'text-[18px] md:text-[22px] font-mono font-bold text-text-main leading-none'
);

// Right align the top section only on desktop, keep it left-aligned on mobile to save space
code = code.replace(
  /className="text-left md:text-right"/,
  'className="text-left md:text-right mt-4 md:mt-0"'
);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
