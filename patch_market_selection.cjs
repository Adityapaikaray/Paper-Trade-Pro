const fs = require('fs');
let code = fs.readFileSync('src/components/MarketSelection.tsx', 'utf8');

code = code.replace(
  /<button className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">\s*Explore Indian Markets\s*<\/button>/,
  `<button onClick={() => handleSelect('IN')} className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">
                Explore Indian Markets
              </button>`
);

code = code.replace(
  /<button className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">\s*Explore US Markets\s*<\/button>/,
  `<button onClick={() => handleSelect('US')} className="w-full py-3 rounded-xl border border-ui-border text-text-main font-semibold hover:bg-ui-surface-hover transition-colors">
                Explore US Markets
              </button>`
);

fs.writeFileSync('src/components/MarketSelection.tsx', code);
console.log("Patched MarketSelection.tsx");
