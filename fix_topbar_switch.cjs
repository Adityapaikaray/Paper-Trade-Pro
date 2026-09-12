const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

code = code.replace(
  /\{\/\* Theme Toggle \*\/\}\s*<button[\s\S]*?<\/button>/,
  `{/* Theme Toggle Switch */}
        <div 
          onClick={toggleTheme}
          className="hidden sm:flex items-center bg-ui-surface border border-ui-border rounded-full p-1 cursor-pointer shadow-md transition-all relative w-16 h-8 hover:border-primary/50"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="w-full flex justify-between px-1.5 z-10 text-text-muted">
            <Sun size={14} strokeWidth={theme === 'light' ? 2 : 1.5} className={theme === 'light' ? 'text-primary' : 'opacity-50'} />
            <Moon size={14} strokeWidth={theme === 'dark' ? 2 : 1.5} className={theme === 'dark' ? 'text-primary' : 'opacity-50'} />
          </div>
          <div 
            className={\`absolute w-6 h-6 rounded-full bg-ui-surface-hover border border-primary/30 shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-transform duration-500 ease-in-out \${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}\`} 
          />
        </div>`
);

fs.writeFileSync('src/components/TopBar.tsx', code);
