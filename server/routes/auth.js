// ---------- AUTH ROUTES: register, login, "who am I" ----------
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create a login token that is valid for 7 days
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Only send safe fields back to the browser (never the password hash)
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, isAdmin: u.isAdmin });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password needs 6+ characters' });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: 'This email is already registered' });

  const hashed = await bcrypt.hash(password, 10); // scramble the password before saving
  const user = await User.create({ name, email, password: hashed });
  res.status(201).json({ token: makeToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  // compare() checks the typed password against the saved hash
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Wrong email or password' });
  }
  res.json({ token: makeToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me  (used by the frontend to restore the session after a page refresh)
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
