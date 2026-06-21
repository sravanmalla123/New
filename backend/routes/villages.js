const express = require('express');
const { getDb } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/villages - list all villages with optional filters
router.get('/', (req, res) => {
  const { state, district, phase, status, search, limit = 50, offset = 0 } = req.query;
  const db = getDb();

  let query = 'SELECT * FROM villages WHERE 1=1';
  const params = [];

  if (state) { query += ' AND state = ?'; params.push(state); }
  if (district) { query += ' AND district = ?'; params.push(district); }
  if (phase) { query += ' AND phase = ?'; params.push(parseInt(phase)); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND (name LIKE ? OR block LIKE ? OR gram_panchayat LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const totalQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
  const total = db.prepare(totalQuery).get(...params);

  query += ' ORDER BY score DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const villages = db.prepare(query).all(...params);
  res.json({ villages, total: total.count });
});

// GET /api/villages/states - list distinct states
router.get('/states', (req, res) => {
  const db = getDb();
  const states = db.prepare('SELECT DISTINCT state FROM villages ORDER BY state').all();
  res.json(states.map(s => s.state));
});

// GET /api/villages/map - all villages with coordinates for map
router.get('/map', (req, res) => {
  const db = getDb();
  const villages = db.prepare('SELECT id, name, state, district, score, lat, lng, adarsh_gram_declared, phase FROM villages').all();
  res.json(villages);
});

// GET /api/villages/:id - village detail
router.get('/:id', (req, res) => {
  const db = getDb();
  const village = db.prepare('SELECT * FROM villages WHERE id = ?').get(req.params.id);
  if (!village) return res.status(404).json({ error: 'Village not found' });

  const indicators = db.prepare('SELECT * FROM village_indicators WHERE village_id = ?').all(village.id);
  const works = db.prepare('SELECT * FROM works WHERE village_id = ? ORDER BY created_at DESC').all(village.id);
  const images = db.prepare('SELECT gi.*, u.name as uploader_name, u.org_name FROM gallery_images gi LEFT JOIN users u ON gi.uploaded_by = u.id WHERE gi.village_id = ? AND gi.status = ? ORDER BY gi.created_at DESC').all(village.id, 'approved');

  res.json({ ...village, indicators, works, images });
});

// POST /api/villages - add village (admin only)
router.post('/', authMiddleware, requireRole('super_admin', 'state_admin'), (req, res) => {
  const { name, state, district, block, gram_panchayat, phase, sc_population,
          total_population, total_households, lat, lng } = req.body;

  if (!name || !state || !district || !block) {
    return res.status(400).json({ error: 'Name, state, district, block are required' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO villages (name, state, district, block, gram_panchayat, phase, sc_population, total_population, total_households, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, state, district, block, gram_panchayat || '', parseInt(phase) || 1,
         parseInt(sc_population) || 0, parseInt(total_population) || 0, parseInt(total_households) || 0,
         parseFloat(lat) || 20.5937, parseFloat(lng) || 78.9629);

  res.status(201).json({ message: 'Village added successfully', id: result.lastInsertRowid });
});

// PUT /api/villages/:id - update village (admin only)
router.put('/:id', authMiddleware, requireRole('super_admin', 'state_admin', 'district_admin'), (req, res) => {
  const { name, state, district, block, gram_panchayat, phase, score, sc_population,
          total_population, total_households, lat, lng, vdp_status, adarsh_gram_declared } = req.body;

  const db = getDb();
  const village = db.prepare('SELECT id FROM villages WHERE id = ?').get(req.params.id);
  if (!village) return res.status(404).json({ error: 'Village not found' });

  db.prepare(`
    UPDATE villages SET name=COALESCE(?,name), state=COALESCE(?,state), district=COALESCE(?,district),
    block=COALESCE(?,block), gram_panchayat=COALESCE(?,gram_panchayat), phase=COALESCE(?,phase),
    score=COALESCE(?,score), sc_population=COALESCE(?,sc_population), total_population=COALESCE(?,total_population),
    total_households=COALESCE(?,total_households), lat=COALESCE(?,lat), lng=COALESCE(?,lng),
    vdp_status=COALESCE(?,vdp_status), adarsh_gram_declared=COALESCE(?,adarsh_gram_declared)
    WHERE id = ?
  `).run(name, state, district, block, gram_panchayat, phase ? parseInt(phase) : null,
         score ? parseFloat(score) : null, sc_population ? parseInt(sc_population) : null,
         total_population ? parseInt(total_population) : null, total_households ? parseInt(total_households) : null,
         lat ? parseFloat(lat) : null, lng ? parseFloat(lng) : null, vdp_status,
         adarsh_gram_declared !== undefined ? (adarsh_gram_declared ? 1 : 0) : null,
         req.params.id);

  res.json({ message: 'Village updated successfully' });
});

module.exports = router;
