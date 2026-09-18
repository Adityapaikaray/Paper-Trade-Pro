const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

code = code.replace(/import \{ fileURLToPath \} from 'url';/, '');
code = code.replace(/const __filename = fileURLToPath\(import\.meta\.url\);/, '');
code = code.replace(/const __dirname = path\.dirname\(__filename\);/, '');
// just use process.cwd()
code = code.replace(/const dbPath = path\.resolve\(process\.cwd\(\), 'instruments\.json'\);/, `const dbPath = path.resolve(process.cwd(), 'instruments.json');`);

fs.writeFileSync('src/server/db.ts', code);
