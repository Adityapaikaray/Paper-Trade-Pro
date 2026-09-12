const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const authCode = `
// AUTHENTICATION MOCK BACKEND
const users = new Map();
const sessions = new Map();
const crypto = require('crypto');

app.post('/api/auth/signup', express.json(), (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users.has(email)) return res.status(400).json({ error: 'User already exists' });
  
  users.set(email, { name, email, password });
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, email);
  res.json({ token, user: { name, email } });
});

app.post('/api/auth/login', express.json(), (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Email or password is incorrect. Please try again.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, email);
  res.json({ token, user: { name: user.name, email: user.email } });
});

app.post('/api/auth/forgot-password', express.json(), (req, res) => {
  const { email } = req.body;
  // Always return success to not leak user existence, or just a simple mock
  res.json({ message: 'If that email is in our system, a reset link has been sent.' });
});

app.post('/api/auth/logout', express.json(), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) sessions.delete(token);
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const email = sessions.get(token);
  if (!email) return res.status(401).json({ error: 'Unauthorized' });
  const user = users.get(email);
  res.json({ user: { name: user.name, email: user.email } });
});
`;

serverCode = serverCode.replace(
  '// API routes go here FIRST',
  '// API routes go here FIRST\n' + authCode
);

fs.writeFileSync('server.ts', serverCode);
