const fs = require('fs');
let code = fs.readFileSync('src/components/SplashScreen.tsx', 'utf8');
code = code.replace(/2000/, '1500'); // Reduce duration as requested
fs.writeFileSync('src/components/SplashScreen.tsx', code);
console.log("Updated Splash Screen timing successfully.");
