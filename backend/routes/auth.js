const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND status = ?').get(email.toLowerCase(), 'active');

  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, org_name: user.org_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      org_name: user.org_name,
      state: user.state
    }
  });
});

// POST /api/auth/register (College/University application)
router.post('/register', (req, res) => {
  const { org_name, org_type, email, phone, address, city, state, pincode,
          contact_person, contact_designation, areas_of_interest, proposed_contribution,
          student_count, faculty_count } = req.body;

  if (!org_name || !email || !phone || !contact_person) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const db = getDb();

  // Check if application already exists
  const existing = db.prepare('SELECT id FROM applications WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Application with this email already exists' });

  const result = db.prepare(`
    INSERT INTO applications (org_name, org_type, email, phone, address, city, state, pincode,
    contact_person, contact_designation, areas_of_interest, proposed_contribution, student_count, faculty_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(org_name, org_type || 'College', email.toLowerCase(), phone, address || '', city || '',
         state || '', pincode || '', contact_person, contact_designation || '', areas_of_interest || '',
         proposed_contribution || '', parseInt(student_count) || 0, parseInt(faculty_count) || 0);

  res.status(201).json({
    message: 'Application submitted successfully! You will receive login credentials via email once approved.',
    applicationId: result.lastInsertRowid
  });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, org_name, org_type, phone, state, status, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required' });
  if (new_password.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(new_password, 10), req.user.id);
  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
