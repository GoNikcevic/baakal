const { Router } = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = Router();

// POST /api/auth/register — Create a new account
router.post('/register', async (req, res) => {
  const { email, password, name, company } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if email already exists
  const existing = db.users.getByEmail(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  // First user becomes admin
  const isFirstUser = db.users.count() === 0;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = db.users.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    name: name.trim(),
    company: company?.trim() || null,
    role: isFirstUser ? 'admin' : 'client',
  });

  // Assign existing unowned campaigns to the first user
  if (isFirstUser) {
    try {
      db.getDb().prepare('UPDATE campaigns SET user_id = ? WHERE user_id IS NULL').run(user.id);
      db.getDb().prepare('UPDATE chat_threads SET user_id = ? WHERE user_id IS NULL').run(user.id);
    } catch { /* columns may not exist yet */ }
  }

  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// POST /api/auth/login — Sign in
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.getByEmail(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, company: user.company, role: user.role },
  });
});

// GET /api/auth/me — Get current user info (requires auth)
router.get('/me', requireAuth, (req, res) => {
  const user = db.users.getById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

module.exports = router;
