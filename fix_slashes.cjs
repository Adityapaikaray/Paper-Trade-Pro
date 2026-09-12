const fs = require('fs');
['src/components/LoginView.tsx', 'src/components/SignupView.tsx', 'src/components/ForgotPasswordView.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/\\`/g, '`');
    fs.writeFileSync(file, code);
  }
});
console.log('Fixed backticks');
