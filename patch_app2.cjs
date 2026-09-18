const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import BottomNav from './components/BottomNav.tsx';", "");
code = code.replace("<BottomNav />", "");

fs.writeFileSync('src/App.tsx', code);
