const fs = require('fs');
const path = require('path');

const directory = 'src';

const replacements = [
  // Rename tailwind classes / css vars
  { regex: /gold/g, replacement: 'primary' },
  // Hardcoded hexes
  { regex: /#B7873D/gi, replacement: '#6366F1' }, // Primary Indigo 500
  { regex: /#F6F4EB/gi, replacement: '#EEF2FF' }, // Light Indigo 50
  { regex: /#E9E4D4/gi, replacement: '#E0E7FF' }, // Border Indigo 100
  { regex: /#D4AF37/gi, replacement: '#6366F1' },
  { regex: /#F3E5AB/gi, replacement: '#818CF8' },
  { regex: /#AA8C2C/gi, replacement: '#4338CA' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      
      // Also let's fix some specific text like "Trade smarter. A brighter tomorrow." which was in gold. That's fine.
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
