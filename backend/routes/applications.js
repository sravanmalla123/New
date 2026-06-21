const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/applications - list all applications (admin)
router.get('/', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const { status, limit = 20, offset = 0 } = req.query;
  const db = getDb();

  let query = 'SELECT * FROM applications WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }

  const total = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params);
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const applications = db.prepare(query).all(...params);
  res.json({ applications, total: total.count });
});

// GET /api/applications/:id - single application
router.get('/:id', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

// POST /api/applications - submit application (public)
router.post('/', (req, res) => {
  const { org_name, org_type, email, phone, address, city, state, pincode,
          contact_person, contact_designation, areas_of_interest, proposed_contribution,
          student_count, faculty_count } = req.body;

  if (!org_name || !email || !phone || !contact_person) {
    return res.status(400).json({ error: 'org_name, email, phone, and contact_person are required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM applications WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Application from this email already submitted' });

  const result = db.prepare(`
    INSERT INTO applications (org_name, org_type, email, phone, address, city, state, pincode,
    contact_person, contact_designation, areas_of_interest, proposed_contribution, student_count, faculty_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(org_name, org_type || 'College', email.toLowerCase(), phone, address || '', city || '',
         state || '', pincode || '', contact_person, contact_designation || '',
         areas_of_interest || '', proposed_contribution || '',
         parseInt(student_count) || 0, parseInt(faculty_count) || 0);

  res.status(201).json({
    message: 'Application submitted successfully! Our team will review and contact you within 5-7 business days.',
    id: result.lastInsertRowid
  });
});

// PUT /api/applications/:id/approve - approve application + create user account
router.put('/:id/approve', authMiddleware, requireRole('super_admin'), (req, res) => {
  const { admin_notes } = req.body;
  const db = getDb();

  const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (application.status !== 'pending') return res.status(400).json({ error: 'Application already processed' });

  // Create user account for the college
  const tempPassword = 'Welcome@' + Math.floor(1000 + Math.random() * 9000);
  const hashedPassword = bcrypt.hashSync(tempPassword, 10);

  // Check if user already exists
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(application.email);
  let userId = existingUser ? existingUser.id : null;

  if (!existingUser) {
    const userResult = db.prepare(`
      INSERT INTO users (name, email, password, role, org_name, org_type, phone, state, status)
      VALUES (?, ?, ?, 'college', ?, ?, ?, ?, 'active')
    `).run(application.contact_person, application.email, hashedPassword,
           application.org_name, application.org_type, application.phone, application.state || '');
    userId = userResult.lastInsertRowid;
  }

  db.prepare(`
    UPDATE applications SET status = 'approved', admin_notes = ?, reviewed_at = datetime('now'), user_id = ? WHERE id = ?
  `).run(admin_notes || '', userId, application.id);

  res.json({
    message: 'Application approved. User account created.',
    temp_password: tempPassword,
    email: application.email,
    note: 'Please share login credentials with the college/university'
  });
});

// PUT /api/applications/:id/reject - reject application
router.put('/:id/reject', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const { admin_notes } = req.body;
  const db = getDb();

  const application = db.prepare('SELECT id FROM applications WHERE id = ?').get(req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });

  db.prepare(`
    UPDATE applications SET status = 'rejected', admin_notes = ?, reviewed_at = datetime('now') WHERE id = ?
  `).run(admin_notes || '', req.params.id);

  res.json({ message: 'Application rejected' });
});

module.exports = router;
