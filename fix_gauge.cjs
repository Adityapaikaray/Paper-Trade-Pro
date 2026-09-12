const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

if (!code.includes('const { theme } = useTheme();')) {
  code = code.replace(
    /const \{ profile, marketContext, addFunds \} = usePortfolio\(\);/,
    "const { profile, marketContext, addFunds } = usePortfolio();\n  const { theme } = useTheme();"
  );
  code = code.replace(
    /import \{ usePortfolio \} from '\.\.\/contexts\/PortfolioContext\.tsx';/,
    "import { usePortfolio } from '../contexts/PortfolioContext.tsx';\nimport { useTheme } from '../contexts/ThemeContext.tsx';"
  );
}

// Fix labels
code = code.replace(/fill="#8C8C8C"/g, 'fill="var(--text-muted)"');

// Fix segments
code = code.replace(/stroke="#FF5C5C"/g, 'stroke="var(--color-negative)"');
code = code.replace(/stroke="#D4AF37"/g, 'stroke="var(--color-primary)"');
code = code.replace(/stroke="#00D084"/g, 'stroke="var(--color-positive)"');
code = code.replace(/style=\{\{ filter: 'drop-shadow\(0 0 14px rgba\(0,208,132,0\.4\)\)' \}\}/g, 'style={{ filter: theme === \'dark\' ? \'drop-shadow(0 0 14px rgba(0,208,132,0.4))\' : \'none\' }}');

// Fix glow-green filter
code = code.replace(/<feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0\.8" floodColor="#000000" \/>/g, '<feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity={theme === \'dark\' ? "0.8" : "0.2"} floodColor={theme === \'dark\' ? "#000000" : "#0B1728"} />');

// Fix Needle
code = code.replace(/stopColor="#333333"/g, 'stopColor={theme === \'dark\' ? "#333333" : "#D4D4D4"}');
code = code.replace(/stopColor="#F5F5F0"/g, 'stopColor={theme === \'dark\' ? "#F5F5F0" : "#0B1728"}');
code = code.replace(/stopColor="#111111"/g, 'stopColor={theme === \'dark\' ? "#111111" : "#FFFFFF"}');

code = code.replace(/fill="#111111" stroke="#333333"/g, 'fill={theme === \'dark\' ? "#111111" : "#FFFFFF"} stroke={theme === \'dark\' ? "#333333" : "#D4D4D4"}');
code = code.replace(/fill="#D4AF37"/g, 'fill="var(--color-primary)"');

code = code.replace(/drop-shadow-\[0_0_15px_rgba\(0,208,132,0\.5\)\]/g, '${theme === \'dark\' ? \'drop-shadow-[0_0_15px_rgba(0,208,132,0.5)]\' : \'\'}');

fs.writeFileSync('src/components/DashboardView.tsx', code);
