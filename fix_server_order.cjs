const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const splitPoint = code.indexOf('// --- Mock Authentication Backend ---');
if (splitPoint !== -1) {
  const authCode = code.substring(splitPoint);
  let mainCode = code.substring(0, splitPoint);
  
  // Remove the auth code from the bottom
  
  // Insert it after app.use(express.json());
  mainCode = mainCode.replace('app.use(express.json());', 'app.use(express.json());\n' + authCode + '\n');
  
  fs.writeFileSync('server.ts', mainCode);
  console.log('Fixed server.ts order');
}
