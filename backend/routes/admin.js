const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users - list all users
router.get('/users', authMiddleware, requireRole('super_admin'), (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, org_name, org_type, state, status, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// POST /api/admin/users - create a new admin user
router.post('/users', authMiddleware, requireRole('super_admin'), (req, res) => {
  const { name, email, password, role, org_name, state, phone } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: 'name, email, password, role required' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const result = db.prepare(`
    INSERT INTO users (name, email, password, role, org_name, state, phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(name, email.toLowerCase(), bcrypt.hashSync(password, 10), role, org_name || '', state || '', phone || '');

  res.status(201).json({ message: 'User created', id: result.lastInsertRowid });
});

// PUT /api/admin/users/:id/status - activate/deactivate user
router.put('/users/:id/status', authMiddleware, requireRole('super_admin'), (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const db = getDb();
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully` });
});

// GET /api/admin/dashboard - dashboard summary
router.get('/dashboard', authMiddleware, requireRole('super_admin', 'state_admin', 'district_admin'), (req, res) => {
  const db = getDb();

  const pendingImages = db.prepare("SELECT COUNT(*) as count FROM gallery_images WHERE status = 'pending'").get();
  const pendingApps = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'").get();
  const totalVillages = db.prepare('SELECT COUNT(*) as count FROM villages').get();
  const adarshGram = db.prepare("SELECT COUNT(*) as count FROM villages WHERE adarsh_gram_declared = 1").get();

  const recentImages = db.prepare(`
    SELECT gi.id, gi.title, gi.category, gi.status, gi.created_at, gi.filename,
           u.name as uploader_name, u.org_name, v.name as village_name
    FROM gallery_images gi
    LEFT JOIN users u ON gi.uploaded_by = u.id
    LEFT JOIN villages v ON gi.village_id = v.id
    ORDER BY gi.created_at DESC LIMIT 5
  `).all();

  const recentApplications = db.prepare(`
    SELECT id, org_name, org_type, email, contact_person, status, created_at
    FROM applications ORDER BY created_at DESC LIMIT 5
  `).all();

  res.json({
    pending_images: pendingImages.count,
    pending_applications: pendingApps.count,
    total_villages: totalVillages.count,
    adarsh_gram_declared: adarshGram.count,
    recent_images: recentImages,
    recent_applications: recentApplications
  });
});

// POST /api/admin/news - add news item
router.post('/news', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const { title, content, link, is_featured } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO news_items (title, content, link, is_featured, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, content || '', link || '', is_featured ? 1 : 0, req.user.id);

  res.status(201).json({ message: 'News item added', id: result.lastInsertRowid });
});

// DELETE /api/admin/news/:id
router.delete('/news/:id', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM news_items WHERE id = ?').run(req.params.id);
  res.json({ message: 'News item deleted' });
});

// GET /api/admin/funds - list fund data
router.get('/funds', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  const funds = db.prepare('SELECT * FROM funds ORDER BY created_at DESC').all();
  res.json(funds);
});

// POST /api/admin/funds - add fund record
router.post('/funds', authMiddleware, requireRole('super_admin'), (req, res) => {
  const { state, district, amount_released, amount_utilized, financial_year, sanction_order } = req.body;
  if (!state || !amount_released) return res.status(400).json({ error: 'state and amount_released required' });

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO funds (state, district, amount_released, amount_utilized, financial_year, sanction_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(state, district || '', parseFloat(amount_released), parseFloat(amount_utilized) || 0,
         financial_year || '', sanction_order || '');

  res.status(201).json({ message: 'Fund record added', id: result.lastInsertRowid });
});

module.exports = router;
