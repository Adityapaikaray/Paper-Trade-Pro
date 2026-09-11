const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert imports
code = code.replace(
  "import NewsView from './components/NewsView.tsx';",
  "import NewsView from './components/NewsView.tsx';\nimport SettingsView from './components/SettingsView.tsx';\nimport HelpSupportView from './components/HelpSupportView.tsx';"
);

// Insert into renderView
code = code.replace(
  "case 'news':\n        return <NewsView />;",
  "case 'news':\n        return <NewsView />;\n      case 'settings':\n        return <SettingsView />;\n      case 'help':\n        return <HelpSupportView />;"
);

fs.writeFileSync('src/App.tsx', code);
