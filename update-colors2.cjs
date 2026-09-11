const fs = require('fs');
const path = require('path');

const directory = 'src';

const replacements = [
  // Hardcoded hexes
  { regex: /#6366F1/gi, replacement: '#F59E0B' }, // Amber 500
  { regex: /#EEF2FF/gi, replacement: '#FFFBEB' }, // Amber 50
  { regex: /#E0E7FF/gi, replacement: '#FEF3C7' }, // Amber 100
  { regex: /#818CF8/gi, replacement: '#FCD34D' }, // Amber 300
  { regex: /#4338CA/gi, replacement: '#D97706' }, // Amber 600
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
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
