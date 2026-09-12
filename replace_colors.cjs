const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Backgrounds
      content = content.replace(/bg-\[\#000000\]/gi, 'bg-ui-bg');
      content = content.replace(/bg-\[\#050505\]/gi, 'bg-ui-sidebar');
      content = content.replace(/bg-\[\#0A0A0A\]/gi, 'bg-ui-surface');
      content = content.replace(/bg-\[\#101010\]/gi, 'bg-ui-surface-hover');
      content = content.replace(/bg-\[\#111111\]/gi, 'bg-ui-surface-hover');
      
      // Borders
      content = content.replace(/border-\[\#222222\]/gi, 'border-ui-border');
      content = content.replace(/border-\[\#242424\]/gi, 'border-ui-border');
      
      // Texts
      content = content.replace(/text-\[\#8C8C8C\]/gi, 'text-text-muted');
      content = content.replace(/text-\[\#F5F5F0\]/gi, 'text-text-main');
      content = content.replace(/text-white/gi, 'text-text-main');
      content = content.replace(/text-\[\#FFFFFF\]/gi, 'text-text-main');
      
      // Primary / Gold
      content = content.replace(/text-\[\#D4AF37\]/gi, 'text-primary');
      content = content.replace(/bg-\[\#D4AF37\]/gi, 'bg-primary');
      content = content.replace(/border-\[\#D4AF37\]/gi, 'border-primary');
      content = content.replace(/text-\[\#F0C75E\]/gi, 'text-primary-light');
      
      // Positive / Emerald
      content = content.replace(/text-\[\#00D084\]/gi, 'text-positive');
      content = content.replace(/bg-\[\#00D084\]/gi, 'bg-positive');
      content = content.replace(/border-\[\#00D084\]/gi, 'border-positive');
      content = content.replace(/shadow-\[0_0_5px_\#00D084\]/gi, 'shadow-[0_0_5px_var(--color-positive)]');
      
      // Negative / Red
      content = content.replace(/text-\[\#FF5C5C\]/gi, 'text-negative');
      content = content.replace(/bg-\[\#FF5C5C\]/gi, 'bg-negative');
      
      // Shadows
      content = content.replace(/shadow-\[0_2px_10px_rgba\(0,0,0,0\.5\)\]/gi, 'shadow-md');
      content = content.replace(/shadow-\[0_4px_15px_rgba\(212,175,55,0\.1\)\]/gi, 'shadow-primary/10');
      content = content.replace(/shadow-\[0_20px_40px_rgba\(0,0,0,0\.8\)\]/gi, 'shadow-2xl');
      content = content.replace(/shadow-\[0_0_10px_rgba\(212,175,55,0\.2\)\]/gi, 'shadow-primary/20');
      
      // Remove other hardcoded dark mode colors that might be lurking
      content = content.replace(/bg-\[\#121212\]/gi, 'bg-ui-surface-hover');
      content = content.replace(/border-\[\#333333\]/gi, 'border-ui-border');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('src/components');
processDir('src/contexts');
