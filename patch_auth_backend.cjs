const fs = require('fs');

const authCode = `
// --- Mock Authentication Backend ---
const users = new Map(); // email -> { name, email, password }
const sessions = new Map(); // token -> email

// Seed a test user
users.set('investor@tradepro.com', {
  name: 'Prestige User',
  email: 'investor@tradepro.com',
  password: 'Password123'
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (users.has(email)) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }
  users.set(email, { name, email, password });
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, email);
  res.json({ token, user: { name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect. Please try again.' });
  }
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, email);
  res.json({ token, user: { name: user.name, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const email = sessions.get(token);
  if (!email) {
    return res.status(401).json({ error: 'Session expired' });
  }
  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ user: { name: user.name, email: user.email } });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  
  // Simulate network delay and sending an email
  setTimeout(() => {
    // We intentionally don't reveal if the user exists for security reasons,
    // but in a real system we would generate a token and send an email if they do.
    res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  }, 1000);
});
// ------------------------------------
`;

const lines = fs.readFileSync('server.ts', 'utf8').split('\\n');
const insertIndex = lines.findIndex(line => line.includes('app.use(express.json());')) + 1;

lines.splice(insertIndex, 0, authCode);
fs.writeFileSync('server.ts', lines.join('\\n'));
console.log('Mock auth endpoints added to server.ts');
