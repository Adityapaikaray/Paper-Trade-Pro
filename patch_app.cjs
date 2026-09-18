const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import MobileMoreMenu from './components/MobileMoreMenu.tsx';", "import MobileNavigationDrawer from './components/MobileNavigationDrawer.tsx';");
code = code.replace("<MobileMoreMenu />", "<MobileNavigationDrawer />");

fs.writeFileSync('src/App.tsx', code);
