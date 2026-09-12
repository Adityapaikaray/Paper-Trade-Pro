const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  /const { theme, toggleTheme, addToast, toggleMobileMenu } = useUI\(\);/,
  "const { addToast, toggleMobileMenu } = useUI();\n  const { theme, toggleTheme } = useTheme();"
);

code = code.replace(
  /import { useUI } from '\.\.\/contexts\/UIContext\.tsx';/,
  "import { useUI } from '../contexts/UIContext.tsx';\nimport { useTheme } from '../contexts/ThemeContext.tsx';"
);

// Fix the button: Show Sun if dark, Moon if light. Also make it always visible.
code = code.replace(
  /\{\/\* Theme Toggle \(Hidden visually since strictly black\) \*\/\}\s*<button\s*onClick=\{toggleTheme\}\s*className="[^"]*hidden sm:flex"\s*title="Toggle Light \/ Dark Mode"\s*>\s*<Moon size=\{18\} strokeWidth=\{1\.5\} \/>\s*<\/button>/,
  `{/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-ui-surface text-text-muted hover:text-primary hover:bg-ui-surface-hover border border-ui-border flex items-center justify-center transition-all shadow-md sm:flex"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
        </button>`
);

fs.writeFileSync('src/components/TopBar.tsx', code);
