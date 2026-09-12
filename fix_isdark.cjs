const fs = require('fs');

let code = fs.readFileSync('src/components/PortfolioGraph.tsx', 'utf8');

// Add import if missing
if (!code.includes("import { useTheme }")) {
  code = code.replace(
    /import \{ motion \} from 'framer-motion';/,
    "import { motion } from 'framer-motion';\nimport { useTheme } from '../contexts/ThemeContext.tsx';"
  );
}

// Add variable declaration inside the component
if (!code.includes("const isDark")) {
  code = code.replace(
    /const \[timeRange, setTimeRange\] = useState<'1m' \| '5m' \| '15m' \| 'ALL'>\('ALL'\);/,
    "const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'ALL'>('ALL');\n  const { theme } = useTheme();\n  const isDark = theme === 'dark';"
  );
}

fs.writeFileSync('src/components/PortfolioGraph.tsx', code);
