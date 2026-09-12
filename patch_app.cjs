const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard imports with new ones
code = code.replace(
  "import LoginView from './components/LoginView.tsx';",
  "import LoginView from './components/LoginView.tsx';\nimport SignupView from './components/SignupView.tsx';\nimport ForgotPasswordView from './components/ForgotPasswordView.tsx';"
);

// Add authView state
code = code.replace(
  "const [showSplash, setShowSplash] = useState(true);",
  "const [showSplash, setShowSplash] = useState(true);\n  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');"
);

// Update Auth Views logic
code = code.replace(
  "{!showSplash && !isAuthenticated && <LoginView />}",
  `{!showSplash && !isAuthenticated && (
            authView === 'login' ? <LoginView onNavigate={setAuthView} /> :
            authView === 'signup' ? <SignupView onNavigate={setAuthView} /> :
            <ForgotPasswordView onNavigate={setAuthView} />
          )}`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for Auth Views");
