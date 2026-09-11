const fs = require('fs');
const path = require('path');

const directory = 'src';

const replacements = [
  // Revert Amber back to Champagne Gold Theme
  { regex: /#F59E0B/gi, replacement: '#D4AF37' }, // Gold
  { regex: /#FFFBEB/gi, replacement: '#F6F4EB' }, // Light bg
  { regex: /#FEF3C7/gi, replacement: '#E9E4D4' }, // Borders
  { regex: /#FCD34D/gi, replacement: '#F3E5AB' }, // Light Gold
  { regex: /#D97706/gi, replacement: '#AA8C2C' }, // Dark Gold
  
  // Update App name and taglines if they were changed or just leave them to be replaced in components
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
