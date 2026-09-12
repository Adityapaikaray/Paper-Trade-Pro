const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

if (!code.includes('useTheme')) {
  code = code.replace(
    /import \{ usePortfolio \} from '\.\.\/contexts\/PortfolioContext\.tsx';/,
    "import { usePortfolio } from '../contexts/PortfolioContext.tsx';\nimport { useTheme } from '../contexts/ThemeContext.tsx';"
  );
  code = code.replace(
    /const \{ profile \} = usePortfolio\(\);/,
    "const { profile } = usePortfolio();\n  const { theme } = useTheme();\n  const isDark = theme === 'dark';"
  );
}

// Replace premiumMode hardcoded colors with theme variables or checks
code = code.replace(/stopColor="#00D084"/g, 'stopColor={isDark ? "#00D084" : "#00A878"}');
code = code.replace(/stroke=\{premiumMode \? "#222222" : "var\(--ui-border\)"\}/g, 'stroke="var(--ui-border)"');
code = code.replace(/fill: premiumMode \? '#8C8C8C' : 'var\(--text-muted\)'/g, "fill: 'var(--text-muted)'");
code = code.replace(/fill: '#8C8C8C'/g, "fill: 'var(--text-muted)'");
code = code.replace(/stroke: '#00D084'/g, "stroke: isDark ? '#00D084' : '#00A878'");
code = code.replace(/stroke=\{premiumMode \? "#00D084" : "url\(#splitColor\)"\}/g, 'stroke={premiumMode ? (isDark ? "#00D084" : "#00A878") : "url(#splitColor)"}');
code = code.replace(/fill: '#00D084', stroke: '#FFFFFF'/g, "fill: isDark ? '#00D084' : '#00A878', stroke: isDark ? '#FFFFFF' : '#0B1728'");

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
