const fs = require('fs');
['src/components/LoginView.tsx', 'src/components/SignupView.tsx', 'src/components/ForgotPasswordView.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/!\/\^\\S\+@\\S\+\\S\\S\+\$\/\.test\(email\)/g, '!/^\\\\S+@\\\\S+\\\\.\\\\S+$/.test(email)');
    fs.writeFileSync(file, code);
  }
});
console.log('Fixed regex 3');
