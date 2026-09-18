const fs = require('fs');
let code = fs.readFileSync('src/components/BottomMarketTicker.tsx', 'utf8');

const targetItem = `<div
        key={\`\${keyPrefix}-\${item.id}\`}
        onClick={() => {
          if (item.stockRef && onTrade) {
            onTrade(item.stockRef);
          }
        }}
        title={item.stockRef ? \`Click to trade \${item.symbol} (\${formatPrice(item.price, item.currency)})\` : item.name}
        className={\`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono border transition-all duration-200 shrink-0 select-none \${baseChipClass} \${tickClass}\`}
      >`;

const replaceItem = `<button
        key={\`\${keyPrefix}-\${item.id}\`}
        onClick={() => {
          if (item.stockRef && onTrade) {
            onTrade(item.stockRef);
          }
        }}
        tabIndex={0}
        aria-label={\`\${item.name || item.symbol}, price \${item.price}, \${item.isPositive ? 'up' : 'down'} \${Math.abs(item.percentChange || 0).toFixed(2)} percent\`}
        title={item.stockRef ? \`Click to trade \${item.symbol} (\${formatPrice(item.price, item.currency)})\` : item.name}
        className={\`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono border transition-all duration-200 shrink-0 select-none focus:outline-none focus:ring-2 focus:ring-primary \${baseChipClass} \${tickClass}\`}
      >`;

code = code.replace(targetItem, replaceItem);
code = code.replace(/<\/div>\n    \);\n  \};\n\n  return \(/, `</button>\n    );\n  };\n\n  return (`);

fs.writeFileSync('src/components/BottomMarketTicker.tsx', code);
