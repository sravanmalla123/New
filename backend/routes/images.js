const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/images - get approved images (public, for carousel & gallery)
router.get('/', (req, res) => {
  const { category, village_id, show_on_home, limit = 20, offset = 0 } = req.query;
  const db = getDb();

  let query = `
    SELECT gi.*, v.name as village_name, v.state as village_state, v.district as village_district,
           u.name as uploader_name, u.org_name as uploader_org
    FROM gallery_images gi
    LEFT JOIN villages v ON gi.village_id = v.id
    LEFT JOIN users u ON gi.uploaded_by = u.id
    WHERE gi.status = 'approved'
  `;
  const params = [];

  if (category) { query += ' AND gi.category = ?'; params.push(category); }
  if (village_id) { query += ' AND gi.village_id = ?'; params.push(parseInt(village_id)); }
  if (show_on_home === 'true' || show_on_home === '1') { query += ' AND gi.show_on_home = 1'; }

  const totalQuery = query.replace(/SELECT gi\.\*.*?FROM gallery_images gi/s, 'SELECT COUNT(*) as count FROM gallery_images gi');
  const total = db.prepare(totalQuery).get(...params);

  query += ' ORDER BY gi.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const images = db.prepare(query).all(...params);
  res.json({ images, total: total ? total.count : 0 });
});

// GET /api/images/pending - pending images for admin approval
router.get('/pending', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  const images = db.prepare(`
    SELECT gi.*, v.name as village_name, u.name as uploader_name, u.org_name as uploader_org
    FROM gallery_images gi
    LEFT JOIN villages v ON gi.village_id = v.id
    LEFT JOIN users u ON gi.uploaded_by = u.id
    WHERE gi.status = 'pending'
    ORDER BY gi.created_at DESC
  `).all();
  res.json(images);
});

// POST /api/images/upload - upload image (authorized college or admin)
router.post('/upload', authMiddleware, requireRole('super_admin', 'state_admin', 'district_admin', 'college'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

  const { village_id, title, description, category, show_on_home } = req.body;
  if (!title) return res.status(400).json({ error: 'Image title is required' });

  const db = getDb();

  // Colleges need approval; admins auto-approved
  const isAdmin = ['super_admin', 'state_admin'].includes(req.user.role);
  const status = isAdmin ? 'approved' : 'pending';
  const showOnHome = isAdmin && (show_on_home === 'true' || show_on_home === '1') ? 1 : 0;

  const result = db.prepare(`
    INSERT INTO gallery_images (village_id, uploaded_by, title, description, category, filename, status, show_on_home, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    village_id ? parseInt(village_id) : null,
    req.user.id, title, description || '', category || 'development',
    req.file.filename, status, showOnHome,
    isAdmin ? new Date().toISOString() : null
  );

  res.status(201).json({
    message: isAdmin ? 'Image uploaded and published successfully' : 'Image uploaded and pending admin approval',
    imageId: result.lastInsertRowid,
    status
  });
});

// PUT /api/images/:id/approve - admin approves image
router.put('/:id/approve', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const { show_on_home } = req.body;
  const db = getDb();

  const image = db.prepare('SELECT id FROM gallery_images WHERE id = ?').get(req.params.id);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  db.prepare(`
    UPDATE gallery_images SET status = 'approved', show_on_home = ?, approved_at = datetime('now') WHERE id = ?
  `).run(show_on_home ? 1 : 0, req.params.id);

  res.json({ message: 'Image approved successfully' });
});

// PUT /api/images/:id/reject - admin rejects image
router.put('/:id/reject', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  const image = db.prepare('SELECT id, filename FROM gallery_images WHERE id = ?').get(req.params.id);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  db.prepare("UPDATE gallery_images SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Image rejected' });
});

// DELETE /api/images/:id - delete image
router.delete('/:id', authMiddleware, requireRole('super_admin'), (req, res) => {
  const db = getDb();
  const image = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(req.params.id);
  if (!image) return res.status(404).json({ error: 'Image not found' });

  // Delete file if it exists
  const uploadDir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
  const filePath = path.join(uploadDir, image.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM gallery_images WHERE id = ?').run(req.params.id);
  res.json({ message: 'Image deleted successfully' });
});

// PUT /api/images/:id/toggle-home - toggle show on homepage
router.put('/:id/toggle-home', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const db = getDb();
  const image = db.prepare('SELECT id, show_on_home FROM gallery_images WHERE id = ? AND status = ?').get(req.params.id, 'approved');
  if (!image) return res.status(404).json({ error: 'Image not found or not approved' });

  const newVal = image.show_on_home ? 0 : 1;
  db.prepare('UPDATE gallery_images SET show_on_home = ? WHERE id = ?').run(newVal, req.params.id);
  res.json({ message: `Image ${newVal ? 'added to' : 'removed from'} homepage`, show_on_home: newVal });
});

module.exports = router;
